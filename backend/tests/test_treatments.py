import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_treatment_recommendations_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/treatments/bph")
        assert response.status_code == 200
        data = response.json()
        assert data["pest_id"] == "bph"
        assert len(data["biological_control"]) >= 2
        assert len(data["cultural_control"]) >= 1
        assert len(data["chemical_control"]) >= 1
        
        # Verify CIBRC chemical parameters
        chem = data["chemical_control"][0]
        assert chem["cibrc_registered"] is True
        assert chem["phi_days"] > 0
        assert "Litres" in chem["water_volume_per_acre"]

@pytest.mark.asyncio
async def test_treatment_endpoint_locks_chemical_molecules_for_non_pests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Non-pests, beneficial predators, and uncertain queries must NEVER return chemical molecules
        non_pests = ["beneficial_spider", "healthy_paddy", "uncertain", "other_insect", "unknown_pest"]
        for np in non_pests:
            response = await client.get(f"/api/v1/treatments/{np}")
            assert response.status_code == 200
            data = response.json()
            assert len(data["chemical_control"]) == 0, f"Non-target {np} must return 0 chemical molecules"
            assert "Do NOT apply any chemical insecticide" in data["etl_condition_en"] or "No intervention" in data["etl_condition_en"] or "spiders" in data["etl_condition_en"]
