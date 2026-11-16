import logging
import httpx
from fastapi import HTTPException
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.models.voice import VoiceTTSResponse, SpeakerInfo, SupportedSpeakersResponse

logger = logging.getLogger(__name__)

# Canonical language code mappings for Odia
SUPPORTED_LANGUAGE_CODES: Dict[str, str] = {
    "od-in": "od-IN",
    "od_in": "od-IN",
    "or": "od-IN",
    "or-in": "od-IN",
    "or_in": "od-IN",
    "odia": "od-IN",
    "en-in": "en-IN",
    "hi-in": "hi-IN"
}

SUPPORTED_SPEAKERS: List[SpeakerInfo] = [
    SpeakerInfo(name="shubh", gender="male", recommended_for=["farmer_advisory", "clear_pronunciation"]),
    SpeakerInfo(name="priya", gender="female", recommended_for=["welcoming_guidance", "village_assistant"]),
    SpeakerInfo(name="neha", gender="female", recommended_for=["fast_reading", "brief_alerts"]),
    SpeakerInfo(name="aditya", gender="male", recommended_for=["formal_announcements"]),
    SpeakerInfo(name="ritu", gender="female", recommended_for=["conversational"]),
    SpeakerInfo(name="kavya", gender="female", recommended_for=["conversational"])
]

def normalize_language_code(code: str) -> str:
    """
    Normalizes input language codes to Sarvam Bulbul v3 target_language_code.
    Maps 'or', 'or-IN', 'odia' -> 'od-IN'.
    """
    clean = code.strip().lower()
    if clean not in SUPPORTED_LANGUAGE_CODES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language code '{code}'. Use 'od-IN' for authentic Odia speech generation."
        )
    return SUPPORTED_LANGUAGE_CODES[clean]

async def _call_sarvam_api(payload: Dict[str, Any], headers: Dict[str, str]) -> httpx.Response:
    """
    Makes outbound request to Sarvam AI Bulbul v3 TTS endpoint with timeout.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        return await client.post(
            settings.SARVAM_TTS_ENDPOINT,
            json=payload,
            headers=headers
        )

async def synthesize_odia_speech(
    text: str,
    language_code: str = "od-IN",
    speaker: Optional[str] = None,
    pace: float = 1.0
) -> VoiceTTSResponse:
    """
    Synthesizes speech in Odia using Sarvam AI Bulbul v3.
    Enforces strict input validation, rate limiting handling, and credentials protection.
    """
    # 1. Input text validation
    cleaned_text = text.strip() if text else ""
    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Text to synthesize must not be empty or whitespace."
        )

    if len(cleaned_text) > 2500:
        raise HTTPException(
            status_code=400,
            detail=f"Text length ({len(cleaned_text)} chars) exceeds maximum allowable limit of 2500 characters."
        )

    # 2. Language code validation
    target_lang = normalize_language_code(language_code)

    # 3. Speaker selection
    selected_speaker = (speaker.strip().lower() if speaker else settings.SARVAM_DEFAULT_SPEAKER)

    # 4. Pace bounds validation (0.5 to 2.0)
    clamped_pace = max(0.5, min(2.0, float(pace)))

    # 5. Verify provider credentials
    if not settings.SARVAM_API_KEY or not settings.SARVAM_API_KEY.strip():
        logger.warning("SARVAM_API_KEY is not configured on backend. Failing closed with HTTP 503.")
        raise HTTPException(
            status_code=503,
            detail="Odia voice synthesis is temporarily unavailable. Provider key not configured on backend."
        )

    # 6. Execute external request with timeout and error handling
    payload: Dict[str, Any] = {
        "text": cleaned_text,
        "target_language_code": target_lang,
        "speaker": selected_speaker,
        "pace": clamped_pace,
        "model": settings.SARVAM_TTS_MODEL
    }

    headers = {
        "api-subscription-key": settings.SARVAM_API_KEY.strip(),
        "Content-Type": "application/json"
    }

    logger.info(
        "Synthesizing speech via Sarvam AI: model=%s, lang=%s, speaker=%s, chars=%d",
        settings.SARVAM_TTS_MODEL,
        target_lang,
        selected_speaker,
        len(cleaned_text)
    )

    try:
        response = await _call_sarvam_api(payload, headers)

        if response.status_code == 200:
            data = response.json()
            audios = data.get("audios")
            if not audios or not isinstance(audios, list) or len(audios) == 0 or not audios[0]:
                logger.error("Sarvam TTS returned HTTP 200 but audios array is empty or invalid.")
                raise HTTPException(
                    status_code=502,
                    detail="Voice provider returned an empty or unparseable audio stream."
                )

            audio_base64 = audios[0]
            if not isinstance(audio_base64, str) or len(audio_base64.strip()) == 0:
                raise HTTPException(
                    status_code=502,
                    detail="Invalid base64 audio payload received from voice provider."
                )

            return VoiceTTSResponse(
                audio_base64=audio_base64.strip(),
                mime_type="audio/wav",
                language_code=target_lang,
                speaker=selected_speaker,
                character_count=len(cleaned_text),
                provider="sarvam-bulbul-v3"
            )

        elif response.status_code == 400:
            logger.error("Sarvam TTS 400 Bad Request: %s", response.text[:200])
            raise HTTPException(
                status_code=400,
                detail="Voice synthesis request was rejected by provider as malformed."
            )

        elif response.status_code in (401, 403):
            logger.error("Sarvam TTS authentication failure (HTTP %d).", response.status_code)
            raise HTTPException(
                status_code=502,
                detail="Voice synthesis authentication failure with upstream provider."
            )

        elif response.status_code == 429:
            logger.warning("Sarvam TTS rate limit reached (HTTP 429).")
            raise HTTPException(
                status_code=429,
                detail="Voice synthesis rate limit exceeded. Please wait a moment and retry."
            )

        else:
            logger.error("Sarvam TTS unexpected upstream error HTTP %d: %s", response.status_code, response.text[:200])
            raise HTTPException(
                status_code=503,
                detail=f"Upstream voice synthesis service error (HTTP {response.status_code})."
            )

    except httpx.TimeoutException:
        logger.error("Sarvam TTS request timed out after 15 seconds.")
        raise HTTPException(
            status_code=504,
            detail="Voice synthesis provider request timed out. Please try again."
        )

    except httpx.RequestError as exc:
        logger.error("Sarvam TTS network connection error: %s", str(exc))
        raise HTTPException(
            status_code=502,
            detail="Network communication error connecting to voice synthesis service."
        )
