import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

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

        # Armyworm with 2 larvae/hill at tillering (ETL >= 1):
        obs_payload = {
            "crop_stage": "tillering",
            "sampling_unit": "larvae_per_hill",
            "pest_count": 2.0
        }
        resp_post = await client.post("/api/v1/treatments/armyworm/authorize", json=obs_payload)
        assert resp_post.status_code == 200
        data_post = resp_post.json()
        assert len(data_post["chemical_control"]) >= 1
        assert data_post["chemical_authorized"] is True

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
async def test_treatment_endpoint_locks_chemical_molecules_for_non_pests():
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
