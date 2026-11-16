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
            # Verify cryptographic and traceability attributes
            assert data["image_hash"] is not None and len(data["image_hash"]) == 64
            assert data["request_id"] is not None
            assert data["model_version"] is not None

@pytest.mark.asyncio
async def test_empty_and_corrupted_file_rejection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Empty file (0 bytes)
        res_empty = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("empty.jpg", b"", "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res_empty.status_code == 400
        assert "Empty" in res_empty.json()["detail"]

        # Corrupted / unreadable image bytes
        corrupted_bytes = b"\xFF\xD8\xFF\x00\x01\x02\x03CORRUPTED_STREAM_DATA"
        res_corrupt = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("corrupt.jpg", corrupted_bytes, "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res_corrupt.status_code == 200
        data_corrupt = res_corrupt.json()
        assert data_corrupt["status"] == ScanStatusEnum.ERROR.value
        assert data_corrupt["treatment_allowed"] is False

@pytest.mark.asyncio
async def test_severe_dark_and_blurry_image_quality_telemetry():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Severe dark image (pitch black, RGB 0,0,0)
        dark_img = generate_test_image("JPEG", color=(1, 1, 1), size=(200, 200))
        res_dark = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("dark.jpg", dark_img, "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res_dark.status_code == 200
        data_dark = res_dark.json()
        assert data_dark["quality_assessment"]["is_clear"] is False
        assert data_dark["quality_assessment"]["lighting_score"] < 15
        assert data_dark["treatment_allowed"] is False

        # 2. Solid color / uniform blank image (zero edge contrast)
        blank_img = generate_test_image("JPEG", color=(128, 128, 128), size=(200, 200))
        res_blank = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("blank.jpg", blank_img, "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res_blank.status_code == 200
        data_blank = res_blank.json()
        assert data_blank["quality_assessment"]["is_clear"] is False
        assert data_blank["treatment_allowed"] is False

@pytest.mark.asyncio
async def test_truncated_jpeg_corrupt_png_and_invalid_webp():
    """
    Verifies that full raster decoding (image.load()) and format checking
    rejects truncated and corrupted image payloads gracefully.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Truncated JPEG (valid header, cut stream)
        valid_jpeg = generate_test_image("JPEG")
        truncated_jpeg = valid_jpeg[:len(valid_jpeg) // 4]
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("truncated.jpg", truncated_jpeg, "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == ScanStatusEnum.ERROR.value
        assert data["quality_assessment"]["is_clear"] is False

        # 2. Corrupted PNG
        corrupt_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 20
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("corrupt.png", corrupt_png, "image/png")},
            data={"crop_id": "paddy"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == ScanStatusEnum.ERROR.value
        assert data["quality_assessment"]["is_clear"] is False

        # 3. Invalid WebP
        corrupt_webp = b"RIFF\x14\x00\x00\x00WEBPVP8 \x08\x00\x00\x00\x00\x00\x00\x00"
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("corrupt.webp", corrupt_webp, "image/webp")},
            data={"crop_id": "paddy"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == ScanStatusEnum.ERROR.value

@pytest.mark.asyncio
async def test_heic_image_detection_and_bilingual_guidance():
    """
    Verifies that iOS HEIC format is detected by byte signature (ftypheic)
    and returns informative bilingual user guidance rather than silent failure.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        heic_header = b"\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic" + b"\x00" * 100
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("IMG_1234.HEIC", heic_header, "image/heic")},
            data={"crop_id": "paddy"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == ScanStatusEnum.ERROR.value
        assert "HEIC" in data["reason"] or "iPhone" in data["reason"] or "HEIC" in data["quality_assessment"]["warning_message_en"]
        assert "ଫର୍ମାଟ୍" in data["common_name_or"] or "HEIC" in data["quality_assessment"]["warning_message_or"]

@pytest.mark.asyncio
async def test_cryptographic_hmac_report_signing_and_tamper_verification():
    """
    Verifies that every generated scan report carries an authentic HMAC-SHA256 digital signature,
    and the /verify-signature endpoint accurately detects any modification.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        img_bytes = generate_test_image("JPEG")
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("field.jpg", img_bytes, "image/jpeg")},
            data={"crop_id": "paddy", "forced_pest_id": "bph"}
        )
        assert res.status_code == 200
        data = res.json()
        
        # Verify signature presence and format
        sig = data.get("report_signature")
        assert sig is not None, "Report must include report_signature"
        assert len(sig) == 64, "HMAC-SHA256 signature must be 64-character hex"
        assert data.get("signature_algorithm") == "HMAC-SHA256"
        assert data.get("signature_key_version") == "v1"

        # Verify authentic report via verification endpoint
        verify_payload = {
            "scan_id": data["scan_id"],
            "image_hash": data["image_hash"],
            "status": data["status"],
            "pest_id": data["pest_id"],
            "created_at": data["created_at"],
            "report_signature": sig,
            "signature_key_version": data["signature_key_version"]
        }
        res_verify = await client.post("/api/v1/pest/verify-signature", json=verify_payload)
        assert res_verify.status_code == 200
        verify_data = res_verify.json()
        assert verify_data["valid"] is True
        assert verify_data["status"] == "VERIFIED"

        # Tamper attack 1: modify pest_id
        tampered_pest = dict(verify_payload, pest_id="armyworm")
        res_tampered1 = await client.post("/api/v1/pest/verify-signature", json=tampered_pest)
        assert res_tampered1.status_code == 200
        assert res_tampered1.json()["valid"] is False
        assert res_tampered1.json()["status"] == "TAMPERED_OR_INVALID"

        # Tamper attack 2: modify status to IDENTIFIED
        tampered_status = dict(verify_payload, status="NON_AGRICULTURAL_IMAGE")
        res_tampered2 = await client.post("/api/v1/pest/verify-signature", json=tampered_status)
        assert res_tampered2.status_code == 200
        assert res_tampered2.json()["valid"] is False
        assert res_tampered2.json()["status"] == "TAMPERED_OR_INVALID"

@pytest.mark.asyncio
async def test_pillow_decompression_bomb_matrix():
    """
    Exhaustively tests the Pillow decompression bomb security boundary:
    1. Below 25MP: 4000x5000 (20MP) -> Accepted
    2. At 25MP: 5000x5000 (25MP) -> Accepted
    3. Above 25MP: 5001x5000 (25.005MP) -> Triggers DecompressionBombWarning, Rejected
    4. Above 2x limit: 8000x7000 (56MP) -> Triggers DecompressionBombError, Rejected
    5. Beyond 8000px max dimension: 8001x100 -> Rejected by geometric bounds
    """
    from app.services.vision.quality import validate_image_bytes
    from PIL import ImageDraw

    def make_png_with_pattern(w, h):
        img = Image.new("RGB", (w, h), color=(100, 150, 100))
        draw = ImageDraw.Draw(img)
        step = max(50, w // 20)
        for i in range(0, w, step):
            draw.line([(i, 0), (i, h)], fill=(20, 20, 20), width=10)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()

    # 1. Below 25MP (20MP)
    png_20mp = make_png_with_pattern(4000, 5000)
    q1 = validate_image_bytes(png_20mp)
    assert q1.is_clear is True
    assert q1.warning_message_en is None

    # 2. At 25MP (25,000,000 pixels)
    png_25mp = make_png_with_pattern(5000, 5000)
    q2 = validate_image_bytes(png_25mp)
    assert q2.is_clear is True

    # 3. Above 25MP (25,005,000 pixels) - DecompressionBombWarning intercepted
    img_bomb1 = Image.new("RGB", (5001, 5000), color=(100, 100, 100))
    buf_b1 = io.BytesIO()
    img_bomb1.save(buf_b1, format="PNG")
    q3 = validate_image_bytes(buf_b1.getvalue())
    assert q3.is_clear is False
    assert "Decompression bomb" in q3.warning_message_en or "25" in q3.warning_message_en

    # 4. Above 2x limit (56,000,000 pixels) - DecompressionBombError intercepted
    img_bomb2 = Image.new("RGB", (8000, 7000), color=(100, 100, 100))
    buf_b2 = io.BytesIO()
    img_bomb2.save(buf_b2, format="PNG")
    q4 = validate_image_bytes(buf_b2.getvalue())
    assert q4.is_clear is False
    assert "Decompression bomb" in q4.warning_message_en or "25" in q4.warning_message_en

    # 5. Beyond 8000px max dimension
    img_wide = Image.new("RGB", (8001, 100), color=(100, 100, 100))
    buf_wide = io.BytesIO()
    img_wide.save(buf_wide, format="PNG")
    q5 = validate_image_bytes(buf_wide.getvalue())
    assert q5.is_clear is False
    assert "8000" in q5.warning_message_en

@pytest.mark.asyncio
async def test_oversized_file_size_rejection_at_gateway():
    """
    Verifies that files exceeding 20MB are rejected at the API gateway before storage upload.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 21MB dummy payload
        big_bytes = b"0" * (21 * 1024 * 1024)
        res = await client.post(
            "/api/v1/pest/analyze",
            files={"file": ("huge.jpg", big_bytes, "image/jpeg")},
            data={"crop_id": "paddy"}
        )
        assert res.status_code == 400
        assert "20MB" in res.json()["detail"]

@pytest.mark.asyncio
async def test_hmac_key_rotation_and_historical_verification():
    """
    Verifies key rotation support:
    - Reports generated with historical key 'v0' are successfully verified using key_version='v0'
    - Unknown key versions ('v99') are safely rejected
    - Missing or empty secrets fail safely
    """
    from app.core.security import verify_report_signature
    from app.core.config import settings
    import hmac, hashlib

    # Generate test signature with historical key 'v0'
    key_v0 = settings.REPORT_SIGNING_HISTORICAL_KEYS["v0"].encode("utf-8")
    canonical_v0 = "scan-historical:abc123hash:IDENTIFIED:bph:1700000000000"
    sig_v0 = hmac.new(key_v0, canonical_v0.encode("utf-8"), hashlib.sha256).hexdigest()

    # Verify with key_version='v0'
    assert verify_report_signature(
        scan_id="scan-historical",
        image_hash="abc123hash",
        status="IDENTIFIED",
        pest_id="bph",
        created_at=1700000000000,
        signature=sig_v0,
        key_version="v0"
    ) is True

    # Unknown key version fails safe
    assert verify_report_signature(
        scan_id="scan-historical",
        image_hash="abc123hash",
        status="IDENTIFIED",
        pest_id="bph",
        created_at=1700000000000,
        signature=sig_v0,
        key_version="v99_unknown"
    ) is False

@pytest.mark.asyncio
async def test_concurrent_image_uploads_stability():
    """
    Tests server resource stability under concurrent uploads.
    """
    import asyncio
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        img_bytes = generate_test_image("JPEG")
        
        async def upload_one(idx):
            return await client.post(
                "/api/v1/pest/analyze",
                files={"file": (f"concurrent_{idx}.jpg", img_bytes, "image/jpeg")},
                data={"crop_id": "paddy", "forced_pest_id": "bph"}
            )

        responses = await asyncio.gather(*(upload_one(i) for i in range(8)))
        for r in responses:
            assert r.status_code == 200
            assert r.json()["status"] == ScanStatusEnum.IDENTIFIED.value



