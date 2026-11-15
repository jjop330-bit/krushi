from typing import List, Optional
from pydantic import BaseModel

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
    expert_consultation_criteria_en: List[str]
    expert_consultation_criteria_or: List[str]
    scientific_references: List[str]
    responsible_stewardship_warning_en: str
    responsible_stewardship_warning_or: str
