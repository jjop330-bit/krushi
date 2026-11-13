import json
import base64
import time
import uuid
from typing import Optional
import httpx
from app.core.config import settings
from app.services.vision.base import BasePestDetector
from app.services.vision.quality import validate_image_bytes
from app.services.vision.baseline import VerifiedExpertBaselineProvider
from app.services.knowledge import get_pest_knowledge
from app.models.pest import (
    PestAnalysisResponse,
    PestIdentification,
    PestIdEnum,
    SeverityEnum,
    CertaintyTierEnum,
    AlternativeDiagnosis
)

class GeminiVisionProvider(BasePestDetector):
    """
    Secure server-side Gemini Vision API integration.
    Enforces structured JSON extraction and validates results with Pydantic.
    """
    
    def __init__(self):
        self.fallback = VerifiedExpertBaselineProvider()

    async def analyze(
        self,
        image_bytes: bytes,
        crop_id: str = "paddy",
        farmer_district: str = "bargarh",
        forced_pest_id: Optional[str] = None
    ) -> PestAnalysisResponse:
        quality = validate_image_bytes(image_bytes)
        
        # If photograph quality failed, return uncertain diagnosis immediately
        if not quality.is_clear and not forced_pest_id:
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)

        # If no API key configured on server, fallback to verified baseline
        if not settings.GEMINI_API_KEY:
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)

        try:
            b64_data = base64.b64encode(image_bytes).decode("utf-8")
            
            system_prompt = (
                "You are Krushi Mitra AI's senior agricultural entomologist for Odisha, India. "
                "Analyze this rice crop photograph for insect pests. "
                "Supported Odisha rice pests: "
                "1. 'bph': Brown Planthopper (Nilaparvata lugens) "
                "2. 'stem_borer': Yellow Stem Borer (Scirpophaga incertulas) "
                "3. 'leaf_folder': Rice Leaf Folder (Cnaphalocrocis medinalis) "
                "4. 'rice_hispa': Rice Hispa (Dicladispa armigera) "
                "5. 'armyworm': Rice Armyworm / Ear-cutting caterpillar (Mythimna separata) "
                "6. 'beneficial_spider': Lycosa pseudoannulata Wolf spider (beneficial predator - NOT A PEST) "
                "7. 'healthy_paddy': Healthy rice plant without damage "
                "8. 'uncertain': Inconclusive observation. "
                "Respond ONLY with valid JSON conforming strictly to: "
                "{"
                '  "pest_id": "bph" | "stem_borer" | "leaf_folder" | "rice_hispa" | "armyworm" | "beneficial_spider" | "healthy_paddy" | "uncertain",'
                '  "confidence": number between 0 and 100,'
                '  "observed_visual_features": ["feature 1", "feature 2"],'
                '  "ai_inferred_damage": "brief explanation",'
                '  "severity_assessment": "Low" | "Moderate" | "Severe" | "Critical",'
                '  "potential_yield_loss_range": "e.g. 20% - 40%",'
                '  "alternative_possibilities": [{"pest_id": "leaf_folder", "name_en": "Rice Leaf Folder", "confidence": 15}],'
                '  "expert_review_required": boolean'
                "}"
            )

            endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": system_prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/jpeg",
                                    "data": b64_data
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "response_mime_type": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(endpoint, json=payload)
                if response.status_code != 200:
                    # Fallback to verified baseline
                    return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)
                
                resp_json = response.json()
                raw_text = resp_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(raw_text)

            matched_id = parsed.get("pest_id", "uncertain")
            if matched_id not in [p.value for p in PestIdEnum]:
                matched_id = "uncertain"
            
            knowledge = get_pest_knowledge(matched_id)
            confidence = int(parsed.get("confidence", 85))

            return PestAnalysisResponse(
                scan_id=f"scan-{uuid.uuid4().hex[:12]}",
                created_at=int(time.time() * 1000),
                crop_id=crop_id,
                quality_assessment=quality,
                identification=PestIdentification(
                    pest_id=PestIdEnum(matched_id),
                    common_name_en=knowledge["common_name_en"],
                    common_name_or=knowledge["common_name_or"],
                    scientific_name=knowledge["scientific_name"],
                    local_name=knowledge["local_odisha_name"],
                    confidence=confidence,
                    certainty_tier=CertaintyTierEnum.HIGH if confidence >= 80 else CertaintyTierEnum.MODERATE
                ),
                alternative_possibilities=[
                    AlternativeDiagnosis(
                        pest_id=alt.get("pest_id", "uncertain"),
                        name_en=alt.get("name_en", alt.get("pest_id")),
                        name_or=get_pest_knowledge(alt.get("pest_id", "uncertain"))["common_name_or"],
                        confidence=int(alt.get("confidence", 10))
                    )
                    for alt in parsed.get("alternative_possibilities", [])
                ],
                observed_visual_features=parsed.get("observed_visual_features", [
                    f"Characteristic morphological patterns corresponding to {knowledge['scientific_name']}."
                ]),
                ai_inferred_damage_en=parsed.get("ai_inferred_damage", knowledge["potential_damage_percent"]),
                ai_inferred_damage_or=knowledge["key_symptoms_or"][0],
                severity_assessment=SeverityEnum(parsed.get("severity_assessment", "Moderate")),
                potential_yield_loss_range=parsed.get("potential_yield_loss_range", knowledge["potential_damage_percent"]),
                immediate_actions_en=knowledge["immediate_next_steps_en"],
                immediate_actions_or=knowledge["immediate_next_steps_or"],
                expert_review_required=parsed.get("expert_review_required", confidence < 75),
                source_model=settings.GEMINI_MODEL,
                is_sample_scan=False,
                farmer_district=farmer_district
            )

        except Exception:
            # Safe, transparent fallback to verified baseline
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)
