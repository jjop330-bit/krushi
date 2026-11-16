import logging
import hashlib
from collections import OrderedDict
from fastapi import HTTPException
from typing import Optional, Dict, Any, List, Tuple
from app.core.config import settings
from app.models.voice import VoiceTTSResponse, SpeakerInfo, SupportedSpeakersResponse

import sarvamai
from sarvamai import AsyncSarvamAI

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

# In-memory LRU Cache for audio payloads (max 256 cached items to minimize API credit consumption)
_AUDIO_CACHE: OrderedDict[str, VoiceTTSResponse] = OrderedDict()
_CACHE_MAX_SIZE = 256

def _generate_cache_key(text: str, lang: str, speaker: str, pace: float, model: str) -> str:
    raw = f"{text}|{lang}|{speaker}|{pace:.2f}|{model}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

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

async def _call_sarvam_sdk(
    api_key: str,
    text: str,
    language_code: str,
    speaker: str,
    pace: float,
    model: str
) -> Any:
    """
    Calls Sarvam AI Bulbul v3 text-to-speech using official sarvamai AsyncSarvamAI SDK.
    """
    client = AsyncSarvamAI(api_subscription_key=api_key)
    return await client.text_to_speech.convert(
        text=text,
        language_code=language_code,
        speaker=speaker,
        pace=pace,
        model=model
    )

async def synthesize_odia_speech(
    text: str,
    language_code: str = "od-IN",
    speaker: Optional[str] = None,
    pace: float = 1.0
) -> VoiceTTSResponse:
    """
    Synthesizes speech in Odia using official Sarvam AI SDK (Bulbul v3).
    Enforces strict input validation, in-memory caching to save credits,
    rate limiting protection, and credentials isolation.
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

    # 5. Check in-memory LRU cache to avoid unnecessary billing & repeated requests
    cache_key = _generate_cache_key(cleaned_text, target_lang, selected_speaker, clamped_pace, settings.SARVAM_TTS_MODEL)
    if cache_key in _AUDIO_CACHE:
        logger.info("Serving Odia TTS response from cache for hash=%s", cache_key[:8])
        _AUDIO_CACHE.move_to_end(cache_key)
        cached_res = _AUDIO_CACHE[cache_key]
        return cached_res.model_copy(update={"cached": True})

    # 6. Verify provider credentials
    if not settings.SARVAM_API_KEY or not settings.SARVAM_API_KEY.strip():
        logger.warning("SARVAM_API_KEY is not configured on backend. Failing closed with HTTP 503.")
        raise HTTPException(
            status_code=503,
            detail="Odia voice synthesis is temporarily unavailable. Provider key not configured on backend."
        )

    logger.info(
        "Synthesizing speech via Sarvam AI SDK: model=%s, lang=%s, speaker=%s, chars=%d",
        settings.SARVAM_TTS_MODEL,
        target_lang,
        selected_speaker,
        len(cleaned_text)
    )

    try:
        response = await _call_sarvam_sdk(
            api_key=settings.SARVAM_API_KEY.strip(),
            text=cleaned_text,
            language_code=target_lang,
            speaker=selected_speaker,
            pace=clamped_pace,
            model=settings.SARVAM_TTS_MODEL
        )

        audios = getattr(response, "audios", None)
        if not audios or not isinstance(audios, list) or len(audios) == 0 or not audios[0]:
            logger.error("Sarvam SDK returned empty or invalid audios list.")
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

        result = VoiceTTSResponse(
            audio_base64=audio_base64.strip(),
            mime_type="audio/wav",
            language_code=target_lang,
            speaker=selected_speaker,
            character_count=len(cleaned_text),
            provider="sarvam-bulbul-v3",
            cached=False
        )

        # Store in LRU cache
        if len(_AUDIO_CACHE) >= _CACHE_MAX_SIZE:
            _AUDIO_CACHE.popitem(last=False)
        _AUDIO_CACHE[cache_key] = result

        return result

    except HTTPException:
        raise

    except sarvamai.BadRequestError as err:
        logger.error("Sarvam SDK BadRequestError: %s", str(err))
        raise HTTPException(
            status_code=400,
            detail=f"Voice synthesis request rejected by provider: {str(err)}"
        )

    except (sarvamai.UnauthorizedError, sarvamai.ForbiddenError) as err:
        logger.error("Sarvam SDK Authentication error: %s", str(err))
        raise HTTPException(
            status_code=502,
            detail="Voice synthesis authentication failure with upstream provider."
        )

    except sarvamai.PaymentRequiredError as err:
        logger.error("Sarvam SDK PaymentRequiredError (credits depleted): %s", str(err))
        raise HTTPException(
            status_code=503,
            detail="Voice synthesis quota or credits currently exhausted on provider account."
        )

    except sarvamai.TooManyRequestsError as err:
        logger.warning("Sarvam SDK Rate limit error (HTTP 429): %s", str(err))
        raise HTTPException(
            status_code=429,
            detail="Voice synthesis rate limit exceeded. Please wait a moment and retry."
        )

    except (sarvamai.GatewayTimeoutError, TimeoutError) as err:
        logger.error("Sarvam SDK Timeout: %s", str(err))
        raise HTTPException(
            status_code=504,
            detail="Voice synthesis provider request timed out. Please try again."
        )

    except Exception as exc:
        logger.error("Unexpected error in Sarvam SDK synthesis: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=503,
            detail=f"Upstream voice synthesis service error: {str(exc)}"
        )
