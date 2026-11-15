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
