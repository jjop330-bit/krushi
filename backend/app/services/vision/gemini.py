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
    AlternativeDiagnosis,
    ScanStatusEnum
)

class GeminiVisionProvider(BasePestDetector):
    """
    Two-Stage Server-Side Multimodal Vision Provider.
    
    STAGE 1: Subject screening (rejection of non-agricultural images, other insects,
             healthy crops, damaged leaves without visible insects, unclear images).
    STAGE 2: Strict species-level identification on candidate agricultural pests only.
    
    Adheres strictly to the rule: Never force one of the 5 pests.
    Never enable pesticide treatment without confirmed identification.
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
        scan_id = f"scan-{uuid.uuid4().hex[:12]}"
        now = int(time.time() * 1000)
        
        # Fast local pre-rejection for corrupted, blank, or heavily blurred captures
        if not quality.is_clear and not forced_pest_id:
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)

        # If forced_pest_id is provided (benchmark / sample verification mode)
        if forced_pest_id:
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)

        # If no Gemini API key configured, use honest baseline fallback
        if not settings.GEMINI_API_KEY:
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)

        try:
            b64_data = base64.b64encode(image_bytes).decode("utf-8")
            
            system_prompt = (
                "You are Krushi Mitra AI's senior agricultural entomologist and computer vision specialist for Odisha, India.\n"
                "You analyze photographs uploaded by rice farmers to identify insect pests with extreme scientific rigor.\n\n"
                "CRITICAL OPERATIONAL RULES:\n"
                "1. DO NOT assume the photograph contains a rice pest.\n"
                "2. DO NOT force an identification into our supported pests if it does not belong to them.\n"
                "3. NON-AGRICULTURAL IMAGES (humans, selfies, cars, animals, furniture, everyday objects, buildings, indoor scenes) "
                "MUST be classified as 'NON_AGRICULTURAL_IMAGE'.\n"
                "4. HEALTHY CROPS without insects or visible damage MUST be classified as 'HEALTHY_CROP'.\n"
                "5. CROP DAMAGE WITHOUT VISIBLE INSECTS (e.g. yellowing, leaf holes, spots with no insect present) "
                "MUST be classified as 'CROP_DAMAGE_NO_VISIBLE_INSECT'. (Leaf damage alone cannot scientifically prove species identity).\n"
                "6. INSECTS THAT ARE NOT ONE OF THE 5 SUPPORTED PESTS (e.g., ladybugs, butterflies, flies, dragonflies, bees, stinkbugs, "
                "grasshoppers, or beneficial predators like Lycosa wolf spiders) MUST be classified as 'OTHER_INSECT'.\n"
                "7. UNCLEAR / BLURRY IMAGES where diagnostic anatomy cannot be distinguished MUST be classified as 'UNCLEAR_IMAGE'.\n\n"
                "THE 5 SUPPORTED ODISHA RICE PESTS ARE STRICTLY:\n"
                "1. 'bph': Brown Planthopper (Nilaparvata lugens) - small brown sucking insect, macropterous/brachypterous, on stem base.\n"
                "2. 'stem_borer': Yellow Stem Borer (Scirpophaga incertulas) - yellow/white moth with dark spot or larva inside stem creating dead heart/whitehead.\n"
                "3. 'leaf_folder': Rice Leaf Folder (Cnaphalocrocis medinalis) - green caterpillar inside longitudinally folded leaf blade with white scrape marks.\n"
                "4. 'rice_hispa': Rice Hispa (Dicladispa armigera) - small blue-black beetle with sharp dorsal spines scraping parallel white streaks.\n"
                "5. 'armyworm': Rice Armyworm (Mythimna separata) - smooth striped caterpillar defoliating foliage or clipping panicles.\n\n"
                "RESPOND ONLY WITH A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:\n"
                "{\n"
                '  "status": "IDENTIFIED" | "OTHER_INSECT" | "NO_INSECT" | "HEALTHY_CROP" | "CROP_DAMAGE_NO_VISIBLE_INSECT" | "UNCLEAR_IMAGE" | "NON_AGRICULTURAL_IMAGE" | "UNKNOWN",\n'
                '  "pest_id": "bph" | "stem_borer" | "leaf_folder" | "rice_hispa" | "armyworm" | "beneficial_spider" | null,\n'
                '  "common_name": "Common English Name or null",\n'
                '  "scientific_name": "Scientific Name in italics or null",\n'
                '  "confidence": number between 0 and 100 or null,\n'
                '  "confidence_type": "model_raw" | null,\n'
                '  "visual_evidence": ["observable anatomical or damage feature 1", "feature 2"],\n'
                '  "crop": "Rice" | "Other" | "None",\n'
                '  "life_stage": "Adult" | "Larva" | "Nymph" | "Egg" | "Unknown",\n'
                '  "reason": "Clear explanation of the determination based strictly on visible features",\n'
                '  "crop_damage_analysis": "Comprehensive scientific explanation of how this insect attacks the crop: feeding mechanism, specific plant tissues affected, visible field symptoms (e.g. hopperburn, dead hearts, whiteheads, leaf scraping, defoliation), vector risks, and estimated yield loss impact.",\n'
                '  "crop_damage_analysis_or": "ଓଡ଼ିଆରେ ଫସଲ କ୍ଷତିର ବିସ୍ତୃତ ବର୍ଣ୍ଣନା (କୀଟ କିପରି ଫସଲକୁ ନଷ୍ଟ କରେ ଏବଂ କେତେ ପ୍ରତିଶତ କ୍ଷତି କରିପାରେ)",\n'
                '  "limitations": ["limitation 1", "limitation 2"],\n'
                '  "needs_better_image": boolean,\n'
                '  "treatment_allowed": boolean (MUST BE false unless status is IDENTIFIED and pest is one of the 5 supported rice pests),\n'
                '  "expert_review_recommended": boolean\n'
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
                    "temperature": 0.05,
                    "response_mime_type": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(endpoint, json=payload)
                if response.status_code != 200:
                    return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)
                
                resp_json = response.json()
                raw_text = resp_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(raw_text)

            # Validate Status
            status_str = parsed.get("status", "UNKNOWN").upper()
            if status_str not in [s.value for s in ScanStatusEnum]:
                status_str = "UNKNOWN"
            status = ScanStatusEnum(status_str)

            # Extract fields
            pest_id = parsed.get("pest_id")
            if pest_id not in ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm", "beneficial_spider"]:
                pest_id = None
            
            raw_conf = parsed.get("confidence")
            confidence = float(raw_conf) if isinstance(raw_conf, (int, float)) else None
            
            # STRICT TREATMENT GATING RULE (Section 9):
            # Treatment is permitted ONLY if status == IDENTIFIED and pest_id is one of the 5 pests and confidence >= 70
            treatment_allowed = False
            if (
                status == ScanStatusEnum.IDENTIFIED
                and pest_id in ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm"]
                and confidence is not None
                and confidence >= 70.0
            ):
                treatment_allowed = True

            # If pest_id is recognized, obtain authoritative Odia and agronomic data
            common_name_or = None
            immediate_actions_en = []
            immediate_actions_or = []
            potential_damage = None
            severity = SeverityEnum.LOW
            
            if pest_id:
                knowledge = get_pest_knowledge(pest_id)
                common_name_or = knowledge.get("common_name_or")
                if treatment_allowed:
                    immediate_actions_en = knowledge.get("immediate_next_steps_en", [])
                    immediate_actions_or = knowledge.get("immediate_next_steps_or", [])
                    potential_damage = knowledge.get("potential_damage_percent")
                    if pest_id in ["bph", "armyworm"]:
                        severity = SeverityEnum.SEVERE
                    else:
                        severity = SeverityEnum.MODERATE
            elif status == ScanStatusEnum.HEALTHY_CROP:
                common_name_or = "ସୁସ୍ଥ ଧାନ ଫସଲ"
                immediate_actions_en = ["Continue regular scouting. No pesticide intervention required."]
                immediate_actions_or = ["ନିୟମିତ ତଦାରଖ ଜାରି ରଖନ୍ତୁ। କୌଣସି କୀଟନାଶକର ଆବଶ୍ୟକତା ନାହିଁ।"]
            elif status == ScanStatusEnum.OTHER_INSECT:
                common_name_or = "ଅନ୍ୟ କୀଟ (କୃଷି ମିତ୍ର AI ରେ ଅସମର୍ଥିତ)"
                immediate_actions_en = ["Do not spray broad-spectrum insecticides. Consult local KVK before taking action."]
                immediate_actions_or = ["ବିନା ପରାମର୍ଶରେ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ମତାମତ ନିଅନ୍ତୁ।"]
            elif status == ScanStatusEnum.CROP_DAMAGE_NO_VISIBLE_INSECT:
                common_name_or = "ପତ୍ର କ୍ଷତି (ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)"
                immediate_actions_en = ["Examine leaf sheaths, stem base, and soil for live insects. Take a close-up photograph of any insects found."]
                immediate_actions_or = ["ଗଛ ମୂଳ ଓ ପତ୍ର ସନ୍ଧିରେ ଜୀବନ୍ତ ପୋକ ଖୋଜନ୍ତୁ। ପୋକ ଦେଖାଗଲେ ତାର ନିକଟବର୍ତ୍ତୀ ଫଟୋ ନିଅନ୍ତୁ।"]
            elif status == ScanStatusEnum.NON_AGRICULTURAL_IMAGE:
                common_name_or = "ଅଣ-କୃଷି ଫଟୋ"
                immediate_actions_en = ["Please upload a photograph of a rice crop or agricultural pest."]
                immediate_actions_or = ["ଦୟାକରି ଧାନ ଫସଲ କିମ୍ବା କୀଟର ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।"]

            crop_damage_analysis = parsed.get("crop_damage_analysis")
            crop_damage_analysis_or = parsed.get("crop_damage_analysis_or")

            return PestAnalysisResponse(
                scan_id=scan_id,
                created_at=now,
                status=status,
                common_name=parsed.get("common_name"),
                common_name_or=common_name_or,
                scientific_name=parsed.get("scientific_name"),
                pest_id=pest_id,
                confidence=confidence,
                confidence_type="model_raw" if confidence is not None else None,
                visual_evidence=parsed.get("visual_evidence", []),
                crop=parsed.get("crop", "Rice"),
                crop_id=crop_id,
                life_stage=parsed.get("life_stage", "Unknown"),
                reason=parsed.get("reason", "Analysis completed via multimodal vision evaluation."),
                crop_damage_analysis=crop_damage_analysis,
                crop_damage_analysis_or=crop_damage_analysis_or,
                ai_inferred_damage_en=crop_damage_analysis or (knowledge.get("key_symptoms_en", [""])[0] if pest_id else None),
                ai_inferred_damage_or=crop_damage_analysis_or or (knowledge.get("key_symptoms_or", [""])[0] if pest_id else None),
                limitations=parsed.get("limitations", []),
                needs_better_image=bool(parsed.get("needs_better_image", False)),
                treatment_allowed=treatment_allowed,
                expert_review_recommended=bool(parsed.get("expert_review_recommended", not treatment_allowed)),
                quality_assessment=quality,
                severity_assessment=severity,
                potential_yield_loss_range=potential_damage,
                immediate_actions_en=immediate_actions_en,
                immediate_actions_or=immediate_actions_or,
                source_model=settings.GEMINI_MODEL,
                farmer_district=farmer_district,
                is_sample_scan=False,
                identification=PestIdentification(
                    pest_id=PestIdEnum(pest_id) if pest_id else PestIdEnum.UNCERTAIN,
                    common_name_en=parsed.get("common_name") or "Uncertain",
                    common_name_or=common_name_or or "ଅନିଶ୍ଚିତ",
                    scientific_name=parsed.get("scientific_name"),
                    confidence=int(confidence) if confidence is not None else None,
                    certainty_tier=CertaintyTierEnum.HIGH if (confidence and confidence >= 80) else CertaintyTierEnum.UNCERTAIN
                )
            )

        except Exception as e:
            # Fallback to verified baseline in case of parsing / network error
            return await self.fallback.analyze(image_bytes, crop_id, farmer_district, forced_pest_id)
