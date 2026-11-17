import httpx
import json

BASE_URL = "https://krushi-mitra-ai-production.up.railway.app/api/v1"

test_queries = [
    ("HII", "en"),
    ("Hello", "en"),
    ("ନମସ୍କାର", "or"),
    ("Thanks", "en"),
    ("Why is this pest attacking my paddy?", "en"),
    ("How can I control it without chemicals?", "en"),
    ("What is the correct chemical dosage?", "en"),
    ("What is the weather today?", "en"),
    ("Explain the pest life cycle.", "en")
]

print(f"Connecting to Railway production API: {BASE_URL}/assistant/chat\n" + "=" * 80)

results = []
for query, lang in test_queries:
    try:
        resp = httpx.post(
            f"{BASE_URL}/assistant/chat",
            json={
                "query": query,
                "pest_context": "armyworm",
                "farmer_district": "bargarh",
                "language": lang
            },
            timeout=25.0
        )
        status = resp.status_code
        data = resp.json() if status == 200 else None
        results.append({
            "query": query,
            "lang": lang,
            "status": status,
            "reply_en": data.get("reply_en") if data else "",
            "reply_or": data.get("reply_or") if data else "",
            "pills_en": data.get("suggested_action_pills_en") if data else []
        })
        print(f"QUERY: '{query}' [lang={lang}] -> HTTP {status}")
        if data:
            print(f"Reply EN: {data.get('reply_en')}")
            print(f"Reply OR: {data.get('reply_or')[:90]}...")
            print(f"Pills EN: {data.get('suggested_action_pills_en')}")
        print("-" * 80)
    except Exception as exc:
        print(f"Error querying '{query}': {exc}")

with open("production_chat_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Saved production_chat_results.json")
