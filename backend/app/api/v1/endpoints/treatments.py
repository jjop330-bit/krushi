from fastapi import APIRouter, HTTPException
from app.models.treatment import (
    TreatmentPlanResponse,
    BiologicalControlItem,
    CulturalControlItem,
    ChemicalControlItem
)
from app.services.knowledge import get_pest_knowledge

router = APIRouter()

@router.get("/{pest_id}", response_model=TreatmentPlanResponse)
async def get_pest_treatments(pest_id: str):
    """
    Returns authentic, 3-tier Integrated Pest Management (IPM) recommendations
    grounded in ICAR-NRRI Cuttack and OUAT Package of Practices.
    Never fabricates unverified pesticides or dosages.
    """
    knowledge = get_pest_knowledge(pest_id)
    if not knowledge:
        raise HTTPException(status_code=404, detail="Pest not found")

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
        expert_consultation_criteria_en=knowledge.get("expert_consultation_criteria_en", []),
        expert_consultation_criteria_or=knowledge.get("expert_consultation_criteria_or", []),
        scientific_references=knowledge.get("scientific_references", []),
        responsible_stewardship_warning_en=(
            "Apply chemical insecticides strictly after Economic Threshold Level (ETL) is breached. "
            "Never spray against wind. Wear protective gear (mask and gloves). Strictly observe Pre-Harvest Intervals (PHI)."
        ),
        responsible_stewardship_warning_or=(
            "କେବଳ ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (ETL) ଟପିଲେ ହିଁ ରାସାୟନିକ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ। "
            "ପବନର ବିପରୀତ ଦିଗରେ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ମୁହଁରେ ମାସ୍କ ଓ ହାତରେ ଗ୍ଲୋଭ୍ସ ପିନ୍ଧନ୍ତୁ।"
        )
    )
