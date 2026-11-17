import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.config import settings
from app.models.voice import (
    VoiceTTSRequest, 
    VoiceTTSResponse, 
    SupportedSpeakersResponse
)
from app.services.voice import (
    synthesize_odia_speech, 
    SUPPORTED_SPEAKERS
)

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/tts", 
    response_model=VoiceTTSResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate authentic Odia speech using Sarvam AI Bulbul v3",
    description="Synthesizes Odia text into natural, native-sounding speech with Sarvam AI Bulbul v3."
)
async def generate_speech(request: VoiceTTSRequest) -> VoiceTTSResponse:
    """
    POST /api/v1/voice/tts
    Synthesizes Odia text into playable WAV audio.
    Enforces maximum 2500 character limit, language validation ('od-IN'), and fail-closed credentials handling.
    """
    return await synthesize_odia_speech(
        text=request.text,
        language_code=request.language_code,
        speaker=request.speaker,
        pace=request.pace or 1.0
    )

@router.get(
    "/speakers",
    response_model=SupportedSpeakersResponse,
    summary="Get supported speaker voice personas for Bulbul v3",
    description="Returns the list of validated speaker voices available for Odia synthesis."
)
async def list_speakers() -> SupportedSpeakersResponse:
    return SupportedSpeakersResponse(
        default_speaker=settings.SARVAM_DEFAULT_SPEAKER,
        supported_language="od-IN",
        speakers=SUPPORTED_SPEAKERS
    )

@router.get(
    "/health",
    summary="Check voice engine status",
    description="Returns operational status of the voice engine and provider key availability."
)
async def voice_health():
    settings.resolve_api_keys()
    is_configured = bool(settings.SARVAM_API_KEY and settings.SARVAM_API_KEY.strip())
    return {
        "service": "krushi-mitra-voice-engine",
        "provider": "sarvam-bulbul-v3",
        "model": settings.SARVAM_TTS_MODEL,
        "default_language": "od-IN",
        "default_speaker": settings.SARVAM_DEFAULT_SPEAKER,
        "provider_key_configured": is_configured,
        "status": "ready" if is_configured else "awaiting_api_key"
    }
