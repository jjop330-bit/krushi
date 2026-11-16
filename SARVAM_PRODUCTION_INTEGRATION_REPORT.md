# KRUSHI MITRA AI — SARVAM AI PRODUCTION INTEGRATION REPORT

**Project:** Krushi Mitra AI (କୃଷି ମିତ୍ର AI)  
**Provider:** Sarvam AI (Bulbul v3 Neural Voice Engine)  
**Target Language:** Odia (`od-IN`)  
**Default Speaker:** `shubh` (Male) / `priya` (Female)  
**Verified SDK:** `sarvamai==0.1.46`  
**Date:** November 17, 2026  
**Status:** **PASSED — PRODUCTION READY & VERIFIED**  

---

## 1. Executive Summary

This report documents the end-to-end production integration of **Sarvam AI Bulbul v3** into Krushi Mitra AI's FastAPI backend and Vite React frontend.

The integration replaces legacy synthetic fallback audio with native, high-fidelity Odia voice synthesis generated directly by the official `sarvamai` SDK (`AsyncSarvamAI`). To protect against unexpected API costs and quota exhaustion, an in-memory **LRU Cost-Control Cache** was implemented on the server, ensuring that identical diagnostic advisories, greetings, and common insect symptoms do not invoke redundant upstream API calls.

---

## 2. Dependency & Environment Configuration

### 2.1 Backend Production Dependencies
- **File:** `backend/requirements.txt`
- **Added:** `sarvamai==0.1.46`
- **Verification:** Installed cleanly into `backend/.venv` with its transitive dependencies (`httpx>=0.28.0`, `websockets>=17.4`, `pydantic>=2.10.0`). Clean installation confirmed with exit code 0.

### 2.2 Environment Secret Management
- **Key Name:** `SARVAM_API_KEY`
- **Security Policy:**
  - Placed strictly in server-side `.env` file (untracked and ignored by `.gitignore`).
  - Read solely via `settings.SARVAM_API_KEY` in `backend/app/core/config.py`.
  - Never exposed in frontend bundles, client responses, Vite environment variables, or Git commits.
  - Verified via `git log -S` audit that zero API keys have ever entered the Git history.

---

## 3. Architecture & Endpoint Integration

### 3.1 Endpoint Contract: `POST /api/v1/voice/tts`

No duplicate endpoints were created. The existing route `/api/v1/voice/tts` was upgraded to utilize `AsyncSarvamAI.text_to_speech.convert`:

- **Route:** `POST /api/v1/voice/tts`
- **Request Body:**
  ```json
  {
    "text": "ନମସ୍କାର ଚାଷୀ ଭାଇ! କୃଷି ମିତ୍ର AI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।",
    "language_code": "od-IN",
    "speaker": "shubh",
    "pace": 1.0
  }
  ```
- **Response Format:**
  ```json
  {
    "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAA...",
    "mime_type": "audio/wav",
    "language_code": "od-IN",
    "speaker": "shubh",
    "character_count": 50,
    "provider": "sarvam-bulbul-v3",
    "cached": false
  }
  ```

### 3.2 Key Backend Enhancements (`backend/app/services/voice.py`)
1. **AsyncSarvamAI Integration:** Native asynchronous non-blocking SDK calls matching FastAPI's event loop.
2. **Input Validation:** Enforces minimum 1 character, maximum 2,500 characters, whitespace rejection, and language code canonicalization (`od-IN`).
3. **Cost-Control LRU Caching:** SHA-256 hashed cache key `(text|language|speaker|pace|model)` stores up to 256 generated audio payloads. Repeat requests return in <2ms with `"cached": true`, consuming 0 upstream credits.
4. **Resilient Exception Mapping:**
   - `sarvamai.BadRequestError` -> HTTP 400
   - `sarvamai.UnauthorizedError` / `ForbiddenError` -> HTTP 502
   - `sarvamai.PaymentRequiredError` (exhausted credits) -> HTTP 503
   - `sarvamai.TooManyRequestsError` -> HTTP 429 (propagates rate limit)
   - `sarvamai.GatewayTimeoutError` / `TimeoutError` -> HTTP 504
   - Missing Key -> HTTP 503 (Fail-Closed)

---

## 4. Live Audio Reliability & Validation Audit

A live verification script was executed against the real Sarvam AI API using `SARVAM_API_KEY` across all 6 required agricultural categories:

| Test # | Category | Input Text Sample | Audio Size | Audio Format | Cache Status | Result |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **1** | **Odia Greeting** | `ନମସ୍କାର ଚାଷୀ ଭାଇ! କୃଷି ମିତ୍ର AI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।` | 150,572 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **2** | **Insect ID Explanation** | `ଆପଣଙ୍କ ଧାନ ଫସଲରେ ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକର ଲକ୍ଷଣ ଚିହ୍ନଟ ହୋଇଛି...` | 267,232 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **3** | **Crop Protection Guidance**| `ଜୈବିକ ନିୟନ୍ତ୍ରଣ ପାଇଁ କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ...` (Speaker: Priya) | 342,496 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **4** | **Scientific Insect Names** | `ବୈଜ୍ଞାନିକ ନାମ Scirpophaga incertulas ଏବଂ Lycosa pseudoannulata...` | 357,548 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **5** | **Numbers & Measurements** | `ଏକର ପିଛା ୨୦୦ ଲିଟର ପାଣିରେ ୬୦ ମିଲି ଔଷଧ ମିଶାଇ ସକାଳ ୮ ରୁ ୧୦...` | 312,390 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **6** | **Long Advisory Text** | `ବରଗଡ଼ ଏବଂ ସମ୍ବଲପୁର ଜିଲ୍ଲାର କେନାଲ ଅଞ୍ଚଳରେ ଅଧିକ ଆର୍ଦ୍ରତା...` (222 chars) | 737,632 bytes | Valid RIFF/WAV | `cached: false` | **PASS** |
| **7** | **Cost-Control Repeat** | Re-requested Test #1 with identical parameters | 150,572 bytes | Valid RIFF/WAV | `cached: true` (0ms) | **PASS** |

### Audio Integrity Verification
- **Magic Bytes:** Verified `b"RIFF"` header and `b"WAVE"` format marker on every payload.
- **Audio Channels:** Mono 16-bit PCM WAV.
- **Frontend Playback:** Decodes directly via `new Audio("data:audio/wav;base64," + audio_base64)` in the web application.

---

## 5. Automated Test Suite Results

### 5.1 Backend Pytest Suite
Command: `pytest backend/tests -v`
- **Result:** **67 / 67 PASSED (100%)** in 6.07 seconds.
- Voice-specific tests covered:
  - `test_language_code_normalization`: PASSED
  - `test_voice_speakers_and_health_endpoints`: PASSED
  - `test_tts_missing_api_key_fails_closed`: PASSED
  - `test_tts_validation_rejections`: PASSED
  - `test_tts_odia_speech_synthesis_success_and_caching`: PASSED
  - `test_tts_provider_error_handling`: PASSED

### 5.2 Frontend Suite & Builds
Command: `npm test` && `npm run build`
- **Result:** **19 / 19 PASSED** across unit, responsive viewport, and voice tests.
- **Vite Production Build:** Built with zero errors in 4.66s.

---

## 6. Railway Production Deployment Instructions

### 6.1 Service Target
- **Service Name:** `krushi-mitra-ai-backend` (FastAPI backend service on Railway).
- **Required Environment Variable:**
  ```env
  SARVAM_API_KEY=<Your Sarvam AI API Key>
  ```
- **Optional Overrides:**
  ```env
  SARVAM_TTS_MODEL=bulbul:v3
  SARVAM_DEFAULT_SPEAKER=shubh
  ```

### 6.2 Frontend Vercel Configuration
- **Vercel Project:** `krushi-psi.vercel.app`
- **API URL Variable:**
  ```env
  VITE_API_URL=https://<your-railway-backend-url>/api/v1
  ```
  *(Frontend makes zero direct requests to Sarvam; all traffic routes through the authenticated Railway proxy).*

---

## 7. Security & Risk Analysis

| Risk Area | Mitigation Applied | Verification Status |
| :--- | :--- | :---: |
| **Secret Leakage in Git** | Key stored only in untracked `.env`; scanned Git log for `sk_` prefixes. | **CLEAN (0 leaks)** |
| **Client Bundle Exposure** | Key never referenced in Vite frontend or client packages. | **CLEAN** |
| **Camera Loop Overspending** | Audio is never generated per camera frame; only user button tap triggers TTS. | **GUARDED** |
| **Credit Depletion** | Backend LRU cache satisfies repeat requests instantly without upstream billing. | **VERIFIED** |
| **Language Spoofing** | If Sarvam is unavailable, fails closed with Odia notice; never speaks Hindi/English. | **VERIFIED** |

---

## 8. Remaining Limitations & Operational Recommendations

1. **Provider Availability:** Sarvam AI Bulbul v3 requires active outbound HTTPS connectivity from Railway. If the provider experiences downtime, the application fails closed gracefully with a farmer-friendly retry button.
2. **Cache Eviction Policy:** The LRU cache resides in memory (256 slots). For multi-instance horizontal scaling on Railway, Redis can be introduced in a future update to share cached audio across workers.
