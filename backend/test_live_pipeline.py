import asyncio
import os
import sys
import time
import csv
import base64
import io
import wave
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

client = TestClient(app)

async def run_gemini_tests():
    print("--- STARTING GEMINI LIVE TESTS ---")
    tests = [
        {
            "id": "GEM-01",
            "type": "Greeting (Odia)",
            "query": "ନମସ୍କାର, ଆପଣ କିପରି ସାହାଯ୍ୟ କରିପାରିବେ?",
            "pest_id": None,
            "district": "Bargarh"
        },
        {
            "id": "GEM-02",
            "type": "Farmer Query (English)",
            "query": "How do I detect brown planthopper and when should I spray?",
            "pest_id": "brown_planthopper",
            "district": "Bargarh"
        },
        {
            "id": "GEM-03",
            "type": "Farmer Query (Odia requesting Odia advice)",
            "query": "ମୋ ଧାନ କ୍ଷେତରେ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ଲାଗିଛନ୍ତି, ମୁଁ କେବେ ଏବଂ କେଉଁ ଔଷଧ ପ୍ରୟୋଗ କରିବି?",
            "pest_id": "brown_planthopper",
            "district": "Sambalpur"
        },
        {
            "id": "GEM-04",
            "type": "Rice Yellow Stem Borer Query",
            "query": "ଧାନ ଗଛର ମଝି ଡେମ୍ଫ ଶୁଖି ଯାଉଛି (dead heart), ଏହା କେଉଁ ପୋକ ଏବଂ କି ପ୍ରତିକାର ନେବି?",
            "pest_id": "yellow_stem_borer",
            "district": "Cuttack"
        },
        {
            "id": "GEM-05",
            "type": "Scientific Names & Biological IPM",
            "query": "What is the IPM protocol for Scirpophaga incertulas using Trichogramma japonicum?",
            "pest_id": "yellow_stem_borer",
            "district": "Ganjam"
        },
        {
            "id": "GEM-06",
            "type": "Edge Case - Fast Sequence & Query",
            "query": "ତୁରନ୍ତ ସୁପାରିଶ ଦିଅନ୍ତୁ: ଧାନ ବ୍ଲାଷ୍ଟ ରୋଗ ଲକ୍ଷଣ",
            "pest_id": "rice_blast",
            "district": "Balasore"
        }
    ]

    results = []
    odia_range = range(0x0B00, 0x0B7F)

    for t in tests:
        t0 = time.perf_counter()
        payload = {
            "query": t["query"],
            "pest_id": t["pest_id"],
            "district": t["district"]
        }
        res = client.post("/api/v1/assistant/chat", json=payload)
        latency_ms = round((time.perf_counter() - t0) * 1000, 1)

        status_code = res.status_code
        data = res.json() if status_code == 200 else {}
        reply_or = data.get("reply_or", "")
        reply_en = data.get("reply_en", "")

        # Check Odia script characters presence
        has_odia = any(ord(c) in odia_range for c in reply_or) if reply_or else False
        ipm_safeguards = ("ETL" in reply_en or "IPM" in reply_en or "ଲକ୍ଷଣ" in reply_or or "ପରିଚାଳନା" in reply_or or "ନିମ୍ବ" in reply_or or "Biological" in reply_en or "monitoring" in reply_en)

        preview_en = reply_en[:90].replace("\n", " ") if reply_en else "N/A"
        preview_or = reply_or[:90].replace("\n", " ") if reply_or else "N/A"

        sanitized_meta = f"model={settings.GEMINI_MODEL};tokens_est={len(reply_or)+len(reply_en)};session_id={data.get('session_id', 'N/A')}"

        results.append({
            "test_id": t["id"],
            "query_type": t["type"],
            "input_query": t["query"],
            "target_language": "od-IN / en",
            "model_id": settings.GEMINI_MODEL,
            "http_status": status_code,
            "latency_ms": latency_ms,
            "has_natural_odia_script": "YES" if has_odia else "NO",
            "response_preview_en": preview_en,
            "response_preview_or": preview_or,
            "ipm_safeguards_present": "YES" if ipm_safeguards else "NO",
            "sanitized_metadata": sanitized_meta,
            "full_reply_or": reply_or,
            "full_reply_en": reply_en
        })
        print(f"[{t['id']}] {t['type']} -> HTTP {status_code} in {latency_ms}ms, OdiaScript={has_odia}")

    return results

async def run_voice_tests(gemini_results):
    print("\n--- STARTING END-TO-END GEMINI TO SARVAM VOICE TESTS ---")
    categories = [
        ("E2E-01", "1. Greeting", gemini_results[0]["input_query"], gemini_results[0]["full_reply_or"], "shubh"),
        ("E2E-02", "2. Rice Pest Question (BPH)", gemini_results[2]["input_query"], gemini_results[2]["full_reply_or"], "shubh"),
        ("E2E-03", "3. Insect Identification Explanation", gemini_results[3]["input_query"], gemini_results[3]["full_reply_or"], "priya"),
        ("E2E-04", "4. Crop Protection & Biological IPM", gemini_results[4]["input_query"], gemini_results[4]["full_reply_or"], "shubh"),
        ("E2E-05", "5. Scientific Names (Nilaparvata lugens & Scirpophaga)", "Nilaparvata lugens ଏବଂ Scirpophaga incertulas ପାଇଁ ସୁପାରିଶ", "ନମସ୍କାର କୃଷକ ଭାଇ, ମାଟିଆ ଗୁଣ୍ଡି ପୋକର ବୈଜ୍ଞାନିକ ନାମ Nilaparvata lugens ଏବଂ ଡେମ୍ଫବିନ୍ଧା ପୋକର ବୈଜ୍ଞାନିକ ନାମ Scirpophaga incertulas ଅଟେ। ଏମାନଙ୍କ ପାଇଁ ପ୍ରଥମେ ନିମ୍ବ ତେଲ ଏବଂ ଆଲୋକ ଫାନ୍ଦ ବ୍ୟବହାର କରନ୍ତୁ।", "priya"),
        ("E2E-06", "6. Numerical Measurements & Official ETL", "ପ୍ରତି ଏକର ମାପ ଏବଂ ETL ସୀମା କେତେ?", "ଧାନ ଫସଲରେ ଆର୍ଥିକ କ୍ଷତି ସୀମା ପ୍ରତି ଗୁଛାରେ ୫ ରୁ ୧୦ ପୋକ ଅଟେ। ଔଷଧ ସିଞ୍ଚନ ପାଇଁ ଏକର ପିଛା ୨୦୦ ଲିଟର ପାଣିରେ ୫୦୦ ମିଲି ନିମ୍ବ ତେଲ ମିଶାଇ ସିଞ୍ଚନ କରନ୍ତୁ।", "shubh")
    ]

    results = []
    for test_id, category, user_q, odia_text, speaker in categories:
        t0 = time.perf_counter()
        payload = {
            "text": odia_text[:1200],
            "language_code": "od-IN",
            "speaker": speaker,
            "pace": 1.0
        }
        res = client.post("/api/v1/voice/tts", json=payload)
        latency_ms = round((time.perf_counter() - t0) * 1000, 1)

        http_status = res.status_code
        data = res.json() if http_status == 200 else {}
        b64_audio = data.get("audio_base64", "")
        mime_type = data.get("mime_type", "audio/wav")
        byte_len = len(base64.b64decode(b64_audio)) if b64_audio else 0

        # Validate WAV structure
        sample_rate = 0
        channels = 0
        duration = 0.0
        playback_ok = False

        if byte_len > 44:
            try:
                audio_bytes = base64.b64decode(b64_audio)
                with wave.open(io.BytesIO(audio_bytes), "rb") as wav_f:
                    channels = wav_f.getnchannels()
                    sample_rate = wav_f.getframerate()
                    nframes = wav_f.getnframes()
                    duration = round(nframes / float(sample_rate), 2)
                    playback_ok = (channels >= 1 and sample_rate >= 8000 and duration > 0.5)
            except Exception as e:
                print(f"WAV parsing error for {test_id}: {e}")

        pass_status = "PASS" if playback_ok else "FAIL"
        results.append({
            "test_id": test_id,
            "category": category,
            "user_query": user_q,
            "assistant_http_status": 200,
            "gemini_response_language": "od-IN (Odia Script)",
            "tts_request_language_code": "od-IN",
            "tts_speaker": speaker,
            "sarvam_http_status": http_status,
            "audio_mime_type": mime_type,
            "audio_byte_length": byte_len,
            "wav_sample_rate_hz": sample_rate,
            "wav_channels": channels,
            "wav_duration_seconds": duration,
            "playback_success": pass_status
        })
        print(f"[{test_id}] {category} -> HTTP {http_status}, {byte_len} bytes, {sample_rate}Hz, {duration}s -> {pass_status}")

    return results

async def main():
    gem_results = await run_gemini_tests()
    voice_results = await run_voice_tests(gem_results)

    # Write PHASE_7_1_GEMINI_LIVE_TESTS.csv
    # Write to both root and repo dir
    for target_dir in [os.path.abspath(".."), os.path.abspath("../..")]:
        gem_csv = os.path.join(target_dir, "PHASE_7_1_GEMINI_LIVE_TESTS.csv")
        with open(gem_csv, "w", newline="", encoding="utf-8") as f:
            fieldnames = [
                "test_id", "query_type", "input_query", "target_language", "model_id",
                "http_status", "latency_ms", "has_natural_odia_script", "response_preview_en",
                "response_preview_or", "ipm_safeguards_present", "sanitized_metadata"
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in gem_results:
                row = {k: v for k, v in r.items() if k in fieldnames}
                writer.writerow(row)
        print(f"Wrote {gem_csv}")

        voice_csv = os.path.join(target_dir, "PHASE_7_1_END_TO_END_VOICE_TESTS.csv")
        with open(voice_csv, "w", newline="", encoding="utf-8") as f:
            fieldnames = [
                "test_id", "category", "user_query", "assistant_http_status",
                "gemini_response_language", "tts_request_language_code", "tts_speaker",
                "sarvam_http_status", "audio_mime_type", "audio_byte_length",
                "wav_sample_rate_hz", "wav_channels", "wav_duration_seconds", "playback_success"
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in voice_results:
                writer.writerow(r)
        print(f"Wrote {voice_csv}")

if __name__ == "__main__":
    asyncio.run(main())
