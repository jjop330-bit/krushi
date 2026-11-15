import io
import pytest
from PIL import Image, ImageDraw
from app.services.vision.baseline import VerifiedExpertBaselineProvider
from app.services.vision.yolo import ModularYOLOAdapter
from app.services.vision.gemini import GeminiVisionProvider

def get_sample_bytes() -> bytes:
    img = Image.new("RGB", (200, 200), color=(180, 220, 160))
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 180, 180], fill=(40, 80, 30), outline=(0, 0, 0), width=4)
    draw.line([(0, 100), (200, 100)], fill=(200, 50, 50), width=5)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

@pytest.mark.asyncio
async def test_baseline_provider_direct():
    provider = VerifiedExpertBaselineProvider()
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy", forced_pest_id="stem_borer")
    assert result.identification.pest_id == "stem_borer"
    assert result.identification.confidence >= 90
    assert result.source_model == "expert-verified-baseline"

@pytest.mark.asyncio
async def test_yolo_adapter_honest_status():
    adapter = ModularYOLOAdapter()
    status = adapter.get_adapter_status()
    assert "Modular YOLO Adapter" in status["adapter_type"]
    assert "status" in status
    
    # Analyze with adapter (ensures fallback works cleanly without fake weights)
    img_bytes = get_sample_bytes()
    result = await adapter.analyze(img_bytes, crop_id="paddy", forced_pest_id="leaf_folder")
    assert result.identification.pest_id == "leaf_folder"
    assert "yolo" in result.source_model.lower()

@pytest.mark.asyncio
async def test_gemini_provider_fallback_when_unkeyed():
    provider = GeminiVisionProvider()
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy", forced_pest_id="rice_hispa")
    assert result.identification.pest_id == "rice_hispa"
    assert result.identification.confidence >= 80

@pytest.mark.asyncio
async def test_gemini_provider_http_400_invalid_key(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "invalid_test_key_AIzaSyFake")
    provider = GeminiVisionProvider()
    
    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.json.return_value = {"error": {"message": "API key not valid. Please pass a valid API key."}}
    mock_resp.text = '{"error": {"message": "API key not valid"}}'
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    # Must report ERROR, never fabricate or pretend success
    assert result.status == "ERROR"
    assert "Gemini API Error (400)" in result.common_name
    assert result.treatment_allowed is False
    assert result.identification.confidence is None

@pytest.mark.asyncio
async def test_gemini_provider_http_429_quota_limit(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "quota_exhausted_key")
    provider = GeminiVisionProvider()
    
    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.json.return_value = {"error": {"message": "Resource has been exhausted (e.g. check quota)."}}
    mock_resp.text = '{"error": {"message": "Quota exceeded"}}'
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "ERROR"
    assert result.treatment_allowed is False
    assert "429" in result.reason

@pytest.mark.asyncio
async def test_gemini_provider_timeout(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock
    import httpx
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "valid_mock_key")
    provider = GeminiVisionProvider()
    
    mock_post = AsyncMock(side_effect=httpx.TimeoutException("Connection timed out after 50.0s"))
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "ERROR"
    assert result.treatment_allowed is False
    assert "timed out" in result.reason.lower()

@pytest.mark.asyncio
async def test_gemini_provider_unavailable_model(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "valid_mock_key")
    provider = GeminiVisionProvider()
    
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_resp.json.return_value = {"error": {"message": "models/gemini-obsolete is not found for API version v1beta"}}
    mock_resp.text = '{"error": {"message": "models/gemini-obsolete not found"}}'
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "ERROR"
    assert result.treatment_allowed is False
    assert "404" in result.reason

@pytest.mark.asyncio
async def test_gemini_provider_malformed_json_response(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "valid_mock_key")
    provider = GeminiVisionProvider()
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "THIS IS NOT VALID JSON AT ALL {unclosed"}]
                }
            }
        ]
    }
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "UNCLEAR_IMAGE" or result.status == "ERROR"
    assert result.treatment_allowed is False

@pytest.mark.asyncio
async def test_gemini_provider_unsupported_beneficial_insect(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    import json
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "valid_mock_key")
    provider = GeminiVisionProvider()
    
    spider_payload = {
        "status": "OTHER_INSECT",
        "pest_id": None,
        "common_name": "Lycosa wolf spider (beneficial predator)",
        "scientific_name": "Lycosa pseudoannulata",
        "confidence": 92,
        "confidence_type": "model_raw",
        "visual_evidence": ["Radiating leg pattern", "Prominent dorsal markings"],
        "crop": "Rice",
        "life_stage": "Adult predator",
        "reason": "Beneficial wolf spider predating on planthoppers.",
        "limitations": ["Not a pest; beneficial natural enemy."],
        "needs_better_image": False,
        "treatment_allowed": False,
        "expert_review_recommended": False
    }
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": json.dumps(spider_payload)}]}}]
    }
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "OTHER_INSECT"
    assert result.treatment_allowed is False
    assert result.pest_id is None

@pytest.mark.asyncio
async def test_gemini_provider_disease_only_no_insect(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    import json
    
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "valid_mock_key")
    provider = GeminiVisionProvider()
    
    blast_payload = {
        "status": "CROP_DAMAGE_NO_VISIBLE_INSECT",
        "pest_id": None,
        "common_name": "Rice leaf blast spindle lesion (disease)",
        "scientific_name": "Magnaporthe oryzae",
        "confidence": 88,
        "confidence_type": "model_raw",
        "visual_evidence": ["Spindle-shaped necrotic lesions with greyish center"],
        "crop": "Rice",
        "life_stage": "Unknown",
        "reason": "Foliage exhibits fungal disease lesions; no visible insect specimen.",
        "limitations": ["Insect-targeted insecticide cannot cure fungal blast."],
        "needs_better_image": False,
        "treatment_allowed": False,
        "expert_review_recommended": True
    }
    
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": json.dumps(blast_payload)}]}}]
    }
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    assert result.status == "CROP_DAMAGE_NO_VISIBLE_INSECT"
    assert result.treatment_allowed is False

@pytest.mark.asyncio
async def test_gemini_provider_secret_exposure_protection(monkeypatch):
    from app.core.config import settings
    from unittest.mock import AsyncMock, MagicMock
    import httpx
    
    secret_key = "super_confidential_api_secret_key_12345"
    monkeypatch.setattr(settings, "GEMINI_API_KEY", secret_key)
    provider = GeminiVisionProvider()
    
    mock_resp = MagicMock()
    mock_resp.status_code = 403
    mock_resp.json.return_value = {"error": {"message": f"Forbidden access with key {secret_key}"}}
    mock_resp.text = f'{{"error": "{secret_key}"}}'
    
    mock_post = AsyncMock(return_value=mock_resp)
    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)
    
    img_bytes = get_sample_bytes()
    result = await provider.analyze(img_bytes, crop_id="paddy")
    
    # Check all fields of result to ensure secret_key is never exposed in client payload
    result_dict = result.model_dump()
    result_str = str(result_dict)
    
    assert secret_key not in result_dict.get("reason", "")
    assert secret_key not in str(result_dict.get("limitations", []))
    assert secret_key not in result_str

def test_pest_etl_definitions():
    from app.services.knowledge import PEST_KNOWLEDGE_DICT
    
    supported_pests = ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm"]
    for pest_id in supported_pests:
        assert pest_id in PEST_KNOWLEDGE_DICT
        data = PEST_KNOWLEDGE_DICT[pest_id]
        assert "economic_threshold_level_en" in data
        assert len(data["economic_threshold_level_en"]) > 10
        assert "economic_threshold_level_or" in data
        assert len(data["economic_threshold_level_or"]) > 10

