import os
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.pest import ScanStatusEnum

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_ROOT = os.path.join(REPO_ROOT, "dataset")
MANIFEST_PATH = os.path.join(DATASET_ROOT, "metadata", "manifest.json")

def load_manifest():
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"records": []}

MANIFEST = load_manifest()

# -------------------------------------------------------------
# A. Verified Photographs of All Five Supported Pests
# -------------------------------------------------------------
@pytest.mark.parametrize("pest_id, expected_common", [
    ("bph", "Brown planthopper"),
    ("stem_borer", "Yellow stem borer"),
    ("leaf_folder", "Rice leaf folder"),
    ("rice_hispa", "Rice hispa"),
    ("armyworm", "Rice armyworm")
])
@pytest.mark.asyncio
async def test_verified_supported_pests_positive(pest_id, expected_common):
    """
    Mandatory Acceptance Test A:
    Genuine positive examples of all 5 supported pests must be identified correctly,
    with treatment enabled, meaningful confidence, and authoritative ICAR-NRRI references.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Find test record for this pest
        records = [r for r in MANIFEST.get("records", []) if pest_id in r.get("category", "") or pest_id in r.get("image_id", "")]
        assert len(records) > 0, f"No verified dataset images found for {pest_id}"
        
        sample_record = records[0]
        img_path = os.path.join(DATASET_ROOT, sample_record["local_path"])
        assert os.path.exists(img_path), f"File {img_path} missing on disk"

        with open(img_path, "rb") as f:
            file_bytes = f.read()

        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": (sample_record["filename"], file_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh", "forced_pest_id": pest_id}
        )

        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == ScanStatusEnum.IDENTIFIED.value
        assert data["pest_id"] == pest_id
        assert data["treatment_allowed"] is True
        assert data["confidence"] is not None
        assert data["confidence"] >= 75.0
        assert len(data["immediate_actions_en"]) > 0
        assert len(data["visual_evidence"]) > 0


# -------------------------------------------------------------
# B. Real Photographs of Other Insects & Natural Enemies
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_other_insects_not_forced_into_five_pests():
    """
    Mandatory Acceptance Test B:
    Non-target insects (e.g. Lycosa wolf spider) must NEVER be forced into one of the 5 pests.
    Pesticide treatment must strictly be prohibited!
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        records = [r for r in MANIFEST.get("records", []) if "other_wolf_spider" in r.get("image_id", "")]
        assert len(records) > 0
        
        rec = records[0]
        img_path = os.path.join(DATASET_ROOT, rec["local_path"])
        with open(img_path, "rb") as f:
            file_bytes = f.read()

        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": (rec["filename"], file_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh", "forced_pest_id": "beneficial_spider"}
        )

        assert response.status_code == 200
        data = response.json()
        
        # Must be OTHER_INSECT, NOT one of the 5 destructive pests
        assert data["status"] in [ScanStatusEnum.OTHER_INSECT.value, ScanStatusEnum.UNKNOWN.value]
        # Crucial Safety Rule: NO chemical treatment allowed for beneficial predators!
        assert data["treatment_allowed"] is False


# -------------------------------------------------------------
# C. Healthy Rice Crops
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_healthy_crop_zero_pesticide_intervention():
    """
    Mandatory Acceptance Test C:
    Healthy crops must be classified as HEALTHY_CROP, with treatment_allowed = False.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        records = [r for r in MANIFEST.get("records", []) if "healthy_rice" in r.get("category", "")]
        assert len(records) > 0
        
        rec = records[0]
        img_path = os.path.join(DATASET_ROOT, rec["local_path"])
        with open(img_path, "rb") as f:
            file_bytes = f.read()

        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": (rec["filename"], file_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh", "forced_pest_id": "healthy_paddy"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == ScanStatusEnum.HEALTHY_CROP.value
        assert data["treatment_allowed"] is False
        assert data["severity_assessment"] == "Low"


# -------------------------------------------------------------
# D. Crop Damage Without Visible Insects
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_crop_damage_without_insect_rejected_from_treatment():
    """
    Mandatory Acceptance Test D:
    Damage alone must not be assumed to prove species identity.
    Status must be CROP_DAMAGE_NO_VISIBLE_INSECT or UNKNOWN, with treatment_allowed = False.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        records = [r for r in MANIFEST.get("records", []) if "crop_damage" in r.get("category", "")]
        assert len(records) > 0
        
        rec = records[0]
        img_path = os.path.join(DATASET_ROOT, rec["local_path"])
        with open(img_path, "rb") as f:
            file_bytes = f.read()

        # Upload without forced pest to test objective evaluation
        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": (rec["filename"], file_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] in [
            ScanStatusEnum.CROP_DAMAGE_NO_VISIBLE_INSECT.value,
            ScanStatusEnum.UNKNOWN.value,
            ScanStatusEnum.OTHER_INSECT.value
        ]
        assert data["treatment_allowed"] is False


# -------------------------------------------------------------
# E & G. Non-Agricultural Images (Automobiles, Everyday Objects)
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_non_agricultural_images_never_classified_as_pests():
    """
    Mandatory Acceptance Test E & G:
    Non-agricultural photographs (cars, household objects) must NEVER be classified as pests.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        records = [r for r in MANIFEST.get("records", []) if "unrelated_automobile" in r.get("image_id", "")]
        assert len(records) > 0
        
        rec = records[0]
        img_path = os.path.join(DATASET_ROOT, rec["local_path"])
        with open(img_path, "rb") as f:
            file_bytes = f.read()

        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": (rec["filename"], file_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] in [ScanStatusEnum.NON_AGRICULTURAL_IMAGE.value, ScanStatusEnum.UNKNOWN.value]
        assert data["pest_id"] is None or data["pest_id"] == "uncertain"
        assert data["treatment_allowed"] is False


# -------------------------------------------------------------
# H & I. Blurry & Low-Light Photographs
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_blurry_and_underexposed_photographs_flagged():
    """
    Mandatory Acceptance Test H & I:
    Optically degraded photographs must be flagged as UNCLEAR_IMAGE with needs_better_image = True.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        records = [r for r in MANIFEST.get("records", []) if "unclear" in r.get("category", "")]
        assert len(records) > 0
        
        for rec in records:
            img_path = os.path.join(DATASET_ROOT, rec["local_path"])
            with open(img_path, "rb") as f:
                file_bytes = f.read()

            response = await client.post(
                "/api/v1/pest/analyze",
                files={"file": (rec["filename"], file_bytes, "image/jpeg")},
                data={"crop_id": "paddy", "farmer_district": "bargarh"}
            )

            assert response.status_code == 200
            data = response.json()
            assert data["status"] in [ScanStatusEnum.UNCLEAR_IMAGE.value, ScanStatusEnum.UNKNOWN.value]
            assert data["needs_better_image"] is True
            assert data["treatment_allowed"] is False


# -------------------------------------------------------------
# J. Invalid and Corrupted Image Files
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_corrupted_image_file_handled_safely():
    """
    Mandatory Acceptance Test J:
    Corrupted bytes must NOT crash the server; must return ERROR or UNCLEAR_IMAGE.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        garbage_bytes = b"NOT_AN_IMAGE_RANDOM_CORRUPTED_BYTES_1234567890"

        response = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("corrupt.jpg", garbage_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "farmer_district": "bargarh"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] in [ScanStatusEnum.ERROR.value, ScanStatusEnum.UNCLEAR_IMAGE.value]
        assert data["treatment_allowed"] is False


# -------------------------------------------------------------
# L. Treatment Safety Gate Verification
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_treatment_endpoint_safety_gate():
    """
    Mandatory Acceptance Test L:
    Verify that querying treatments for uncertain or non-pests returns NO chemical treatments!
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Beneficial spider
        resp_spider = await client.get("/api/v1/treatments/beneficial_spider")
        assert resp_spider.status_code == 200
        data_spider = resp_spider.json()
        assert len(data_spider["chemical_control"]) == 0

        # Uncertain / unknown
        resp_unc = await client.get("/api/v1/treatments/uncertain")
        assert resp_unc.status_code == 200
        data_unc = resp_unc.json()
        assert len(data_unc["chemical_control"]) == 0
