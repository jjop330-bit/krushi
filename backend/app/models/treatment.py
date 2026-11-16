from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class ObservationProvenanceEnum(str, Enum):
    FARMER_SUBMITTED = "FARMER_SUBMITTED"
    EXPERT_VERIFIED = "EXPERT_VERIFIED"
    FIELD_PILOT_VERIFIED = "FIELD_PILOT_VERIFIED"
    INVALID_OR_INCOMPLETE = "INVALID_OR_INCOMPLETE"

class BiologicalControlItem(BaseModel):
    title_en: str
    title_or: str
    description_en: str
    description_or: str
    category: str  # predator | parasitoid | biopesticide
    safety_rating: str
    target_stage: str

class CulturalControlItem(BaseModel):
    title_en: str
    title_or: str
    description_en: str
    description_or: str
    action_timing: str

class ChemicalControlItem(BaseModel):
    active_ingredient: str
    trade_names: List[str]
    dosage_per_acre: str
    water_volume_per_acre: str
    phi_days: int
    cibrc_registered: bool
    toxicity_class: str
    safety_precautions_en: str
    safety_precautions_or: str
    water_spray_instructions: str

class ScoutingObservation(BaseModel):
    crop_stage: str
    sampling_unit: str
    pest_count: float
    provenance: ObservationProvenanceEnum = ObservationProvenanceEnum.FIELD_PILOT_VERIFIED
    verifier_id: Optional[str] = "PILOT-SUPERVISED-VERIFIER"
    verification_notes: Optional[str] = None

class TreatmentPlanResponse(BaseModel):
    pest_id: str
    pest_name_en: str
    pest_name_or: str
    scientific_name: str
    etl_condition_en: str
    etl_condition_or: str
    biological_control: List[BiologicalControlItem]
    cultural_control: List[CulturalControlItem]
    chemical_control: List[ChemicalControlItem]
    chemical_authorized: bool = False
    authorization_status: str = "LOCKED_PENDING_SCOUTING_OBSERVATION"
    scouting_observation: Optional[ScoutingObservation] = None
    scouting_guidance_en: str = ""
    scouting_guidance_or: str = ""
    expert_consultation_criteria_en: List[str]
    expert_consultation_criteria_or: List[str]
    scientific_references: List[str]
    responsible_stewardship_warning_en: str
    responsible_stewardship_warning_or: str
