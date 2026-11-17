import os
from fastapi import APIRouter
from app.core.config import settings
from app.models.health import HealthResponse
from app.services.knowledge import get_all_pests
from app.services.supabase_client import supabase_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def check_health():
    settings.resolve_api_keys()
    return HealthResponse(
        status="operational",
        version=settings.VERSION,
        vision_provider=settings.ACTIVE_VISION_PROVIDER,
        gemini_configured=bool(settings.GEMINI_API_KEY),
        supabase_configured=supabase_service.is_connected(),
        supported_pests=len(get_all_pests())
    )

@router.get("/diagnostics")
async def get_diagnostics():
    """
    Safely inspects Railway deployment environment and API key detection status.
    Strictly reports presence and non-empty status — NEVER exposes secret values.
    """
    settings.resolve_api_keys()

    candidate_keys = [
        "GEMINI_API_KEY",
        "GOOGLE_API_KEY",
        "GOOGLE_GEMINI_API_KEY",
        "GEMINI_KEY",
        "VITE_GEMINI_API_KEY",
        "SARVAM_API_KEY",
        "SARVAMAI_API_KEY",
        "SARVAM_AI_API_KEY",
        "SARVAM_KEY",
        "SARVAM_SUBSCRIPTION_KEY",
        "VITE_SARVAM_API_KEY"
    ]

    key_status = {}
    for k in candidate_keys:
        raw = os.getenv(k)
        if raw is not None:
            clean = raw.strip().strip("'\"").strip()
            key_status[k] = {
                "present": True,
                "length": len(raw),
                "non_empty": len(clean) > 0,
                "has_quotes": raw.startswith(('"', "'")) or raw.endswith(('"', "'"))
            }
        else:
            key_status[k] = {
                "present": False,
                "length": 0,
                "non_empty": False,
                "has_quotes": False
            }

    # Discover any other environment keys containing AI, GEMINI, GOOGLE, or SARVAM
    extra_detected = {}
    for k, val in os.environ.items():
        upper_k = k.upper()
        if any(term in upper_k for term in ["GEMINI", "SARVAM", "GOOGLE"]) and k not in candidate_keys:
            clean = val.strip().strip("'\"").strip()
            extra_detected[k] = {
                "present": True,
                "length": len(val),
                "non_empty": len(clean) > 0
            }

    # Sanitize environment variable names for auditing (names only, sorted)
    all_var_names = sorted(list(os.environ.keys()))

    return {
        "railway": {
            "project_name": os.getenv("RAILWAY_PROJECT_NAME"),
            "project_id": os.getenv("RAILWAY_PROJECT_ID"),
            "service_name": os.getenv("RAILWAY_SERVICE_NAME"),
            "service_id": os.getenv("RAILWAY_SERVICE_ID"),
            "environment_name": os.getenv("RAILWAY_ENVIRONMENT_NAME") or os.getenv("RAILWAY_ENVIRONMENT"),
            "deployment_id": os.getenv("RAILWAY_DEPLOYMENT_ID"),
            "git_commit_sha": os.getenv("RAILWAY_GIT_COMMIT_SHA"),
            "git_branch": os.getenv("RAILWAY_GIT_BRANCH")
        },
        "active_configuration": {
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "sarvam_configured": bool(settings.SARVAM_API_KEY),
            "gemini_model": settings.GEMINI_MODEL,
            "sarvam_tts_model": settings.SARVAM_TTS_MODEL,
            "sarvam_default_speaker": settings.SARVAM_DEFAULT_SPEAKER
        },
        "candidate_keys": key_status,
        "extra_ai_keys": extra_detected,
        "available_env_names": all_var_names
    }
