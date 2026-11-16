import io
import base64
import pytest
from PIL import Image
from httpx import AsyncClient, ASGITransport
from app.main import app

def create_sample_image(color=(34, 139, 34), size=(200, 200)) -> str:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

@pytest.mark.asyncio
async def test_crops_registry_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test GET /api/v1/crops
        res = await client.get("/api/v1/crops")
        assert res.status_code == 200
        data = res.json()
        assert data["total_crops"] >= 20
        assert "categories" in data
        assert len(data["categories"]) == 5

        crop_ids = [c["id"] for c in data["crops"]]
        assert "paddy" in crop_ids
        assert "maize" in crop_ids
        assert "ragi" in crop_ids
        assert "moong" in crop_ids
        assert "groundnut" in crop_ids
        assert "tomato" in crop_ids
        assert "brinjal" in crop_ids
        assert "chilli" in crop_ids
        assert "mango" in crop_ids
        assert "coconut" in crop_ids

        # Test category filter
        res_veg = await client.get("/api/v1/crops?category=vegetables")
        assert res_veg.status_code == 200
        veg_data = res_veg.json()
        assert veg_data["total_crops"] >= 8
        for c in veg_data["crops"]:
            assert c["category"] == "vegetables"

        # Test single crop endpoint
        res_tomato = await client.get("/api/v1/crops/tomato")
        assert res_tomato.status_code == 200
        tomato_detail = res_tomato.json()
        assert tomato_detail["id"] == "tomato"
        assert "Solanum lycopersicum" in tomato_detail["scientific_name"]
        assert len(tomato_detail["major_insect_pests"]) >= 2
        assert len(tomato_detail["plant_parts"]) >= 5

        # Test 404 for unknown crop
        res_unknown = await client.get("/api/v1/crops/nonexistent_crop_xyz")
        assert res_unknown.status_code == 404

@pytest.mark.asyncio
async def test_multicrop_pest_diagnosis():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        b64 = create_sample_image()
        
        # Maize: Fall Armyworm
        res_maize = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "maize",
            "plant_part": "whorl",
            "farmer_district": "mayurbhanj",
            "forced_pest_id": "fall_armyworm"
        })
        assert res_maize.status_code == 200
        maize_data = res_maize.json()
        assert maize_data["status"] == "IDENTIFIED"
        assert maize_data["pest_id"] == "fall_armyworm"
        assert "Spodoptera frugiperda" in maize_data["scientific_name"]
        assert maize_data["treatment_allowed"] is True

        # Tomato: Fruit Borer
        res_tomato = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "tomato",
            "plant_part": "fruit",
            "farmer_district": "sambalpur",
            "forced_pest_id": "fruit_borer"
        })
        assert res_tomato.status_code == 200
        tomato_data = res_tomato.json()
        assert tomato_data["status"] == "IDENTIFIED"
        assert tomato_data["pest_id"] == "fruit_borer"
        assert "Helicoverpa armigera" in tomato_data["scientific_name"]
        assert tomato_data["treatment_allowed"] is True

        # Chilli: Black Thrips
        res_chilli = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "chilli",
            "plant_part": "flower",
            "farmer_district": "kuchinda",
            "forced_pest_id": "black_thrips"
        })
        assert res_chilli.status_code == 200
        chilli_data = res_chilli.json()
        assert chilli_data["status"] == "IDENTIFIED"
        assert chilli_data["pest_id"] == "black_thrips"
        assert "Thrips parvispinus" in chilli_data["scientific_name"]

@pytest.mark.asyncio
async def test_false_positive_rejection_matrix():
    """
    Rigorously verifies all critical false-positive rejection cases:
    Empty image, Healthy crop, Crop damage without insects, Non-agricultural,
    Other insects, Unsupported species, etc.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        b64 = create_sample_image()

        # 1. Non-agricultural image
        res_nonagri = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "non_agricultural"
        })
        assert res_nonagri.status_code == 200
        d_nonagri = res_nonagri.json()
        assert d_nonagri["status"] == "NON_AGRICULTURAL_IMAGE"
        assert d_nonagri["treatment_allowed"] is False

        # 2. Healthy crop
        res_healthy = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "healthy_paddy"
        })
        assert res_healthy.status_code == 200
        d_healthy = res_healthy.json()
        assert d_healthy["status"] == "HEALTHY_CROP"
        assert d_healthy["treatment_allowed"] is False

        # 3. Crop damage with no visible insect (e.g. leaf spots, dry leaves)
        res_damage = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "crop_damage_no_insect"
        })
        assert res_damage.status_code == 200
        d_damage = res_damage.json()
        assert d_damage["status"] == "CROP_DAMAGE_NO_VISIBLE_INSECT"
        assert d_damage["treatment_allowed"] is False

        # 4. Other insect (e.g. ladybird beetle, butterfly, non-target)
        res_other = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "other_insect"
        })
        assert res_other.status_code == 200
        d_other = res_other.json()
        assert d_other["status"] == "OTHER_INSECT"
        assert d_other["treatment_allowed"] is False

        # 5. Unsupported species
        res_unsup = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "unsupported_species"
        })
        assert res_unsup.status_code == 200
        d_unsup = res_unsup.json()
        assert d_unsup["status"] == "UNSUPPORTED_SPECIES"
        assert d_unsup["treatment_allowed"] is False

        # 6. Beneficial predator (Wolf spider)
        res_spider = await client.post("/api/v1/pest/analyze-base64", json={
            "image_base64": b64,
            "crop_id": "paddy",
            "forced_pest_id": "beneficial_spider"
        })
        assert res_spider.status_code == 200
        d_spider = res_spider.json()
        assert d_spider["status"] == "OTHER_INSECT"
        assert d_spider["treatment_allowed"] is False
        assert "Lycosa" in d_spider["scientific_name"]

@pytest.mark.asyncio
async def test_multicrop_treatment_etl_gating():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Maize FAW Treatment - Locked without scouting observation
        res_faw_locked = await client.get("/api/v1/treatments/fall_armyworm")
        assert res_faw_locked.status_code == 200
        d_faw = res_faw_locked.json()
        assert d_faw["chemical_authorized"] is False
        assert len(d_faw["chemical_control"]) == 0
        assert len(d_faw["biological_control"]) > 0

        # Maize FAW Treatment - Authorize with verified ETL breach
        res_faw_auth = await client.post("/api/v1/treatments/fall_armyworm/authorize", json={
            "crop_stage": "mid_whorl",
            "sampling_unit": "percent_infested_whorls",
            "pest_count": 15.0,  # ETL is 10%
            "provenance": "FIELD_PILOT_VERIFIED",
            "verifier_id": "PILOT-SUPERVISED-VERIFIER"
        })
        assert res_faw_auth.status_code == 200
        d_auth = res_faw_auth.json()
        assert d_auth["chemical_authorized"] is True
        assert len(d_auth["chemical_control"]) > 0
        assert d_auth["chemical_control"][0]["cibrc_registered"] is True

        # Tomato Fruit Borer - Below ETL should be locked
        res_tomato_below = await client.post("/api/v1/treatments/fruit_borer/authorize", json={
            "crop_stage": "fruiting",
            "sampling_unit": "percent_damaged_fruit",
            "pest_count": 0.5,  # ETL is 2%
            "provenance": "FIELD_PILOT_VERIFIED",
            "verifier_id": "PILOT-SUPERVISED-VERIFIER"
        })
        assert res_tomato_below.status_code == 200
        d_below = res_tomato_below.json()
        assert d_below["chemical_authorized"] is False
        assert len(d_below["chemical_control"]) == 0
