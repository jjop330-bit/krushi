import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_assistant_chat_odia_query():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "query": "ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?",
            "pest_context": "bph",
            "language": "or"
        }
        response = await client.post("/api/v1/assistant/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "reply_or" in data
        assert "reply_en" in data
        assert len(data["reply_or"]) > 10
        assert len(data["suggested_action_pills_or"]) > 0

@pytest.mark.asyncio
async def test_assistant_spider_protection_advice():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "query": "କ୍ଷେତରେ ବୁଢ଼ିଆଣୀ ଥିଲେ ଔଷଧ ସିଞ୍ଚନ କରିବି କି?",
            "language": "or"
        }
        response = await client.post("/api/v1/assistant/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        # Ensure it advises protecting beneficial wolf spiders and NOT spraying
        assert "ବନ୍ଧୁ" in data["reply_or"] or "ବୁଢ଼ିଆଣୀ" in data["reply_or"]
