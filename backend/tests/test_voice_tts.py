import pytest
import base64
import struct
import httpx
from unittest.mock import patch, AsyncMock
from httpx import Response, Request, ASGITransport
from app.main import app
from app.core.config import settings
from app.services.voice import normalize_language_code, SUPPORTED_SPEAKERS

def make_mock_wav_bytes(num_samples: int = 1600, sample_rate: int = 16000) -> bytes:
    """
    Generates a valid 16-bit PCM RIFF WAV byte string for test validation.
    """
    byte_rate = sample_rate * 2
    block_align = 2
    data_size = num_samples * 2
    riff_chunk_size = 36 + data_size
    
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        riff_chunk_size,
        b"WAVE",
        b"fmt ",
        16,       # Subchunk1Size for PCM
        1,        # AudioFormat 1 = PCM
        1,        # NumChannels = 1 (Mono)
        sample_rate,
        byte_rate,
        block_align,
        16,       # BitsPerSample
        b"data",
        data_size
    )
    # Simple sine wave or zero samples
    samples = b"\x00" * data_size
    return header + samples

MOCK_WAV_BASE64 = base64.b64encode(make_mock_wav_bytes()).decode("utf-8")

@pytest.mark.asyncio
async def test_language_code_normalization():
    assert normalize_language_code("od-IN") == "od-IN"
    assert normalize_language_code("or") == "od-IN"
    assert normalize_language_code("or-IN") == "od-IN"
    assert normalize_language_code("odia") == "od-IN"
    assert normalize_language_code("en-IN") == "en-IN"
    assert normalize_language_code("hi-IN") == "hi-IN"

    with pytest.raises(Exception):
        normalize_language_code("fr-FR")

@pytest.mark.asyncio
async def test_voice_speakers_and_health_endpoints():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Test speakers endpoint
        speakers_res = await client.get("/api/v1/voice/speakers")
        assert speakers_res.status_code == 200
        data = speakers_res.json()
        assert data["default_speaker"] == "shubh"
        assert data["supported_language"] == "od-IN"
        assert len(data["speakers"]) >= 6

        # 2. Test health endpoint
        health_res = await client.get("/api/v1/voice/health")
        assert health_res.status_code == 200
        h_data = health_res.json()
        assert h_data["service"] == "krushi-mitra-voice-engine"
        assert h_data["model"] == "bulbul:v3"

@pytest.mark.asyncio
async def test_tts_missing_api_key_fails_closed():
    with patch.object(settings, "SARVAM_API_KEY", None):
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/v1/voice/tts",
                json={"text": "ନମସ୍କାର ଚାଷୀ ଭାଇ", "language_code": "od-IN"}
            )
            assert res.status_code == 503
            assert "temporarily unavailable" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_tts_validation_rejections():
    with patch.object(settings, "SARVAM_API_KEY", "test-key-mock"):
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Empty text
            res_empty = await client.post("/api/v1/voice/tts", json={"text": "", "language_code": "od-IN"})
            assert res_empty.status_code == 422 or res_empty.status_code == 400

            # 2. Whitespace only
            res_ws = await client.post("/api/v1/voice/tts", json={"text": "   \n\t  ", "language_code": "od-IN"})
            assert res_ws.status_code == 400
            assert "empty or whitespace" in res_ws.json()["detail"].lower()

            # 3. Oversized text (> 2500 chars)
            long_text = "ଧାନ " * 700
            res_long = await client.post("/api/v1/voice/tts", json={"text": long_text, "language_code": "od-IN"})
            assert res_long.status_code in (400, 422)

            # 4. Invalid language code
            res_lang = await client.post("/api/v1/voice/tts", json={"text": "ନମସ୍କାର", "language_code": "es-ES"})
            assert res_lang.status_code == 400
            assert "unsupported language code" in res_lang.json()["detail"].lower()

@pytest.mark.asyncio
async def test_tts_odia_speech_synthesis_success():
    """
    Test synthesizing authentic Odia agricultural phrases:
    1. Short Odia greeting.
    2. Long Odia agricultural explanation.
    3. Pest identification result with scientific names.
    4. Odia numbers, dates, and measurements.
    """
    test_phrases = [
        ("ନମସ୍କାର ଚାଷୀ ଭାଇ! କୃଷି ମିତ୍ର AI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।", "greeting"),
        ("ମାଟିଆ ଗୁଣ୍ଡି ପୋକ (Nilaparvata lugens) ରୋକିବା ପାଇଁ ଏକର ପିଛା ୨୦୦ ଲିଟର ପାଣିରେ ୯୪ ମିଲି ପେକ୍ସାଲୋନ୍ ମିଶାଇ ଗଛ ମୂଳକୁ ସିଞ୍ଚନ କରନ୍ତୁ।", "scientific_pest"),
        ("କାଣ୍ଡବିନ୍ଧା ପୋକ (Scirpophaga incertulas) ର କ୍ଷତି: ମଝି କାଣ୍ଡ ମରି ଶୁଖିଯାଏ। ୫ ପ୍ରତିଶତ ମଜା ମରିବା ହେଉଛି ETL ସୀମା।", "etl_measurement")
    ]

    mock_resp = Response(
        status_code=200,
        json={"audios": [MOCK_WAV_BASE64]},
        request=Request("POST", settings.SARVAM_TTS_ENDPOINT)
    )

    with patch.object(settings, "SARVAM_API_KEY", "test-valid-key"):
        with patch("app.services.voice._call_sarvam_api", new_callable=AsyncMock) as mock_call:
            mock_call.return_value = mock_resp

            async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                for phrase, label in test_phrases:
                    res = await client.post(
                        "/api/v1/voice/tts",
                        json={
                            "text": phrase,
                            "language_code": "od-IN",
                            "speaker": "shubh",
                            "pace": 1.0
                        }
                    )
                    assert res.status_code == 200, f"Failed on {label}"
                    data = res.json()
                    assert data["mime_type"] == "audio/wav"
                    assert data["language_code"] == "od-IN"
                    assert data["speaker"] == "shubh"
                    assert data["provider"] == "sarvam-bulbul-v3"
                    assert data["character_count"] == len(phrase)

                    # Validate base64 payload decodes to authentic RIFF WAVE audio header
                    decoded = base64.b64decode(data["audio_base64"])
                    assert decoded.startswith(b"RIFF")
                    assert b"WAVE" in decoded[:12]
                    assert len(decoded) > 44

@pytest.mark.asyncio
async def test_tts_provider_error_handling():
    with patch.object(settings, "SARVAM_API_KEY", "test-key"):
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Timeout (HTTP 504)
            with patch("app.services.voice._call_sarvam_api", side_effect=httpx.TimeoutException("Timed out")):
                res_to = await client.post("/api/v1/voice/tts", json={"text": "ନମସ୍କାର", "language_code": "od-IN"})
                assert res_to.status_code == 504
                assert "timed out" in res_to.json()["detail"].lower()

            # 2. Authentication failure (HTTP 401 from Sarvam -> 502 Bad Gateway)
            mock_401 = Response(401, text="Unauthorized", request=Request("POST", settings.SARVAM_TTS_ENDPOINT))
            with patch("app.services.voice._call_sarvam_api", new_callable=AsyncMock, return_value=mock_401):
                res_auth = await client.post("/api/v1/voice/tts", json={"text": "ନମସ୍କାର", "language_code": "od-IN"})
                assert res_auth.status_code == 502
                assert "authentication failure" in res_auth.json()["detail"].lower()

            # 3. Rate limit (HTTP 429 from Sarvam -> 429 Too Many Requests)
            mock_429 = Response(429, text="Rate limit exceeded", request=Request("POST", settings.SARVAM_TTS_ENDPOINT))
            with patch("app.services.voice._call_sarvam_api", new_callable=AsyncMock, return_value=mock_429):
                res_rl = await client.post("/api/v1/voice/tts", json={"text": "ନମସ୍କାର", "language_code": "od-IN"})
                assert res_rl.status_code == 429
                assert "rate limit" in res_rl.json()["detail"].lower()

            # 4. Empty audio response from provider (HTTP 502)
            mock_empty_audio = Response(200, json={"audios": []}, request=Request("POST", settings.SARVAM_TTS_ENDPOINT))
            with patch("app.services.voice._call_sarvam_api", new_callable=AsyncMock, return_value=mock_empty_audio):
                res_empty = await client.post("/api/v1/voice/tts", json={"text": "ନମସ୍କାର", "language_code": "od-IN"})
                assert res_empty.status_code == 502
                assert "empty or unparseable" in res_empty.json()["detail"].lower()
