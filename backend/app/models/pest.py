from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

class ScanStatusEnum(str, Enum):
    IDENTIFIED = "IDENTIFIED"
    OTHER_INSECT = "OTHER_INSECT"
    NO_INSECT = "NO_INSECT"
    HEALTHY_CROP = "HEALTHY_CROP"
    CROP_DAMAGE_NO_VISIBLE_INSECT = "CROP_DAMAGE_NO_VISIBLE_INSECT"
    UNCLEAR_IMAGE = "UNCLEAR_IMAGE"
    NON_AGRICULTURAL_IMAGE = "NON_AGRICULTURAL_IMAGE"
    UNKNOWN = "UNKNOWN"
    ERROR = "ERROR"

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
    confidence: Optional[int] = None

class PestIdentification(BaseModel):
    pest_id: PestIdEnum
    common_name_en: str
    common_name_or: str
    scientific_name: Optional[str] = None
    local_name: Optional[str] = None
    confidence: Optional[int] = None
    certainty_tier: CertaintyTierEnum

class PestAnalysisResponse(BaseModel):
    """
    Strict, scientific output schema for Krushi Mitra AI vision scanner.
    Implements two-stage subject validation, rejection states, and treatment gating.
    """
    scan_id: str
    request_id: Optional[str] = None
    image_hash: Optional[str] = None
    model_version: Optional[str] = "3.5-flash-lite"
    created_at: int
    status: ScanStatusEnum
    common_name: Optional[str] = None
    common_name_or: Optional[str] = None
    scientific_name: Optional[str] = None
    pest_id: Optional[str] = None
    confidence: Optional[float] = None
    confidence_type: Optional[str] = None  # "calibrated_probability", "heuristic_provisional", "model_raw", None
    visual_evidence: List[str] = []
    crop: str = "Rice"
    crop_id: str = "paddy"
    life_stage: Optional[str] = "Unknown"
    reason: str
    limitations: List[str] = []
    needs_better_image: bool = False
    treatment_allowed: bool = False
    expert_review_recommended: bool = False
    
    # Agronomic and telemetry attributes
    image_storage_url: Optional[str] = None
    quality_assessment: ImageQualityAssessment
    severity_assessment: SeverityEnum = SeverityEnum.LOW
    potential_yield_loss_range: Optional[str] = None
    immediate_actions_en: List[str] = []
    immediate_actions_or: List[str] = []
    alternative_possibilities: List[AlternativeDiagnosis] = []
    source_model: str
    farmer_district: str = "bargarh"
    is_sample_scan: bool = False
    
    # Detailed crop damage and impact analysis
    crop_damage_analysis: Optional[str] = None
    crop_damage_analysis_or: Optional[str] = None

    # Cryptographic Tamper-Evident Report Signature (HMAC-SHA256)
    report_signature: Optional[str] = None
    signature_algorithm: Optional[str] = "HMAC-SHA256"
    signature_key_version: Optional[str] = "v1"

    # Backwards compatibility layer for legacy components
    identification: Optional[PestIdentification] = None
    ai_inferred_damage_en: Optional[str] = None
    ai_inferred_damage_or: Optional[str] = None
    observed_visual_features: List[str] = []
    expert_review_required: bool = False

    @model_validator(mode="after")
    def compute_signature_if_missing(self):
        if not self.report_signature and self.scan_id:
            try:
                from app.core.security import generate_report_signature
                status_str = self.status.value if hasattr(self.status, "value") else str(self.status)
                sig_data = generate_report_signature(
                    scan_id=self.scan_id,
                    image_hash=self.image_hash,
                    status=status_str,
                    pest_id=self.pest_id,
                    created_at=self.created_at
                )
                self.report_signature = sig_data["signature"]
                self.signature_algorithm = sig_data["algorithm"]
                self.signature_key_version = sig_data["key_version"]
            except Exception:
                pass
        return self

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
