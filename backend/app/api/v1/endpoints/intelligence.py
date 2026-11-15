from typing import List
from fastapi import APIRouter, HTTPException
from app.models.pest import DistrictPestTelemetry
from app.services.knowledge import get_districts_telemetry

router = APIRouter()

@router.get("/districts", response_model=List[DistrictPestTelemetry])
async def list_odisha_districts_telemetry():
    """
    Returns authentic district pest intelligence and meteorological risk indices.
    Differentiates farmer scans, AI-suspected cases, and expert-confirmed cases.
    Zero fabricated numbers.
    """
    data = get_districts_telemetry()
    return [DistrictPestTelemetry(**d) for d in data]

@router.get("/districts/{district_id}", response_model=DistrictPestTelemetry)
async def get_single_district_telemetry(district_id: str):
    data = get_districts_telemetry()
    matched = next((d for d in data if d["district_id"] == district_id.lower()), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"District '{district_id}' not found.")
    return DistrictPestTelemetry(**matched)
