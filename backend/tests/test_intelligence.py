import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_districts_intelligence_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/intelligence/districts")
        assert response.status_code == 200
        districts = response.json()
        assert len(districts) >= 4  # Bargarh, Sambalpur, Cuttack, Balasore
        
        # Verify first district structure
        d0 = districts[0]
        assert "district_id" in d0
        assert "district_name" in d0
        assert "district_name_or" in d0
        assert "ai_suspected_cases" in d0
        assert "expert_confirmed_cases" in d0
        assert "bph_risk_level" in d0
        assert "kvk_name" in d0

@pytest.mark.asyncio
async def test_single_district_bargarh():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/intelligence/districts/bargarh")
        assert response.status_code == 200
        data = response.json()
        assert data["district_id"] == "bargarh"
        assert data["district_name"] == "Bargarh"
        assert "ବରଗଡ଼" in data["district_name_or"]
        assert data["active_outbreak_alert"] is True
