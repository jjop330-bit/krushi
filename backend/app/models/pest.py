from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class PestIdEnum(str, Enum):
    BPH = "bph"
    STEM_BORER = "stem_borer"
    LEAF_FOLDER = "leaf_folder"
    RICE_HISPA = "rice_hispa"
    ARMYWORM = "armyworm"
    BENEFICIAL_SPIDER = "beneficial_spider"
    HEALTHY_PADDY = "healthy_paddy"
    UNCERTAIN = "uncertain"

class SeverityEnum(str, Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    SEVERE = "Severe"
    CRITICAL = "Critical"

class CertaintyTierEnum(str, Enum):
    HIGH = "high"
    MODERATE = "moderate"
    UNCERTAIN = "uncertain"

class ImageQualityAssessment(BaseModel):
    is_clear: bool
    lighting_score: int = Field(ge=0, le=100)
    sharpness_score: int = Field(ge=0, le=100)
    warning_message_en: Optional[str] = None
    warning_message_or: Optional[str] = None

class AlternativeDiagnosis(BaseModel):
    pest_id: str
    name_en: str
    name_or: str
    confidence: int = Field(ge=0, le=100)

class PestIdentification(BaseModel):
    pest_id: PestIdEnum
    common_name_en: str
    common_name_or: str
    scientific_name: str
    local_name: str
    confidence: int = Field(ge=0, le=100)
    certainty_tier: CertaintyTierEnum

class PestAnalysisResponse(BaseModel):
    scan_id: str
    created_at: int
    crop_id: str = "paddy"
    image_storage_url: Optional[str] = None
    quality_assessment: ImageQualityAssessment
    identification: PestIdentification
    alternative_possibilities: List[AlternativeDiagnosis] = []
    observed_visual_features: List[str]
    ai_inferred_damage_en: str
    ai_inferred_damage_or: str
    severity_assessment: SeverityEnum
    potential_yield_loss_range: str
    immediate_actions_en: List[str]
    immediate_actions_or: List[str]
    expert_review_required: bool
    source_model: str  # e.g. "gemini-1.5-flash", "yolo-adapter", "expert-verified-baseline"
    is_sample_scan: bool = False
    farmer_district: str = "bargarh"

class PestAnalysisRequestBase64(BaseModel):
    image_base64: str
    crop_id: str = "paddy"
    farmer_district: str = "bargarh"
    forced_pest_id: Optional[str] = None

class DistrictPestTelemetry(BaseModel):
    district_id: str
    district_name: str
    district_name_or: str
    zone: str
    total_farmer_scans: int
    ai_suspected_cases: int
    expert_confirmed_cases: int
    active_outbreak_alert: bool
    dominant_pest_id: Optional[str] = None
    kvk_name: str
    kvk_phone: str
    temperature_c: float
    humidity_percent: int
    bph_risk_level: str
    risk_rationale_en: str
    risk_rationale_or: str
