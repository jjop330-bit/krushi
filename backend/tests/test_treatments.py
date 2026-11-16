import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_direct_treatment_without_field_observation_locks_chemicals():
    """
    Direct API security check:
    Calling GET /api/v1/treatments/{pest_id} for ANY supported pest without an
    empirical field observation MUST return zero chemical recommendations.
    AI identification or pest ID alone never authorizes chemical advice.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        supported = ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm"]
        for p in supported:
            response = await client.get(f"/api/v1/treatments/{p}")
            assert response.status_code == 200
            data = response.json()
            assert data["pest_id"] == p
            assert len(data["biological_control"]) >= 1
            assert len(data["cultural_control"]) >= 1
            assert len(data["chemical_control"]) == 0, f"Pest {p} without observation MUST return 0 chemical recommendations"
            assert data["chemical_authorized"] is False
            assert data["authorization_status"] == "LOCKED_PENDING_SCOUTING_OBSERVATION"

@pytest.mark.asyncio
async def test_below_etl_field_observation_locks_chemicals():
    """
    Direct API security check:
    Observations strictly below the Economic Threshold Level (ETL) MUST fail closed
    and return zero chemical recommendations.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # BPH vegetative stage ETL is 5 hoppers/hill. Test with 3 hoppers/hill:
        resp = await client.get("/api/v1/treatments/bph?crop_stage=vegetative&sampling_unit=per_hill&pest_count=3.0")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["chemical_control"]) == 0
        assert data["chemical_authorized"] is False
        assert data["authorization_status"] == "BELOW_ETL_NO_CHEMICAL_JUSTIFIED"
        assert "BELOW" in data["responsible_stewardship_warning_en"]

        # Stem Borer vegetative stage ETL is 5% dead hearts. Test with 2% dead hearts:
        resp_ysb = await client.get("/api/v1/treatments/stem_borer?crop_stage=tillering&sampling_unit=percent_dead_hearts&pest_count=2.0")
        assert resp_ysb.status_code == 200
        data_ysb = resp_ysb.json()
        assert len(data_ysb["chemical_control"]) == 0
        assert data_ysb["chemical_authorized"] is False
        assert data_ysb["authorization_status"] == "BELOW_ETL_NO_CHEMICAL_JUSTIFIED"

@pytest.mark.asyncio
async def test_above_etl_field_observation_authorizes_registered_guidance():
    """
    Direct API security check:
    Only when an empirical scouting observation meets or breaches the verified ETL
    does the backend authorize and return applicable CIBRC chemical guidance.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # BPH vegetative stage with 8 hoppers/hill (ETL >= 5):
        resp = await client.get("/api/v1/treatments/bph?crop_stage=vegetative&sampling_unit=per_hill&pest_count=8.0")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["chemical_control"]) >= 1
        assert data["chemical_authorized"] is True
        assert data["authorization_status"] == "ETL_BREACHED_CHEMICAL_AUTHORIZED"

        chem = data["chemical_control"][0]
        assert chem["cibrc_registered"] is True
        assert chem["phi_days"] > 0
        assert "Litres" in chem["water_volume_per_acre"]

        # Stem Borer with 8% dead hearts at tillering (ETL >= 5%):
        obs_payload = {
            "crop_stage": "tillering",
            "sampling_unit": "percent_dead_hearts",
            "pest_count": 8.0
        }
        resp_post = await client.post("/api/v1/treatments/stem_borer/authorize", json=obs_payload)
        assert resp_post.status_code == 200
        data_post = resp_post.json()
        assert len(data_post["chemical_control"]) >= 1
        assert data_post["chemical_authorized"] is True
        # Verify Coragen PHI is correctly set to 47 days
        coragen = next(c for c in data_post["chemical_control"] if "Chlorantraniliprole" in c["active_ingredient"])
        assert coragen["phi_days"] == 47

        # Armyworm with 2 clipped panicles/sq m at heading (verified ETL >= 1):
        obs_army = {
            "crop_stage": "heading",
            "sampling_unit": "clipped_panicles_per_sq_m",
            "pest_count": 2.0
        }
        resp_army = await client.post("/api/v1/treatments/armyworm/authorize", json=obs_army)
        assert resp_army.status_code == 200
        data_army = resp_army.json()
        assert len(data_army["chemical_control"]) >= 1
        assert data_army["chemical_authorized"] is True
        assert "Chlorpyriphos" in data_army["chemical_control"][0]["active_ingredient"]
        assert data_army["chemical_control"][0]["phi_days"] == 30

@pytest.mark.asyncio
async def test_invalid_inconsistent_fields_fail_closed():
    """
    Direct API security check:
    Missing, invalid, negative, or inconsistent observation fields MUST fail closed.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Invalid sampling unit (e.g. litres for BPH count)
        resp1 = await client.get("/api/v1/treatments/bph?crop_stage=vegetative&sampling_unit=litres&pest_count=100.0")
        assert resp1.status_code == 200
        d1 = resp1.json()
        assert len(d1["chemical_control"]) == 0
        assert d1["authorization_status"] == "INVALID_OBSERVATION_DATA"

        # Invalid crop stage
        resp2 = await client.get("/api/v1/treatments/bph?crop_stage=fruiting&sampling_unit=per_hill&pest_count=100.0")
        assert resp2.status_code == 200
        d2 = resp2.json()
        assert len(d2["chemical_control"]) == 0
        assert d2["authorization_status"] == "INVALID_OBSERVATION_DATA"

        # Negative count
        resp3 = await client.get("/api/v1/treatments/bph?crop_stage=vegetative&sampling_unit=per_hill&pest_count=-5.0")
        assert resp3.status_code == 200
        d3 = resp3.json()
        assert len(d3["chemical_control"]) == 0
        assert d3["authorization_status"] == "INVALID_OBSERVATION_DATA"

@pytest.mark.asyncio
async def test_unverified_etl_rules_fail_closed():
    """
    Direct API security check:
    Unverified or ambiguous ETL rules (such as larvae_per_hill for Mythimna separata)
    MUST fail closed with status UNVERIFIED_ETL_RULE_LOCKED.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Armyworm vegetative stage with larvae_per_hill (unverified):
        resp = await client.get("/api/v1/treatments/armyworm?crop_stage=tillering&sampling_unit=larvae_per_hill&pest_count=5.0")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["chemical_control"]) == 0
        assert data["chemical_authorized"] is False
        assert data["authorization_status"] == "UNVERIFIED_ETL_RULE_LOCKED"
        assert "unverified" in data["responsible_stewardship_warning_en"].lower()

@pytest.mark.asyncio
async def test_alternate_routes_never_bypass_chemical_gate():
    """
    Direct API security check:
    Verify that GET /api/v1/pest/species and GET /api/v1/pest/species/{pest_id}
    NEVER return unlocked chemical recommendations without scouting observations.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check GET /api/v1/pest/species list endpoint
        resp_list = await client.get("/api/v1/pest/species")
        assert resp_list.status_code == 200
        species_list = resp_list.json()
        assert len(species_list) >= 5
        for s in species_list:
            assert len(s.get("chemical_control", [])) == 0, f"Endpoint /pest/species leaked chemicals for {s.get('id')}"
            assert s.get("chemical_authorized", False) is False

        # Check GET /api/v1/pest/species/{pest_id} detail endpoint
        for pid in ["bph", "stem_borer", "leaf_folder", "rice_hispa", "armyworm"]:
            resp_detail = await client.get(f"/api/v1/pest/species/{pid}")
            assert resp_detail.status_code == 200
            data_detail = resp_detail.json()
            assert len(data_detail.get("chemical_control", [])) == 0, f"Detail endpoint leaked chemicals for {pid}"
            assert data_detail.get("chemical_authorized", False) is False

@pytest.mark.asyncio
async def test_treatment_endpoint_locks_chemical_molecules_for_non_pests():
    """
    Direct API security check:
    Non-target organisms, beneficial predators, and healthy crops must NEVER authorize chemicals.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        non_pests = ["beneficial_spider", "healthy_paddy", "uncertain", "other_insect", "unknown_pest"]
        for np in non_pests:
            # Even if a malicious request passes a high count, non-pests must NEVER return chemicals
            response = await client.get(f"/api/v1/treatments/{np}?crop_stage=vegetative&sampling_unit=per_hill&pest_count=999.0")
            assert response.status_code == 200
            data = response.json()
            assert len(data["chemical_control"]) == 0, f"Non-target {np} must return 0 chemical molecules"
            assert data["chemical_authorized"] is False
            assert data["authorization_status"] == "UNSUPPORTED_OR_NON_TARGET"

@pytest.mark.asyncio
async def test_production_vision_model_matches_benchmark():
    """
    Verification check:
    The active vision model configured in settings MUST match the model used for the benchmark evaluation.
    """
    assert settings.GEMINI_MODEL == "gemini-3.5-flash-lite", f"Configured model '{settings.GEMINI_MODEL}' must match benchmark"
    assert settings.PROJECT_NAME == "Krushi Mitra AI Backend"
