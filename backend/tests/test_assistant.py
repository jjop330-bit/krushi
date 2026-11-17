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
        assert "ବନ୍ଧୁ" in data["reply_or"] or "ବୁଢ଼ିଆଣୀ" in data["reply_or"]

@pytest.mark.asyncio
async def test_assistant_greeting_intent_handling():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for greeting in ["HII", "hi", "hello", "namaste", "ନମସ୍କାର"]:
            payload = {
                "query": greeting,
                "pest_context": "armyworm",
                "language": "en"
            }
            response = await client.post("/api/v1/assistant/chat", json=payload)
            assert response.status_code == 200
            data = response.json()
            # Must reply with a friendly greeting referencing the pest
            assert "Namaste" in data["reply_en"]
            assert "Rice Armyworm" in data["reply_en"]
            # Must NOT dump treatment steps
            assert "trenches" not in data["reply_en"].lower()
            assert "first recommended course of action" not in data["reply_en"].lower()
            # Must offer the 3 suggestion chips
            assert len(data["suggested_action_pills_en"]) == 3
            assert len(data["suggested_action_pills_or"]) == 3

@pytest.mark.asyncio
async def test_assistant_gratitude_intent_handling():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for thanks in ["thanks", "thank you", "ଧନ୍ୟବାଦ"]:
            payload = {
                "query": thanks,
                "pest_context": "armyworm",
                "language": "en"
            }
            response = await client.post("/api/v1/assistant/chat", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert "welcome" in data["reply_en"].lower() or "ସ୍ୱାଗତମ୍" in data["reply_or"]
            assert "first recommended course of action" not in data["reply_en"].lower()

@pytest.mark.asyncio
async def test_assistant_suggestion_chips():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        chips = [
            ("Why did this pest attack my paddy?", ["driver", "outbreak", "factor", "nitrogen", "urea"]),
            ("How can I control it without chemicals?", ["Without synthetic chemicals", "Neem"]),
            ("What is the correct chemical dosage?", ["CIBRC", "prescription", "Apply", "dosage", "dose"])
        ]
        for query, expected_words in chips:
            payload = {
                "query": query,
                "pest_context": "armyworm",
                "language": "en"
            }
            response = await client.post("/api/v1/assistant/chat", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert any(w.lower() in data["reply_en"].lower() for w in expected_words), f"Failed for {query}: {data['reply_en']}"

@pytest.mark.asyncio
async def test_assistant_free_form_question():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "query": "what is the weather",
            "pest_context": "armyworm",
            "language": "en"
        }
        response = await client.post("/api/v1/assistant/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["reply_en"]) > 10
        # Must not be the old static treatment dump
        assert "first recommended course of action" not in data["reply_en"].lower()

