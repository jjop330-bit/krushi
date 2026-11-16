from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.crop import CropDetail, CropListResponse
from app.services.crop_registry import (
    get_all_crops,
    get_crop_by_id,
    get_crop_categories
)

router = APIRouter()

@router.get("", response_model=CropListResponse)
async def list_odisha_crops(
    category: Optional[str] = Query(None, description="Optional filter by crop category: cereals_millets, pulses, oilseeds, vegetables, fruits_horticulture"),
    status: Optional[str] = Query(None, description="Optional filter by validation status: active_validated, supervised_field_pilot, staged_research")
):
    """
    Returns authentic agronomic and entomological profiles for major Odisha crops
    across Cereals, Millets, Pulses, Oilseeds, Vegetables, and Fruit crops.
    """
    crops_raw = get_all_crops()

    if category:
        norm_cat = category.strip().lower()
        crops_raw = [
            c for c in crops_raw 
            if (c["category"].value if hasattr(c["category"], "value") else str(c["category"])).lower() == norm_cat
        ]

    if status:
        norm_status = status.strip().lower()
        crops_raw = [
            c for c in crops_raw 
            if (c["validation_status"].value if hasattr(c["validation_status"], "value") else str(c["validation_status"])).lower() == norm_status
        ]

    crop_models = [CropDetail(**c) for c in crops_raw]
    return CropListResponse(
        total_crops=len(crop_models),
        categories=get_crop_categories(),
        crops=crop_models
    )

@router.get("/categories")
async def list_crop_categories():
    """
    Returns supported agricultural crop categories in Odisha.
    """
    return {
        "categories": [
            {"id": "cereals_millets", "name_en": "Cereals & Millets", "name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ"},
            {"id": "pulses", "name_en": "Pulses", "name_or": "ଡାଲି ଜାତୀୟ ଫସଲ"},
            {"id": "oilseeds", "name_en": "Oilseeds", "name_or": "ତୈଳବୀଜ ଫସଲ"},
            {"id": "vegetables", "name_en": "Vegetables", "name_or": "ପନିପରିବା ଫସଲ"},
            {"id": "fruits_horticulture", "name_en": "Fruits & Horticulture", "name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି"}
        ]
    }

@router.get("/{crop_id}", response_model=CropDetail)
async def get_crop_profile(crop_id: str):
    """
    Returns the comprehensive agronomic, diagnostic, and IPM knowledge profile for a specific Odisha crop.
    """
    crop = get_crop_by_id(crop_id)
    if not crop:
        raise HTTPException(
            status_code=404,
            detail=f"Crop '{crop_id}' not found in Odisha agricultural registry."
        )
    return CropDetail(**crop)
