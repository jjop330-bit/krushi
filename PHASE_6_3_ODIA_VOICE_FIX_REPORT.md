# KRUSHI MITRA AI — PHASE 6.3: FIX REAL ODIA VOICE OUTPUT REPORT

**Live Deployment:** https://krushi-psi.vercel.app/  
**Repository:** [jjop330-bit/krushi](https://github.com/jjop330-bit/krushi)  
**Branch:** `main`  
**Priority:** P0 — Odia Voice Output (Resolved)  
**Engine:** Sarvam AI Bulbul v3 (`od-IN`)  
**Audit Date:** November 17, 2026  
**Final Status:** PASSED — READY FOR PRODUCTION DEPLOYMENT  

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 Root Cause of Legacy Failure
In the original implementation, the frontend voice system relied exclusively on the browser's Web Speech API (`window.speechSynthesis`). An inspection of speech synthesis implementations across Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, and Android WebView revealed that **none of these major browsers bundle a genuine native Odia voice engine** (`or-IN` or `ory-IN`).

When a farmer selected Odia:
1. `voiceService.ts` called `window.speechSynthesis.getVoices()`.
2. Finding no voice with `lang.startsWith('or')`, the legacy fallback code executed:
   ```typescript
   voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang === 'en-IN')
   ```
3. Passing complex Odia unicode text (e.g., `ନମସ୍କାର! ମୁଁ କୃଷି ମିତ୍ର AI...`) to a Hindi or English TTS phoneme synthesizer caused one of three fatal failures:
   - Complete silence (browser dropped unsupported unicode glyphs).
   - Abrupt audio playback failure exception (`synthesis error`).
   - Highly distorted, incomprehensible phonetic gibberish spoken by an English voice attempting to pronounce Odia consonants.

Furthermore, there was no server-side TTS proxy, no API key isolation, and no audio state machine to handle loading, buffering, pause, resume, or replay.

### 1.2 Permanent Solution (Phase 6.3)
1. **Server-Side Neural TTS Pipeline:** Integrated **Sarvam AI Bulbul v3** (`bulbul:v3`) via a high-performance FastAPI proxy (`POST /api/v1/voice/tts`).
2. **Strict Language Code Normalization:** Enforced strict mapping to `od-IN` for genuine Odia pronunciation.
3. **Fail-Closed Security & Privacy:** `SARVAM_API_KEY` is hosted **exclusively on the backend** (never exposed in frontend code, client responses, or Git). Missing or invalid keys return HTTP 503 without ever falling back to Hindi or English speech.
4. **Interactive HTML5 Audio Engine:** Replaced fragile synthetic utterances with an asynchronous base64 PCM WAV decoding engine supporting `idle`, `loading`, `playing`, `paused`, and `error` states, with full Play, Pause, Resume, Replay, and Stop controls.
5. **Agricultural Precision Preservation:** Latin binomial scientific names (*Scirpophaga incertulas*, *Nilaparvata lugens*) and chemical measurements (1500 ppm, 60 ml/acre) are strictly preserved inside Odia sentences without transliteration corruption.

---

## 2. Architecture & Request-Response Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Odisha)
    participant UI as VoiceAssistant / PestReport
    participant VS as Frontend voiceService.ts
    participant API as FastAPI /api/v1/voice/tts
    participant Sarvam as Sarvam AI Bulbul v3 API

    Farmer->>UI: Clicks "ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ" (Listen in Odia)
    UI->>VS: speak(odiaText, 'or', options)
    VS->>UI: onStateChange('loading') [Spinner Active]
    VS->>API: POST /api/v1/voice/tts {text, language_code: "od-IN", speaker: "shubh"}
    API->>API: Validate length (1-2500) & language code
    API->>Sarvam: POST https://api.sarvam.ai/text-to-speech (api-subscription-key)
    Sarvam-->>API: 200 OK { audios: ["<base64_wav>"] }
    API-->>VS: 200 OK { audio_base64: "...", mime_type: "audio/wav", speaker: "shubh" }
    VS->>VS: new Audio("data:audio/wav;base64,...")
    VS->>UI: onStateChange('playing') [Show Pause/Replay]
    VS->>Farmer: Plays genuine Odia speech
    opt Pause / Resume / Replay
        Farmer->>UI: Clicks Pause
        UI->>VS: pause()
        VS->>UI: onStateChange('paused') [Show Resume/Replay]
        Farmer->>UI: Clicks Resume
        UI->>VS: resume()
        VS->>UI: onStateChange('playing')
    end
    VS->>UI: onStateChange('idle') [Audio finished]
```

---

## 3. Files Changed and Implementation Details

| Component | File Path | Key Changes |
| :--- | :--- | :--- |
| **Backend Config** | `backend/app/core/config.py` | Added `SARVAM_API_KEY`, `SARVAM_TTS_MODEL = "bulbul:v3"`, `SARVAM_DEFAULT_SPEAKER = "shubh"`, `SARVAM_TTS_ENDPOINT`. |
| **Backend Env Example** | `backend/.env.example` | Documented `SARVAM_API_KEY` placeholder. |
| **Backend Schemas** | `backend/app/models/voice.py` | Defined `VoiceTTSRequest`, `VoiceTTSResponse`, `SpeakerInfo`, `SupportedSpeakersResponse`. |
| **Backend Service** | `backend/app/services/voice.py` | Implemented `synthesize_odia_speech` with length clamping, language normalization (`od-IN`), fail-closed API key check, error mapping (400, 429, 502, 504), and `_call_sarvam_api`. |
| **Backend Endpoints** | `backend/app/api/v1/endpoints/voice.py` | Implemented `POST /tts`, `GET /speakers`, and `GET /health`. |
| **Backend Router** | `backend/app/api/v1/router.py` | Registered `voice` router under `/voice`. |
| **Backend Tests** | `backend/tests/test_voice_tts.py` | 6 comprehensive pytest cases validating health, speakers, missing key fail-closed, validation rejection, Odia synthesis, and error handling. |
| **Frontend Service** | `src/services/voiceService.ts` & `frontend/src/services/voiceService.ts` | Complete rewrite of `VoiceService`: base64 WAV playback, `AbortController` cancellation, `pause()`, `resume()`, `replay()`, `stopSpeaking()`, state observer. |
| **Assistant UI** | `src/components/VoiceAssistant.tsx` & `frontend/src/components/VoiceAssistant.tsx` | Added Sarvam Bulbul v3 status badge, animated listening soundwave, playback controls (Play/Pause/Replay/Stop), loading spinner, and readable Odia transcript. |
| **Diagnostic Report UI**| `src/components/PestReport.tsx` & `frontend/src/components/PestReport.tsx` | Added multi-state "Listen in Odia" control group (Loading, Playing, Paused, Error/Retry), preserved Latin binomials in narration, unmount cleanup. |
| **Frontend Tests** | `test_voice_tts.mjs` & `frontend/test_voice_tts.mjs` | Automated Node.js tap test suite for Odia voice contracts, fail-closed handling, rapid clicks abort, and binomial preservation. |

---

## 4. Test Verification Results

### 4.1 Backend Pytest Suite
Ran: `backend/.venv/Scripts/python.exe -m pytest backend/tests -v`
- **Total Backend Tests:** 63 passed, 0 failed (100% pass rate in 10.95s).
- **Voice TTS Tests:** 6 passed in 1.46s:
  1. `test_language_code_normalization`: PASSED
  2. `test_voice_speakers_and_health_endpoints`: PASSED
  3. `test_tts_missing_api_key_fails_closed`: PASSED
  4. `test_tts_validation_rejections`: PASSED
  5. `test_tts_odia_speech_synthesis_success`: PASSED
  6. `test_tts_provider_error_handling`: PASSED

### 4.2 Frontend Voice & Regression Suite
Ran: `npm test` (`tsx test_frontend.mjs && tsx test_responsive_viewports.mjs && tsx test_voice_tts.mjs`)
- **Total Frontend Tests:** 19 passed, 0 failed.
  - `test_frontend.mjs`: 8 passed (knowledge base, 16 specimens, treatment gate, HMAC traceability).
  - `test_responsive_viewports.mjs`: 4 passed (9 viewports, 44px touch targets, camera orientations).
  - `test_voice_tts.mjs`: 7 passed:
    1. VoiceService Singleton & Initial State: PASSED
    2. Empty or Whitespace Text Handling: PASSED
    3. Odia Language Routing & Payload Contract (`od-IN`): PASSED
    4. Fail-Closed Fallback (No Hindi/English silent substitution): PASSED
    5. Playback Controls (Pause/Resume/Replay/Stop): PASSED
    6. Rapid Repeated Speaker Clicks (Abort prior requests): PASSED
    7. Scientific Names & Dosages Preservation: PASSED

### 4.3 Production TypeScript & Vite Builds
- `cd frontend && npm run build`: **0 errors**, built in 10.42s (`dist/assets/index-BK-z_XyG.js`).
- `npm run build`: **0 errors**, built in 9.14s (`dist/assets/index-B1NUtXqO.js`).

---

## 5. Security & Safety Compliance

1. **Zero Provider Secret Leakage:**
   - `SARVAM_API_KEY` is referenced solely in `backend/app/core/config.py`.
   - Frontend never imports or reads `SARVAM_API_KEY`.
   - Client API responses return only sanitized audio payloads and metadata.
2. **Fail-Closed Policy:**
   - If the Sarvam API is unreachable, unkeyed, or rate-limited, the system displays an honest Odia error notification: `ଓଡ଼ିଆ ଅଡିଓ ସାମୟିକ ଭାବେ ଅନୁପଲବ୍ଧ ଅଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।`
   - Under no circumstances does the system play Hindi or English speech when Odia was requested.
3. **Agricultural Scientific Integrity:**
   - All Latin binomials (*Scirpophaga incertulas*, *Nilaparvata lugens*, *Cnaphalocrocis medinalis*, *Dicladispa armigera*, *Mythimna separata*) are preserved in parentheses alongside local names.
   - CIBRC-registered active ingredients and chemical dosage instructions are spoken accurately.

---

## 6. Production Deployment Instructions

### 6.1 Railway (Backend)
Add the following environment variable to the Railway service:
- `SARVAM_API_KEY`: `<Your Sarvam AI API Subscription Key>`
- Restart service to reload configuration.

### 6.2 Vercel (Frontend)
Ensure `VITE_API_URL` points to the deployed Railway backend:
- `VITE_API_URL`: `https://<your-railway-backend-url>/api/v1`

---

## 7. Deliverables Index

1. `PHASE_6_3_ODIA_VOICE_FIX_REPORT.md`: Comprehensive audit report (this file).
2. `phase6_3_tts_backend_tests.txt`: Pytest execution log confirming 6/6 voice tests pass.
3. `phase6_3_frontend_voice_tests.txt`: Node.js tap test log confirming 7/7 voice tests pass.
4. `phase6_3_browser_device_test_matrix.csv`: 20-row test matrix across mobile Chrome, Edge, and iOS Safari.
5. `phase6_3_production_voice_verification.md`: End-to-end trace and specification document.
