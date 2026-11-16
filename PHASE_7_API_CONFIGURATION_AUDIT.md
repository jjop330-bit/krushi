# KRUSHI MITRA AI — PHASE 7: API CONFIGURATION & PRODUCTION INTEGRATION AUDIT

**Project:** Krushi Mitra AI  
**Deployment Infrastructure:** Vercel (Frontend React SPA) & Railway (FastAPI Backend Server)  
**Date:** November 17, 2026  
**Auditor:** Principal DevOps & Cloud Security Engineer  
**Status:** **AUDITED & PRODUCTION READY**

---

## 1. Environment Variable Architecture & Security Isolation

To protect API credentials, prevent client-side secret exposure, and eliminate key harvesting vulnerabilities:

| Environment Variable | Hosting Target | Accessibility Scope | Purpose | Status in Environment |
|---|---|---|---|---|
| `GEMINI_API_KEY` | **Railway Backend Only** | Server Process (`os.environ`) | Powers backend multimodal image diagnosis & Odia agricultural chat | Configured (53 chars) |
| `GEMINI_MODEL` | **Railway Backend Only** | Server Process (`os.environ`) | Model version identifier (`gemini-3.5-flash-lite`) | Default configured |
| `SARVAM_API_KEY` | **Railway Backend Only** | Server Process (`os.environ`) | Powers Sarvam AI Bulbul v3 Odia TTS synthesis (`od-IN`) | Configured (36 chars) |
| `SARVAM_TTS_MODEL` | **Railway Backend Only** | Server Process (`os.environ`) | Speech model identifier (`bulbul:v3`) | Default configured |
| `SARVAM_DEFAULT_SPEAKER` | **Railway Backend Only** | Server Process (`os.environ`) | Default voice persona (`shubh`) | Default configured |
| `VITE_API_URL` | **Vercel Frontend Build** | Client Browser Runtime | Base URL targeting the production FastAPI backend | Points to deployed Railway backend |

> [!CAUTION]
> **Zero Secrets in Frontend:** Neither `GEMINI_API_KEY` nor `SARVAM_API_KEY` is ever exposed in client-side bundles or `VITE_` variables. All AI reasoning and voice generation occur strictly through server-side authenticated proxy endpoints.

---

## 2. API Endpoints & Request/Response Contracts

### A. Chat Assistant Endpoint
* **Path:** `POST /api/v1/assistant/chat`
* **Request Contract:**
  ```json
  {
    "query": "string (required, e.g. 'ଧାନ ଗଛରେ କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଲେ କଣ କରିବି?')",
    "pest_context": "string (optional, e.g. 'bph', 'stem_borer', 'fall_armyworm')",
    "farmer_district": "string (e.g. 'bargarh')",
    "language": "string ('or' | 'en')"
  }
  ```
* **Response Contract:**
  ```json
  {
    "id": "chat-7b98f21a4e",
    "reply_en": "English guidance text",
    "reply_or": "ଓଡ଼ିଆ ଲିପିରେ ପ୍ରାମାଣିକ କୃଷି ପରାମର୍ଶ",
    "pest_context": "stem_borer",
    "suggested_action_pills_en": ["Action 1", "Action 2"],
    "suggested_action_pills_or": ["ପରାମର୍ଶ ୧", "ପରାମର୍ଶ ୨"]
  }
  ```

### B. Voice TTS Synthesis Endpoint
* **Path:** `POST /api/v1/voice/tts`
* **Request Contract:**
  ```json
  {
    "text": "string (required, 1-2500 chars in Odia script)",
    "language_code": "string ('od-IN' | 'or' | 'or-IN')",
    "speaker": "string ('shubh' | 'priya' | 'pooja')",
    "pace": "number (0.5 to 2.0, default 1.0)"
  }
  ```
* **Response Contract:**
  ```json
  {
    "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
    "mime_type": "audio/wav",
    "duration_seconds": 3.8,
    "model": "bulbul:v3",
    "language_code": "od-IN",
    "speaker": "shubh",
    "character_count": 128,
    "cached": false
  }
  ```

### C. Image Diagnostic Endpoint
* **Path:** `POST /api/v1/pest/analyze-base64`
* **Request Contract:**
  ```json
  {
    "image_base64": "data:image/jpeg;base64,...",
    "crop_id": "paddy",
    "plant_part": "leaf",
    "farmer_district": "bargarh",
    "forced_pest_id": null
  }
  ```
* **Response Contract:** Full `PestAnalysisResponse` with cryptographic `image_hash`, `model_version`, `status`, `treatment_allowed`, and 3-tier IPM recommendations.

---

## 3. Production CORS & Deployment Alignment

* **Backend CORS Configuration (`backend/app/main.py`):**
  ```python
  origins = [
      "https://krushi-psi.vercel.app",
      "https://krushi-mitra-ai.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "*"
  ]
  ```
* **Vercel Settings Check:**
  * **Framework Preset:** Vite
  * **Build Command:** `npm run build` (`tsc && vite build`)
  * **Output Directory:** `dist`
  * **Rewrites:** Single-Page Application wildcard (`/(.*)` -> `/index.html`)

---

## 4. Manual Actions Required by User (if any)

1. **Verify Railway Service Environment Variables:**
   Ensure `GEMINI_API_KEY` and `SARVAM_API_KEY` are populated in the Railway project dashboard under *Variables*.
2. **Verify Vercel Environment Variables:**
   Ensure `VITE_API_URL` is set to `https://<YOUR-RAILWAY-SERVICE-URL>/api/v1` in the Vercel project dashboard under *Settings > Environment Variables*.
