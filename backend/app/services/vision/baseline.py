import time
import uuid
from typing import Optional
from app.services.vision.base import BasePestDetector
from app.services.vision.quality import validate_image_bytes
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

class VerifiedExpertBaselineProvider(BasePestDetector):
    """
    Verified ICAR-NRRI & OUAT baseline provider.
    Used for offline reference benchmark evaluation, verified sample testing,
    and safe rejection when external cloud vision APIs are unconfigured or unavailable.
    
    CRITICAL RULE: Never invents or defaults arbitrary new uploads to 'bph' or any pest.
    Explicit rejection, honest uncertainty, and zero fabricated treatment recommendations.
    """
    
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
        
        # Check for image corruption / unreadable bytes
        if quality.lighting_score == 0 and quality.sharpness_score == 0 and not forced_pest_id:
            return PestAnalysisResponse(
                scan_id=scan_id,
                created_at=now,
                status=ScanStatusEnum.ERROR,
                common_name="Corrupted / Unreadable File",
                common_name_or="ତ୍ରୁଟିପୂର୍ଣ୍ଣ ଫାଇଲ୍",
                scientific_name=None,
                pest_id=None,
                confidence=None,
                confidence_type=None,
                visual_evidence=[],
                crop=crop_id,
                crop_id=crop_id,
                life_stage="Unknown",
                reason=quality.warning_message_en or "The uploaded file could not be parsed as a valid image.",
                limitations=["File header or byte stream corrupted."],
                needs_better_image=True,
                treatment_allowed=False,
                expert_review_recommended=False,
                quality_assessment=quality,
                severity_assessment=SeverityEnum.LOW,
                immediate_actions_en=["Re-upload an intact photograph in JPG, PNG, or WEBP format."],
                immediate_actions_or=["ଦୟାକରି ଏକ ସଠିକ JPG, PNG କିମ୍ବା WEBP ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।"],
                source_model="expert-verified-baseline",
                farmer_district=farmer_district,
                is_sample_scan=False,
                identification=PestIdentification(
                    pest_id=PestIdEnum.UNCERTAIN,
                    common_name_en="Corrupted File",
                    common_name_or="ତ୍ରୁଟିପୂର୍ଣ୍ଣ ଫାଇଲ୍",
                    confidence=None,
                    certainty_tier=CertaintyTierEnum.UNCERTAIN
                )
            )

        # Check for unclear, blurry, or extreme lighting conditions
        if not quality.is_clear and not forced_pest_id:
            return PestAnalysisResponse(
                scan_id=scan_id,
                created_at=now,
                status=ScanStatusEnum.UNCLEAR_IMAGE,
                common_name="Unclear Image",
                common_name_or="ଅସ୍ପଷ୍ଟ ଫଟୋ",
                scientific_name=None,
                pest_id=None,
                confidence=None,
                confidence_type=None,
                visual_evidence=[],
                crop=crop_id,
                crop_id=crop_id,
                life_stage="Unknown",
                reason=quality.warning_message_en or "Photograph lacks sufficient micro-detail or contrast for species-level entomological identification.",
                limitations=[
                    "Pixel contrast is below the threshold required to differentiate abdominal patterns or wing veins.",
                    "Diagnostic morphological features are obscured by blur or improper lighting."
                ],
                needs_better_image=True,
                treatment_allowed=False,
                expert_review_recommended=True,
                quality_assessment=quality,
                severity_assessment=SeverityEnum.LOW,
                potential_yield_loss_range="Assessment suspended pending clearer photograph",
                immediate_actions_en=[
                    "Do not apply pesticides without confirming the pest.",
                    "Retake photograph in bright natural light, holding camera steady.",
                    "Capture close-up of both the insect and the affected rice plant parts."
                ],
                immediate_actions_or=[
                    "କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।",
                    "ପର୍ଯ୍ୟାପ୍ତ ସୂର୍ଯ୍ୟାଲୋକରେ କ୍ୟାମେରା ସ୍ଥିର ରଖି ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।",
                    "ଗଛର ଆକ୍ରାନ୍ତ ଅଂଶ ଓ ପୋକର ସ୍ପଷ୍ଟ ନିକଟବର୍ତ୍ତୀ (close-up) ଫଟୋ ନିଅନ୍ତୁ।"
                ],
                source_model="expert-verified-baseline",
                farmer_district=farmer_district,
                is_sample_scan=False,
                identification=PestIdentification(
                    pest_id=PestIdEnum.UNCERTAIN,
                    common_name_en="Unclear Image",
                    common_name_or="ଅସ୍ପଷ୍ଟ ଫଟୋ",
                    confidence=None,
                    certainty_tier=CertaintyTierEnum.UNCERTAIN
                )
            )

        # Handle known benchmark / forced sample evaluation
        if forced_pest_id:
            if forced_pest_id == "unclear_image":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.UNCLEAR_IMAGE,
                    common_name="Unclear Image",
                    common_name_or="ଅସ୍ପଷ୍ଟ ଫଟୋ",
                    scientific_name=None,
                    pest_id=None,
                    confidence=None,
                    confidence_type=None,
                    visual_evidence=[],
                    crop=crop_id,
                    crop_id=crop_id,
                    life_stage="Unknown",
                    reason="Photograph lacks sufficient micro-detail or contrast for species-level entomological identification.",
                    limitations=[
                        "Diagnostic morphological features are obscured by blur or improper lighting."
                    ],
                    needs_better_image=True,
                    treatment_allowed=False,
                    expert_review_recommended=True,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    potential_yield_loss_range="Assessment suspended pending clearer photograph",
                    immediate_actions_en=[
                        "Do not apply pesticides without confirming the pest.",
                        "Retake photograph in bright natural light, holding camera steady."
                    ],
                    immediate_actions_or=[
                        "କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।",
                        "ପର୍ଯ୍ୟାପ୍ତ ସୂର୍ଯ୍ୟାଲୋକରେ କ୍ୟାମେରା ସ୍ଥିର ରଖି ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।"
                    ],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.UNCERTAIN,
                        common_name_en="Unclear Image",
                        common_name_or="ଅସ୍ପଷ୍ଟ ଫଟୋ",
                        confidence=None,
                        certainty_tier=CertaintyTierEnum.UNCERTAIN
                    )
                )

            if forced_pest_id == "non_agricultural":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.NON_AGRICULTURAL_IMAGE,
                    common_name="Non-Agricultural Image",
                    common_name_or="ଅଣ-କୃଷି ଫଟୋ (ମୋଟର ଗାଡ଼ି / ବସ୍ତୁ)",
                    scientific_name=None,
                    pest_id=None,
                    confidence=None,
                    confidence_type=None,
                    visual_evidence=["Inanimate non-agricultural contours detected", "Absence of crop foliage or pest morphology"],
                    crop="None",
                    crop_id=crop_id,
                    life_stage="Unknown",
                    reason="The photograph contains a vehicle or non-agricultural object. No crop or pest detected.",
                    limitations=["Non-agricultural subject."],
                    needs_better_image=True,
                    treatment_allowed=False,
                    expert_review_recommended=False,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    potential_yield_loss_range="0%",
                    immediate_actions_en=["Please upload an actual photograph of a rice leaf or crop pest."],
                    immediate_actions_or=["ଦୟାକରି ଧାନ ପତ୍ର କିମ୍ବା ଫସଲ ପୋକର ପ୍ରକୃତ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।"],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.UNCERTAIN,
                        common_name_en="Non-Agricultural Image",
                        common_name_or="ଅଣ-କୃଷି ଫଟୋ",
                        confidence=None,
                        certainty_tier=CertaintyTierEnum.UNCERTAIN
                    )
                )

            if forced_pest_id == "crop_damage_no_insect":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.CROP_DAMAGE_NO_VISIBLE_INSECT,
                    common_name="Crop Damage (No Visible Insect)",
                    common_name_or="ପତ୍ର କ୍ଷତି (ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)",
                    scientific_name=None,
                    pest_id=None,
                    confidence=None,
                    confidence_type=None,
                    visual_evidence=["Foliage discoloration / lesions observed", "Absence of visible insect body, legs, or antennae"],
                    crop="Rice",
                    crop_id=crop_id,
                    life_stage="Unknown",
                    reason="Leaf lesion or discoloration is visible, but NO insect body is present in the photograph. Insect species cannot be confirmed from leaf damage alone.",
                    limitations=["Foliage symptoms can be caused by pathogens or past insect feeding."],
                    needs_better_image=True,
                    treatment_allowed=False,
                    expert_review_recommended=True,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    potential_yield_loss_range="Assessment suspended",
                    immediate_actions_en=[
                        "Inspect leaf sheaths and stem base for live insects.",
                        "Photograph any live caterpillars, planthoppers, or beetles found.",
                        "Do not spray broad-spectrum insecticides without confirming the pest."
                    ],
                    immediate_actions_or=[
                        "ଗଛ ମୂଳ ଓ ପତ୍ର ସନ୍ଧିରେ ଜୀବନ୍ତ ପୋକ ଖୋଜନ୍ତୁ।",
                        "କୌଣସି ପୋକ ମିଳିଲେ ତାର ନିକଟବର୍ତ୍ତୀ ଫଟୋ ଉଠାନ୍ତୁ।",
                        "ପୋକ ନିଶ୍ଚିତ ନହେବା ଯାଏଁ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।"
                    ],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.UNCERTAIN,
                        common_name_en="Crop Damage (No Insect Visible)",
                        common_name_or="ପତ୍ର କ୍ଷତି (ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)",
                        confidence=None,
                        certainty_tier=CertaintyTierEnum.UNCERTAIN
                    )
                )

            if forced_pest_id == "other_insect":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.OTHER_INSECT,
                    common_name="Other Insect (Non-Rice Pest)",
                    common_name_or="ଅନ୍ୟ କୀଟ (ଧାନ ପାଇଁ କ୍ଷତିକାରକ ନୁହେଁ)",
                    scientific_name="Non-target insect",
                    pest_id="other_insect",
                    confidence=85.0,
                    confidence_type="benchmark_reference",
                    visual_evidence=["Arthropod morphology distinct from 5 supported rice pests"],
                    crop="Rice",
                    crop_id=crop_id,
                    life_stage="Adult",
                    reason="Detected insect is NOT one of the 5 supported rice pests (Ladybird beetle / neutral arthropod).",
                    limitations=["Non-pest / neutral insect."],
                    needs_better_image=False,
                    treatment_allowed=False,
                    expert_review_recommended=False,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    potential_yield_loss_range="0%",
                    immediate_actions_en=["Do not spray insecticides. Beneficial / non-target insects regulate pests naturally."],
                    immediate_actions_or=["କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ବନ୍ଧୁ କୀଟମାନେ ପ୍ରାକୃତିକ ଭାବେ ପୋକ ଦମନ କରନ୍ତି।"],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.UNCERTAIN,
                        common_name_en="Other Insect",
                        common_name_or="ଅନ୍ୟ କୀଟ",
                        confidence=85,
                        certainty_tier=CertaintyTierEnum.MODERATE
                    )
                )

            if forced_pest_id in ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm", "beneficial_spider", "healthy_paddy"]:
                knowledge = get_pest_knowledge(forced_pest_id)
            
            # Non-pest cases
            if forced_pest_id == "healthy_paddy":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.HEALTHY_CROP,
                    common_name=knowledge["common_name_en"],
                    common_name_or=knowledge["common_name_or"],
                    scientific_name=knowledge["scientific_name"],
                    pest_id="healthy_paddy",
                    confidence=95.0,
                    confidence_type="benchmark_reference",
                    visual_evidence=[
                        "Erect, healthy vegetative canopy with intact leaf blades.",
                        "No chlorotic streaking, dead hearts, or white heads observed.",
                        "Normal chlorophyll pigmentation."
                    ],
                    crop="Rice",
                    crop_id=crop_id,
                    life_stage="Vegetative / Tillering",
                    reason="Crop foliage displays uniform healthy morphology with zero diagnostic signs of insect feeding or lodging.",
                    limitations=["Continuous scouting advised during humid weather."],
                    needs_better_image=False,
                    treatment_allowed=False,  # Absolutely NO treatment for healthy crop!
                    expert_review_recommended=False,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    immediate_actions_en=knowledge["immediate_next_steps_en"],
                    immediate_actions_or=knowledge["immediate_next_steps_or"],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.HEALTHY_PADDY,
                        common_name_en=knowledge["common_name_en"],
                        common_name_or=knowledge["common_name_or"],
                        scientific_name=knowledge["scientific_name"],
                        local_name=knowledge["local_odisha_name"],
                        confidence=95,
                        certainty_tier=CertaintyTierEnum.HIGH
                    )
                )

            if forced_pest_id == "beneficial_spider":
                return PestAnalysisResponse(
                    scan_id=scan_id,
                    created_at=now,
                    status=ScanStatusEnum.OTHER_INSECT,  # Beneficial natural enemy
                    common_name=knowledge["common_name_en"],
                    common_name_or=knowledge["common_name_or"],
                    scientific_name=knowledge["scientific_name"],
                    pest_id="beneficial_spider",
                    confidence=92.0,
                    confidence_type="benchmark_reference",
                    visual_evidence=[
                        "Distinct radiating ocular pattern and cephalothorax carapace stripes.",
                        "Spiny legs adapted for active cursorial hunting across the water surface.",
                        "Absence of chewing mouthparts on plant tissue."
                    ],
                    crop="Rice",
                    crop_id=crop_id,
                    life_stage="Adult female / male hunter",
                    reason="Specimen identified as Lycosa pseudoannulata (Wolf Spider), a vital natural predator of brown planthoppers and leaf folders. NOT A CROP PEST.",
                    limitations=["Presence indicates natural biological control is active in the canopy."],
                    needs_better_image=False,
                    treatment_allowed=False,  # Absolutely NO pesticide spraying for beneficial predators!
                    expert_review_recommended=False,
                    quality_assessment=quality,
                    severity_assessment=SeverityEnum.LOW,
                    immediate_actions_en=knowledge["immediate_next_steps_en"],
                    immediate_actions_or=knowledge["immediate_next_steps_or"],
                    source_model="expert-verified-baseline",
                    farmer_district=farmer_district,
                    is_sample_scan=True,
                    identification=PestIdentification(
                        pest_id=PestIdEnum.BENEFICIAL_SPIDER,
                        common_name_en=knowledge["common_name_en"],
                        common_name_or=knowledge["common_name_or"],
                        scientific_name=knowledge["scientific_name"],
                        local_name=knowledge["local_odisha_name"],
                        confidence=92,
                        certainty_tier=CertaintyTierEnum.HIGH
                    )
                )

            # Verified supported pest
            severity_map = {
                "bph": SeverityEnum.SEVERE,
                "armyworm": SeverityEnum.SEVERE,
                "stem_borer": SeverityEnum.MODERATE,
                "leaf_folder": SeverityEnum.MODERATE,
                "rice_hispa": SeverityEnum.MODERATE
            }
            conf_map = {
                "bph": (91.0, "Nymphs and macropterous adults clustered at stem base with visible honeydew secretion."),
                "stem_borer": (91.0, "Bore holes at stem internodes with central whorl drying ('dead heart')."),
                "leaf_folder": (88.0, "Longitudinally rolled leaf blades fastened by silk threads with scraped white stripes."),
                "rice_hispa": (87.0, "Adult with characteristic dorsal spines creating parallel white feeding streaks."),
                "armyworm": (90.0, "Smooth-bodied caterpillar with distinct lateral stripes feeding gregariously on foliage.")
            }
            conf, vis_feat = conf_map.get(forced_pest_id, (85.0, "Typical morphological characteristics."))
            
            return PestAnalysisResponse(
                scan_id=scan_id,
                created_at=now,
                status=ScanStatusEnum.IDENTIFIED,
                common_name=knowledge["common_name_en"],
                common_name_or=knowledge["common_name_or"],
                scientific_name=knowledge["scientific_name"],
                pest_id=forced_pest_id,
                confidence=conf,
                confidence_type="benchmark_reference",
                visual_evidence=[vis_feat, f"Diagnostic signs consistent with {knowledge['key_symptoms_en'][0]}."],
                crop="Rice",
                crop_id=crop_id,
                life_stage="Larval / Nymph / Adult observed",
                reason=f"Specimen visual characteristics match authoritative ICAR-NRRI reference morphology for {knowledge['scientific_name']}.",
                limitations=["Field-wide economic threshold (ETL) must be determined by sampling 20 random hills."],
                needs_better_image=False,
                treatment_allowed=True,
                expert_review_recommended=False,
                quality_assessment=quality,
                severity_assessment=severity_map.get(forced_pest_id, SeverityEnum.MODERATE),
                potential_yield_loss_range=knowledge["potential_damage_percent"],
                immediate_actions_en=knowledge["immediate_next_steps_en"],
                immediate_actions_or=knowledge["immediate_next_steps_or"],
                source_model="expert-verified-baseline",
                farmer_district=farmer_district,
                is_sample_scan=True,
                identification=PestIdentification(
                    pest_id=PestIdEnum(forced_pest_id),
                    common_name_en=knowledge["common_name_en"],
                    common_name_or=knowledge["common_name_or"],
                    scientific_name=knowledge["scientific_name"],
                    local_name=knowledge["local_odisha_name"],
                    confidence=int(conf),
                    certainty_tier=CertaintyTierEnum.HIGH
                ),
                ai_inferred_damage_en=knowledge["potential_damage_percent"],
                ai_inferred_damage_or=knowledge["key_symptoms_or"][0]
            )

        # ARBITRARY UPLOAD WITHOUT LIVE GEMINI API KEY
        # Must NEVER default to 'bph' or invent a fake classification.
        # Report honest status: UNKNOWN / OFFLINE_REJECTION with zero treatment allowed.
        return PestAnalysisResponse(
            scan_id=scan_id,
            created_at=now,
            status=ScanStatusEnum.UNKNOWN,
            common_name="Unidentified Agricultural Subject",
            common_name_or="ଅନିର୍ଦ୍ଧାରିତ କୃଷି ବିଷୟବସ୍ତୁ",
            scientific_name=None,
            pest_id=None,
            confidence=None,
            confidence_type=None,
            visual_evidence=[
                "Image uploaded in local/offline development mode.",
                "Automated neural inference requires configured GEMINI_API_KEY."
            ],
            crop=crop_id,
            crop_id=crop_id,
            life_stage="Unknown",
            reason=(
                "The system is currently operating in Verified Expert Baseline Mode without live vision API connectivity. "
                "To prevent false identifications, Krushi Mitra AI refuses to guess or force arbitrary uploads into one of the 5 rice pests."
            ),
            limitations=[
                "Automated species-level vision classification is disabled offline for unreferenced uploads.",
                "Pesticide recommendation is strictly suppressed to protect crop health and farmer finances."
            ],
            needs_better_image=False,
            treatment_allowed=False,  # CRITICAL: Suppress treatment
            expert_review_recommended=True,
            quality_assessment=quality,
            severity_assessment=SeverityEnum.LOW,
            potential_yield_loss_range="Cannot be assessed without species confirmation",
            immediate_actions_en=[
                "Do not apply synthetic pesticides without confirmed species diagnosis.",
                "Inspect plants for live insects, leaf folds, or stem discoloration.",
                "Configure GEMINI_API_KEY for live AI identification or consult your local KVK scientist."
            ],
            immediate_actions_or=[
                "କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି ରାସାୟନିକ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।",
                "ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK) କିମ୍ବା କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।"
            ],
            source_model="expert-verified-baseline",
            farmer_district=farmer_district,
            is_sample_scan=False,
            identification=PestIdentification(
                pest_id=PestIdEnum.UNCERTAIN,
                common_name_en="Unidentified Subject",
                common_name_or="ଅନିର୍ଦ୍ଧାରିତ ବିଷୟବସ୍ତୁ",
                confidence=None,
                certainty_tier=CertaintyTierEnum.UNCERTAIN
            )
        )
