import io
import base64
import pytest
from PIL import Image
from httpx import AsyncClient, ASGITransport
from app.main import app

def create_test_image_base64(color=(34, 139, 34), size=(200, 200)) -> str:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

@pytest.mark.asyncio
async def test_analyze_pest_endpoint_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        b64 = create_test_image_base64()
        payload = {
            "image_base64": b64,
            "crop_id": "paddy",
            "farmer_district": "bargarh",
            "forced_pest_id": "bph"
        }
        response = await client.post("/api/v1/pest/analyze-base64", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["identification"]["pest_id"] == "bph"
        assert data["identification"]["confidence"] >= 80
        assert "observed_visual_features" in data
        assert "immediate_actions_en" in data
        assert len(data["immediate_actions_en"]) > 0

@pytest.mark.asyncio
async def test_list_species_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/pest/species")
        assert response.status_code == 200
        species = response.json()
        assert len(species) >= 7
        ids = [s["id"] for s in species]
        assert "bph" in ids
        assert "stem_borer" in ids
        assert "leaf_folder" in ids
        assert "rice_hispa" in ids
        assert "armyworm" in ids
        assert "beneficial_spider" in ids
        assert "healthy_paddy" in ids

@pytest.mark.asyncio
async def test_single_species_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/pest/species/bph")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "bph"
        assert "Nilaparvata lugens" in data["scientific_name"]
        assert "ମାଟିଆ ଗୁଣ୍ଡି ପୋକ" in data["common_name_or"]
