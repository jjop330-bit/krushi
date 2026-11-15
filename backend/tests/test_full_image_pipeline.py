import io
import base64
import pytest
from PIL import Image
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.pest import ScanStatusEnum

def generate_test_image(format="JPEG", color=(40, 160, 40), size=(300, 300)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

@pytest.mark.asyncio
async def test_all_11_target_image_classes():
    """
    Verifies that the vision pipeline correctly handles all 11 target classes required by Phase 3:
    1. Brown planthopper (bph)
    2. Yellow stem borer (stem_borer)
    3. Rice leaf folder (leaf_folder)
    4. Rice hispa (rice_hispa)
    5. Rice armyworm (armyworm)
    6. Beneficial predator (beneficial_spider)
    7. Other insect (other_insect)
    8. Healthy crop (healthy_paddy)
    9. Crop damage without visible insect (crop_damage_no_insect)
    10. Unclear image (unclear_image)
    11. Non-agricultural / unsupported (non_agricultural)
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        test_cases = [
            ("bph", ScanStatusEnum.IDENTIFIED, True),
            ("stem_borer", ScanStatusEnum.IDENTIFIED, True),
            ("leaf_folder", ScanStatusEnum.IDENTIFIED, True),
            ("rice_hispa", ScanStatusEnum.IDENTIFIED, True),
            ("armyworm", ScanStatusEnum.IDENTIFIED, True),
            ("beneficial_spider", ScanStatusEnum.OTHER_INSECT, False),
            ("other_insect", ScanStatusEnum.OTHER_INSECT, False),
            ("healthy_paddy", ScanStatusEnum.HEALTHY_CROP, False),
            ("crop_damage_no_insect", ScanStatusEnum.CROP_DAMAGE_NO_VISIBLE_INSECT, False),
            ("unclear_image", ScanStatusEnum.UNCLEAR_IMAGE, False),
            ("non_agricultural", ScanStatusEnum.NON_AGRICULTURAL_IMAGE, False),
        ]

        img_bytes = generate_test_image("JPEG")

        for forced_id, expected_status, treatment_expected in test_cases:
            res = await client.post(
                "/api/v1/pest/analyze",
                files={"file": ("test.jpg", img_bytes, "image/jpeg")},
                data={"crop_id": "paddy", "farmer_district": "bargarh", "forced_pest_id": forced_id}
            )
            assert res.status_code == 200, f"Failed for {forced_id}: {res.text}"
            data = res.json()
            assert data["status"] == expected_status.value, f"Mismatch for {forced_id}: got {data['status']}, expected {expected_status.value}"
            assert data["treatment_allowed"] is treatment_expected, f"Treatment gating failed for {forced_id}: got {data['treatment_allowed']}"

@pytest.mark.asyncio
async def test_png_and_webp_mime_types():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for fmt, mime in [("PNG", "image/png"), ("WEBP", "image/webp"), ("JPEG", "image/jpeg")]:
            img_bytes = generate_test_image(format=fmt)
            res = await client.post(
                "/api/v1/pest/analyze",
                files={"file": (f"test.{fmt.lower()}", img_bytes, mime)},
                data={"crop_id": "paddy", "forced_pest_id": "bph"}
            )
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == ScanStatusEnum.IDENTIFIED.value
            assert data["pest_id"] == "bph"
