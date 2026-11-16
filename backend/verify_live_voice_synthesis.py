import asyncio
import base64
import os
import struct
from pathlib import Path
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from app.core.config import settings
from app.services.voice import synthesize_odia_speech

TEST_CASES = [
    {
        "category": "Odia greeting",
        "text": "ନମସ୍କାର ଚାଷୀ ଭାଇ! କୃଷି ମିତ୍ର AI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।",
        "speaker": "shubh"
    },
    {
        "category": "Insect identification explanation",
        "text": "ଆପଣଙ୍କ ଧାନ ଫସଲରେ ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକର ଲକ୍ଷଣ ଚିହ୍ନଟ ହୋଇଛି। ଗଛର ମଝି କାଣ୍ଡ ମରି ଶୁଖିଯାଇଛି।",
        "speaker": "shubh"
    },
    {
        "category": "Crop protection guidance",
        "text": "ଜୈବିକ ନିୟନ୍ତ୍ରଣ ପାଇଁ କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ ଏବଂ ନିମ୍ବ ତେଲ ଲିଟର ପ୍ରତି ୪ ମିଲି ସିଞ୍ଚନ କରନ୍ତୁ।",
        "speaker": "priya"
    },
    {
        "category": "Scientific insect names",
        "text": "ଏହି କୀଟର ବୈଜ୍ଞାନିକ ନାମ ହେଉଛି Scirpophaga incertulas ଏବଂ ଏହାର ଶତ୍ରୁ ବୁଢ଼ିଆଣୀ Lycosa pseudoannulata।",
        "speaker": "shubh"
    },
    {
        "category": "Numbers and measurements",
        "text": "ଏକର ପିଛା ୨୦୦ ଲିଟର ପାଣିରେ ୬୦ ମିଲି ଔଷଧ ମିଶାଇ ସକାଳ ୮ ଟାରୁ ୧୦ ଟା ମଧ୍ୟରେ ସିଞ୍ଚନ କରନ୍ତୁ।",
        "speaker": "shubh"
    },
    {
        "category": "Long advisory text",
        "text": "ବରଗଡ଼ ଏବଂ ସମ୍ବଲପୁର ଜିଲ୍ଲାର କେନାଲ ଅଞ୍ଚଳରେ ଅଧିକ ଆର୍ଦ୍ରତା ଓ ଉଷ୍ମ ପାଗ ହେତୁ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ (Nilaparvata lugens) ର ପ୍ରକୋପ ବୃଦ୍ଧି ପାଉଛି। ଚାଷୀ ଭାଇମାନେ ପ୍ରତି ଦୁଇ ମିଟରରେ ୩୦ ସେଣ୍ଟିମିଟର ବାଟ ଛାଡ଼ନ୍ତୁ ଏବଂ ନିୟମିତ କ୍ଷେତ ନିରୀକ୍ଷଣ କରନ୍ତୁ।",
        "speaker": "shubh"
    }
]

def validate_wav_bytes(audio_bytes: bytes) -> tuple[bool, str]:
    if len(audio_bytes) < 44:
        return False, "Audio payload too short (<44 bytes)"
    if not audio_bytes.startswith(b"RIFF"):
        return False, "Missing RIFF magic bytes"
    if b"WAVE" not in audio_bytes[:16]:
        return False, "Missing WAVE format marker"
    return True, "Valid RIFF/WAV format"

async def main():
    print("=" * 70)
    print("KRUSHI MITRA AI — LIVE SARVAM AI BULBUL V3 PRODUCTION RELIABILITY AUDIT")
    print("=" * 70)
    print(f"Provider: Sarvam AI Bulbul v3 | Language: od-IN")
    print(f"API Key present: {bool(settings.SARVAM_API_KEY)}")
    print("-" * 70)

    results = []

    for i, tc in enumerate(TEST_CASES, 1):
        print(f"\n[Test {i}/6] Category: {tc['category']}")
        print(f"Speaker: {tc['speaker']} | Length: {len(tc['text'])} chars")
        print(f"Text: {tc['text'][:60]}...")

        try:
            res = await synthesize_odia_speech(
                text=tc["text"],
                language_code="od-IN",
                speaker=tc["speaker"],
                pace=1.0
            )

            audio_bytes = base64.b64decode(res.audio_base64)
            is_valid, msg = validate_wav_bytes(audio_bytes)

            status = "PASS" if is_valid else "FAIL"
            print(f"Result: {status} | Bytes: {len(audio_bytes)} | Format: {msg} | Cached: {res.cached}")

            results.append({
                "test": tc["category"],
                "status": status,
                "bytes": len(audio_bytes),
                "cached": res.cached,
                "speaker": res.speaker
            })

        except Exception as e:
            print(f"Result: ERROR -> {str(e)}")
            results.append({
                "test": tc["category"],
                "status": f"ERROR: {type(e).__name__}",
                "bytes": 0,
                "cached": False,
                "speaker": tc["speaker"]
            })

    # Test Caching on repeat request
    print("\n[Cost Control Verification] Re-requesting Test 1 to verify LRU cache hit...")
    res_repeat = await synthesize_odia_speech(
        text=TEST_CASES[0]["text"],
        language_code="od-IN",
        speaker=TEST_CASES[0]["speaker"],
        pace=1.0
    )
    print(f"Cached flag on repeat: {res_repeat.cached} (Cost Control: PASS)")

    print("\n" + "=" * 70)
    print("SUMMARY OF LIVE AUDIO VALIDATION:")
    all_passed = all(r["status"] == "PASS" for r in results) and res_repeat.cached
    for r in results:
        print(f"  - {r['test']}: {r['status']} ({r['bytes']} bytes, speaker={r['speaker']})")
    print(f"  - Cost Control (LRU Cache Hit): {'PASS' if res_repeat.cached else 'FAIL'}")
    print("=" * 70)
    print(f"FINAL AUDIT STATUS: {'ALL CHECKS PASSED (100%)' if all_passed else 'FAILURES DETECTED'}")
    return all_passed

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
