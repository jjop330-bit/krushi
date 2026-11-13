import io
import pytest
from PIL import Image
from app.services.vision.baseline import VerifiedExpertBaselineProvider
from app.services.vision.yolo import ModularYOLOAdapter
from app.services.vision.gemini import GeminiVisionProvider

def get_sample_bytes(color=(40, 100, 40)) -> bytes:
    img = Image.new("RGB", (180, 180), color=color)
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
