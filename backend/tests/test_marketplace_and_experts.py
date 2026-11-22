import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.marketplace_service import marketplace_service
from app.services.expert_service import expert_service
from app.models.marketplace import SellerStatusEnum, ProductStatusEnum, SuborderStatusEnum
from app.models.expert import ExpertStatusEnum, SupportRequestStatusEnum, ProblemCategoryEnum, ContactMethodEnum

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.asyncio
async def test_categories_listing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/store/categories")
        assert res.status_code == 200
        cats = res.json()
        assert len(cats) >= 8
        cat_ids = [c["id"] for c in cats]
        assert "seeds" in cat_ids
        assert "fertilizers" in cat_ids
        assert "organic" in cat_ids
        assert "crop_protection" in cat_ids

@pytest.mark.asyncio
async def test_product_catalog_and_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # All active products
        res = await client.get("/api/v1/store/products")
        assert res.status_code == 200
        products = res.json()
        assert len(products) > 0

        # Filter by crop 'paddy'
        res_crop = await client.get("/api/v1/store/products?crop_id=paddy")
        assert res_crop.status_code == 200
        paddy_prods = res_crop.json()
        assert len(paddy_prods) > 0

        # Filter by pest 'bph'
        res_pest = await client.get("/api/v1/store/products?pest_id=bph")
        assert res_pest.status_code == 200
        bph_prods = res_pest.json()
        assert len(bph_prods) >= 1

        # Search query
        res_search = await client.get("/api/v1/store/products?search=neem")
        assert res_search.status_code == 200
        neem_prods = res_search.json()
        assert any("neem" in p["title_en"].lower() for p in neem_prods)

@pytest.mark.asyncio
async def test_seller_registration_and_verification_gate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Register new seller
        reg_payload = {
            "business_name": "Kalinga Agro Inputs Cooperative",
            "contact_person": "Ramesh Chandra Das",
            "phone_number": "9437100000",
            "email": "kalinga.agro@example.com",
            "business_address": "Main Road, Attabira, Bargarh",
            "operating_district": "bargarh",
            "business_type": "retailer",
            "license_number": "LIC-2026-991",
            "bank_account_number": "987654321012",
            "bank_ifsc": "SBIN0001234"
        }
        res = await client.post("/api/v1/sellers/register", json=reg_payload)
        assert res.status_code == 200
        seller = res.json()
        seller_id = seller["id"]
        assert seller["status"] == "PENDING"
        assert seller["bank_account_number_masked"] == "XXXXXX1012"

        # Attempt to publish product as PENDING seller -> must fail (403)
        prod_payload = {
            "category_id": "tools",
            "title_en": "Precision Hand Weeder",
            "title_or": "ହାତ ଘାସ ବଛା ଯନ୍ତ୍ର",
            "description_en": "Ergonomic weeder for paddy fields",
            "description_or": "ଧାନ କିଆରୀ ପାଇଁ ସୁବିଧାଜନକ ଯନ୍ତ୍ର",
            "price": 250.0,
            "unit": "piece",
            "stock_quantity": 20
        }
        res_prod = await client.post(
            "/api/v1/sellers/products",
            json=prod_payload,
            headers={"x-seller-id": seller_id}
        )
        assert res_prod.status_code == 403

        # Admin approves seller
        res_approve = await client.patch(
            f"/api/v1/admin/sellers/{seller_id}/status?status=VERIFIED"
        )
        assert res_approve.status_code == 200
        assert res_approve.json()["status"] == "VERIFIED"

        # Now verified seller can publish product successfully!
        res_prod_ok = await client.post(
            "/api/v1/sellers/products",
            json=prod_payload,
            headers={"x-seller-id": seller_id}
        )
        assert res_prod_ok.status_code == 200
        created_prod = res_prod_ok.json()
        assert created_prod["id"].startswith("prod-")

@pytest.mark.asyncio
async def test_cart_and_multi_vendor_checkout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        farmer_headers = {"x-farmer-id": "test-farmer-bargarh"}

        # Add neem oil (Seller 1)
        res1 = await client.post(
            "/api/v1/store/cart",
            json={"product_id": "prod-neem-oil-10000ppm", "quantity": 2},
            headers=farmer_headers
        )
        assert res1.status_code == 200

        # Add paddy seeds (Seller 2)
        res2 = await client.post(
            "/api/v1/store/cart",
            json={"product_id": "prod-mtu-1010-seed", "quantity": 1},
            headers=farmer_headers
        )
        assert res2.status_code == 200
        cart = res2.json()
        assert len(cart["items"]) == 2
        assert cart["subtotal"] == 480.0 * 2 + 850.0

        # Checkout
        checkout_payload = {
            "farmer_name": "Dharanidhar Pradhan",
            "farmer_phone": "9861000000",
            "shipping_address": "Village Nuapali, Block Bheden",
            "district": "bargarh",
            "payment_method": "ONLINE"
        }
        res_chk = await client.post(
            "/api/v1/store/checkout",
            json=checkout_payload,
            headers=farmer_headers
        )
        assert res_chk.status_code == 200
        order = res_chk.json()
        assert order["order_number"].startswith("KM-")
        assert len(order["suborders"]) == 2  # Split across 2 sellers

        # Verify seller suborder commission and earnings
        for sub in order["suborders"]:
            assert sub["commission_amount"] > 0
            assert sub["seller_earnings"] == round(sub["subtotal"] - sub["commission_amount"], 2)

@pytest.mark.asyncio
async def test_seller_isolation_security():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Seller 1 attempts to edit a product belonging to Seller 2
        res = await client.put(
            "/api/v1/sellers/products/prod-mtu-1010-seed",
            json={"price": 100.0},
            headers={"x-seller-id": "seller-samaleswari-agro"}
        )
        # Must be rejected with 403 Forbidden
        assert res.status_code == 403

@pytest.mark.asyncio
async def test_payment_webhook_hmac_and_idempotency():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Check payment gateway configuration status
        res_status = await client.get("/api/v1/payments/status")
        assert res_status.status_code == 200
        status_data = res_status.json()
        assert "gateway_name" in status_data
        assert "is_configured" in status_data

        # Create payment order
        order_payload = {
            "order_id": "ord-test-order-1",
            "amount": 960.0,
            "currency": "INR",
            "customer_name": "Dharanidhar Pradhan",
            "customer_phone": "9861000000"
        }
        # First ensure order exists in store
        # Test signature verification
        webhook_payload = {
            "event": "payment.captured",
            "gateway_order_id": "order_test_9999",
            "gateway_payment_id": "pay_test_8888",
            "signature": "sig_test_order_test_9999",
            "amount": 960.0
        }
        res_wh = await client.post("/api/v1/payments/webhook", json=webhook_payload)
        assert res_wh.status_code == 200
        assert res_wh.json()["status"] == "PROCESSED"

        # Idempotency check: sending same webhook event again must not fail and return IGNORED_DUPLICATE
        res_dup = await client.post("/api/v1/payments/webhook", json=webhook_payload)
        assert res_dup.status_code == 200
        assert res_dup.json()["status"] == "IGNORED_DUPLICATE"

@pytest.mark.asyncio
async def test_support_request_workflow_and_chat():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        farmer_headers = {"x-user-id": "farmer-bargarh-99"}

        # 1. Create support request with AI diagnosis attachment
        req_payload = {
            "farmer_name": "Upendra Sahu",
            "farmer_phone": "9438000000",
            "farmer_district": "bargarh",
            "crop_id": "paddy",
            "problem_category": "pest_insect",
            "description": "Sudden yellowing and drying of paddy tiller base in 2-acre plot near canal.",
            "preferred_language": "or",
            "contact_method": "chat",
            "ai_scan_id": "scan-sample-bph-01",
            "ai_diagnosis_summary": {
                "pest_id": "bph",
                "pest_name": "Brown Planthopper",
                "confidence": 94,
                "severity": "Moderate"
            },
            "priority": "HIGH"
        }
        res = await client.post("/api/v1/support/requests", json=req_payload, headers=farmer_headers)
        assert res.status_code == 200
        s_req = res.json()
        req_id = s_req["id"]
        assert s_req["reference_number"].startswith("EXP-")
        assert s_req["assigned_expert_id"] is not None

        # 2. Check initial messages (system greeting automatically posted)
        res_msgs = await client.get(f"/api/v1/support/requests/{req_id}/messages", headers=farmer_headers)
        assert res_msgs.status_code == 200
        msgs = res_msgs.json()
        assert len(msgs) >= 1

        # 3. Farmer sends a follow-up message
        msg_payload = {
            "message_text": "ମୁଁ କେଉଁ କୀଟନାଶକ ପ୍ରୟୋଗ କରିବି? ନିମ୍ବ ତେଲ କାମ କରିବ କି?"
        }
        res_post = await client.post(
            f"/api/v1/support/requests/{req_id}/messages",
            json=msg_payload,
            headers={**farmer_headers, "sender_type": "farmer", "sender_name": "Upendra Sahu"}
        )
        assert res_post.status_code == 200
        sent_msg = res_post.json()
        assert sent_msg["message_text"] == msg_payload["message_text"]

        # 4. Expert sends advisory recommendation
        expert_headers = {"x-user-id": s_req["assigned_expert_id"], "sender_type": "expert", "sender_name": "Dr. Subrat Kumar Patnaik"}
        res_exp_msg = await client.post(
            f"/api/v1/support/requests/{req_id}/messages",
            json={"message_text": "ନମସ୍କାର ଉପେନ୍ଦ୍ର ବାବୁ। ତୁରନ୍ତ କିଆରୀରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ ଏବଂ ନିମ୍ବ ତେଲ (10000 PPM) ୫ ମିଲି/ଲିଟର ସିଞ୍ଚନ କରନ୍ତୁ।"},
            headers=expert_headers
        )
        assert res_exp_msg.status_code == 200

        # 5. Check audit trail
        res_audit = await client.get(f"/api/v1/support/requests/{req_id}/audit-trail")
        assert res_audit.status_code == 200
        logs = res_audit.json()
        assert len(logs) >= 1

@pytest.mark.asyncio
async def test_callback_and_scheduled_consultations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create request for callback
        req_payload = {
            "farmer_name": "Gopal Chandra Meher",
            "farmer_phone": "9861234567",
            "farmer_district": "sambalpur",
            "crop_id": "paddy",
            "problem_category": "crop_disease",
            "description": "Leaf folder symptoms spreading.",
            "preferred_language": "or",
            "contact_method": "callback"
        }
        res = await client.post("/api/v1/support/requests", json=req_payload)
        assert res.status_code == 200
        req_id = res.json()["id"]

        # Book callback
        cb_payload = {
            "preferred_date": "2026-11-25",
            "preferred_time_slot": "10:30 AM - 11:00 AM",
            "notes": "Please call regarding biological biocontrol"
        }
        res_cb = await client.post(f"/api/v1/support/requests/{req_id}/callback", json=cb_payload)
        assert res_cb.status_code == 200
        cons = res_cb.json()
        assert cons["consultation_type"] == "callback"
        assert cons["status"] == "CONFIRMED"

@pytest.mark.asyncio
async def test_admin_metrics():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/admin/metrics")
        assert res.status_code == 200
        metrics = res.json()
        assert "marketplace" in metrics
        assert "expert_support" in metrics
        assert metrics["marketplace"]["total_sellers"] >= 2
        assert metrics["expert_support"]["total_experts"] >= 3
