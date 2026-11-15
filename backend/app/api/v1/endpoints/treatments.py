from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.treatment import (
    TreatmentPlanResponse,
    BiologicalControlItem,
    CulturalControlItem,
    ChemicalControlItem,
    ScoutingObservation
)
from app.services.knowledge import get_pest_knowledge

router = APIRouter()

@router.get("/{pest_id}", response_model=TreatmentPlanResponse)
async def get_pest_treatments(
    pest_id: str,
    crop_stage: Optional[str] = Query(None, description="Crop growth stage: vegetative, tillering, panicle, heading"),
    sampling_unit: Optional[str] = Query(None, description="Field scouting measurement unit: per_hill, percent_dead_hearts, etc."),
    pest_count: Optional[float] = Query(None, description="Empirical field scouting count/percentage")
):
    """
    Returns authentic, 3-tier Integrated Pest Management (IPM) recommendations
    grounded in ICAR-NRRI Cuttack and OUAT Package of Practices.
    
    BACKEND SAFETY ENFORCEMENT:
    - Biological and cultural control (safe IPM education) are returned.
    - Chemical control (synthetic insecticides) is STRICTLY LOCKED ([] empty list)
      unless verified empirical field scouting data meeting or exceeding the pest-specific
      Economic Threshold Level (ETL) is supplied.
    """
    knowledge = get_pest_knowledge(
        pest_id=pest_id,
        crop_stage=crop_stage,
        sampling_unit=sampling_unit,
        pest_count=pest_count
    )
    if not knowledge:
        raise HTTPException(status_code=404, detail="Pest not found")

    scouting_obs = None
    if crop_stage and sampling_unit and pest_count is not None:
        scouting_obs = ScoutingObservation(
            crop_stage=crop_stage,
            sampling_unit=sampling_unit,
            pest_count=pest_count
        )

    return TreatmentPlanResponse(
        pest_id=knowledge["id"],
        pest_name_en=knowledge["common_name_en"],
        pest_name_or=knowledge["common_name_or"],
        scientific_name=knowledge["scientific_name"],
        etl_condition_en=knowledge["economic_threshold_level_en"],
        etl_condition_or=knowledge["economic_threshold_level_or"],
        biological_control=[
            BiologicalControlItem(**b) for b in knowledge.get("biological_control", [])
        ],
        cultural_control=[
            CulturalControlItem(**c) for c in knowledge.get("cultural_control", [])
        ],
        chemical_control=[
            ChemicalControlItem(**ch) for ch in knowledge.get("chemical_control", [])
        ],
        chemical_authorized=knowledge.get("chemical_authorized", False),
        authorization_status=knowledge.get("authorization_status", "LOCKED_PENDING_SCOUTING_OBSERVATION"),
        scouting_observation=scouting_obs,
        scouting_guidance_en=knowledge.get("scouting_guidance_en", ""),
        scouting_guidance_or=knowledge.get("scouting_guidance_or", ""),
        expert_consultation_criteria_en=knowledge.get("expert_consultation_criteria_en", []),
        expert_consultation_criteria_or=knowledge.get("expert_consultation_criteria_or", []),
        scientific_references=knowledge.get("scientific_references", []),
        responsible_stewardship_warning_en=(
            knowledge.get("authorization_message_en") or (
                "Apply chemical insecticides strictly after Economic Threshold Level (ETL) is breached. "
                "Never spray against wind. Wear protective gear (mask and gloves). Strictly observe Pre-Harvest Intervals (PHI)."
            )
        ),
        responsible_stewardship_warning_or=(
            knowledge.get("authorization_message_or") or (
                "କେବଳ ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (ETL) ଟପିଲେ ହିଁ ରାସାୟନିକ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ। "
                "ପବନର ବିପରୀତ ଦିଗରେ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ମୁହଁରେ ମାସ୍କ ଓ ହାତରେ ଗ୍ଲୋଭ୍ସ ପିନ୍ଧନ୍ତୁ।"
            )
        )
    )

@router.post("/{pest_id}/authorize", response_model=TreatmentPlanResponse)
async def authorize_pest_treatment(
    pest_id: str,
    observation: ScoutingObservation
):
    """
    Submits an empirical field scouting observation to evaluate Economic Threshold Level (ETL)
    and authorize applicable CIBRC chemical recommendations.
    """
    return await get_pest_treatments(
        pest_id=pest_id,
        crop_stage=observation.crop_stage,
        sampling_unit=observation.sampling_unit,
        pest_count=observation.pest_count
    )
