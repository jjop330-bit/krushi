from fastapi import APIRouter
from app.core.config import settings
from app.models.health import HealthResponse
from app.services.knowledge import get_all_pests
from app.services.supabase_client import supabase_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def check_health():
    return HealthResponse(
        status="operational",
        version=settings.VERSION,
        vision_provider=settings.ACTIVE_VISION_PROVIDER,
        gemini_configured=bool(settings.GEMINI_API_KEY),
        supabase_configured=supabase_service.is_connected(),
        supported_pests=len(get_all_pests())
    )
