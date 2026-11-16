from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CropCategory(str, Enum):
    CEREALS_MILLETS = "cereals_millets"
    PULSES = "pulses"
    OILSEEDS = "oilseeds"
    VEGETABLES = "vegetables"
    FRUITS_HORTICULTURE = "fruits_horticulture"

class CropValidationStatus(str, Enum):
    ACTIVE_VALIDATED = "active_validated"
    SUPERVISED_FIELD_PILOT = "supervised_field_pilot"
    STAGED_RESEARCH = "staged_research"

class CropPestSummary(BaseModel):
    pest_id: str
    common_name_en: str
    common_name_or: str
    scientific_name: str
    local_name_or: Optional[str] = None
    affected_parts: List[str] = []
    etl_en: Optional[str] = None
    etl_or: Optional[str] = None
    validation_status: str = "validated"

class CropDetail(BaseModel):
    id: str
    common_name_en: str
    common_name_or: str
    scientific_name: str
    category: CropCategory
    category_name_en: str
    category_name_or: str
    validation_status: CropValidationStatus
    growth_stages: List[str] = []
    plant_parts: List[str] = ["leaf", "stem", "root", "flower", "fruit", "grain", "whole_plant"]
    major_insect_pests: List[CropPestSummary] = []
    beneficial_insects: List[Dict[str, str]] = []
    common_diseases: List[str] = []
    nutrient_deficiencies: List[str] = []
    characteristic_symptoms: List[str] = []
    scouting_methods: List[str] = []
    cultural_mechanical_control: List[str] = []
    biological_control: List[str] = []
    chemical_control_safeguards: List[str] = []
    source_institutions: List[str] = ["OUAT Bhubaneswar", "ICAR Institutes", "Odisha Department of Agriculture"]
    evidence_status: str = "Expert Verified"
    icon: Optional[str] = "🌱"

class CropListResponse(BaseModel):
    total_crops: int
    categories: List[str]
    crops: List[CropDetail]
