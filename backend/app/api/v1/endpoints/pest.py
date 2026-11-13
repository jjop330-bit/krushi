import base64
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from app.models.pest import (
    PestAnalysisResponse,
    PestAnalysisRequestBase64
)
from app.services.vision import get_vision_provider
from app.services.knowledge import get_all_pests, get_pest_knowledge
from app.services.supabase_client import supabase_service
from app.core.security import verify_auth_token

router = APIRouter()

@router.post("/analyze", response_model=PestAnalysisResponse)
async def analyze_crop_image(
    file: Optional[UploadFile] = File(None),
    crop_id: str = Form("paddy"),
    farmer_district: str = Form("bargarh"),
    forced_pest_id: Optional[str] = Form(None),
    provider: Optional[str] = Form(None),
    auth_ctx: dict = Depends(verify_auth_token)
):
    """
    Primary server-side multimodal pest diagnosis endpoint.
    All AI requests pass securely through here. Never exposes Gemini API keys to client.
    """
    if not file:
        raise HTTPException(status_code=400, detail="An image file is required for analysis.")
    
    # Read image bytes
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file provided.")

    # Upload to Supabase Storage (or mock local storage)
    user_id = auth_ctx.get("user_id", "anonymous")
    image_url = await supabase_service.upload_crop_photograph(
        image_bytes, 
        file.filename or "scan.jpg", 
        user_id
    )

    # Invoke active modular vision detector
    vision_detector = get_vision_provider(provider)
    analysis = await vision_detector.analyze(
        image_bytes=image_bytes,
        crop_id=crop_id,
        farmer_district=farmer_district,
        forced_pest_id=forced_pest_id
    )
    
    analysis.image_storage_url = image_url

    # Persist scan report to database
    await supabase_service.save_scan_report(analysis.model_dump())

    return analysis

@router.post("/analyze-base64", response_model=PestAnalysisResponse)
async def analyze_crop_image_base64(
    request: PestAnalysisRequestBase64,
    auth_ctx: dict = Depends(verify_auth_token)
):
    """
    Fallback endpoint accepting base64 encoded photographs for test harness and webview integrations.
    """
    try:
        raw_b64 = request.image_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",")[1]
        image_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 encoding: {str(e)}")

    user_id = auth_ctx.get("user_id", "anonymous")
    image_url = await supabase_service.upload_crop_photograph(image_bytes, "base64_scan.jpg", user_id)

    vision_detector = get_vision_provider()
    analysis = await vision_detector.analyze(
        image_bytes=image_bytes,
        crop_id=request.crop_id,
        farmer_district=request.farmer_district,
        forced_pest_id=request.forced_pest_id
    )
    analysis.image_storage_url = image_url

    await supabase_service.save_scan_report(analysis.model_dump())
    return analysis

@router.get("/species")
async def list_supported_pest_species():
    """
    Returns verified entomological profiles for supported rice pests in Odisha.
    """
    return get_all_pests()

@router.get("/species/{pest_id}")
async def get_species_detail(pest_id: str):
    knowledge = get_pest_knowledge(pest_id)
    if not knowledge or knowledge.get("id") == "uncertain" and pest_id != "uncertain":
        raise HTTPException(status_code=404, detail=f"Pest species '{pest_id}' not found.")
    return knowledge
