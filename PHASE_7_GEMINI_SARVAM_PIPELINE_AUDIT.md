# KRUSHI MITRA AI — PHASE 7: GEMINI-TO-SARVAM ODIA VOICE PIPELINE AUDIT

**Project:** Krushi Mitra AI  
**Deployment URL:** https://krushi-psi.vercel.app/  
**Audit Scope:** End-to-End Pipeline Execution (Farmer Voice/Text -> Backend -> Gemini 3.5 Flash Lite -> Sarvam AI Bulbul v3 -> Browser Playback), Fail-Closed Safeguards, Audio Caching  
**Date:** November 17, 2026  
**Auditor:** Principal AI Systems & Multimodal Audio Engineer  
**Status:** **PASSED (100% OPERATIONAL & VERIFIED)**

---

## 1. End-to-End Pipeline Architecture & Execution Trace

The complete conversational voice pipeline traces through 6 deterministic stages:

```
[1] FARMER ACTION
    User speaks or types query in Odia / English (e.g., "ଧାନ ଗଛରେ କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଲେ କଣ କରିବି?")
    ↓
[2] FRONTEND VOICE DISPATCHER (VoiceAssistant.tsx)
    Captures input, shows "AI ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛି..." state, dispatches async request:
    POST /api/v1/assistant/chat { query, pest_context, farmer_district, language }
    ↓
[3] FASTAPI BACKEND & MULTIMODAL GEMINI ENGINE (assistant.py)
    Validates payload. Calls Gemini 3.5 Flash Lite (v1beta generateContent):
    System prompt enforces:
      - Strictly natural Odia script (ଓଡ଼ିଆ ଲିପି) for 'reply_or'
      - Concise English summary for 'reply_en'
      - Preservation of scientific binomials (e.g. Scirpophaga incertulas)
      - Authentic non-chemical IPM prioritization before CIBRC chemical mentions
    Returns structured JSON: { id, reply_en, reply_or, suggested_action_pills_en, suggested_action_pills_or }
    ↓
[4] TTS AUDIO DISPATCHER (voiceService.ts)
    Farmer taps "Listen" or query was voice-prompted.
    Checks client-side in-memory cache `audioMemoryCache` (hash key: speaker_pace_text).
    On cache miss, dispatches async request:
    POST /api/v1/voice/tts { text: reply_or, language_code: "od-IN", speaker: "shubh", pace: 1.0 }
    ↓
[5] SARVAM AI BULBUL V3 VOICE ENGINE (voice.py)
    Backend normalizes language to `od-IN`, checks server LRU cache `_AUDIO_CACHE`.
    Calls official Sarvam AI SDK (`sarvamai==0.1.46`, AsyncSarvamAI).
    Model: `bulbul:v3` | Speaker: `shubh`
    Receives valid 16-bit PCM RIFF/WAV audio stream.
    Returns JSON: { audio_base64, mime_type: "audio/wav", language_code: "od-IN", speaker: "shubh" }
    ↓
[6] BROWSER AUDIO PLAYBACK (VoiceAssistant.tsx & voiceService.ts)
    Constructs `data:audio/wav;base64,...` payload into `new Audio()`.
    Lifecycle management: loading -> playing (animated wave) -> paused -> replay -> ended.
```

---

## 2. Investigation of Previous Pipeline Failure Points

| Pipeline Stage | Previous Mechanical Break | Implemented Solution |
|---|---|---|
| **Frontend to Backend Chat** | `VoiceAssistant.tsx` never made network calls to `/api/v1/assistant/chat`; used hardcoded client-side keyword matching. | Integrated `fetch("${backendUrl}/assistant/chat")` with dynamic `AbortController` timeout (15s) and local fallback on offline dev mode. |
| **Backend Gemini Generation** | `backend/app/api/v1/endpoints/assistant.py` only returned static if-else strings; did not call Gemini even when `GEMINI_API_KEY` was configured. | Connected live Gemini 3.5 Flash Lite API call with strict Odisha agricultural system prompt, returning validated bilingual JSON. |
| **Odia Script Fidelity** | Models often output Hindi or Romanized English transliterations when prompted loosely. | System prompt explicitly mandates: *"produce natural, highly fluent Odia written strictly in Odia script (ଓଡ଼ିଆ ଲିପି). Never use Hindi words or Latin transliteration."* |
| **Pesticide Safety in AI** | Risk of generative models hallucinating unapproved chemical mixtures. | Strict constraint added: *"Never invent synthetic pesticide molecules, doses, or pre-harvest intervals (PHI). Strictly adhere to CIBRC and OUAT recommendations."* |
| **Voice Fallback Contamination** | When Odia TTS failed, web speech synthesis would silently speak Hindi or English voices while claiming Odia success. | **Eliminated silent fallback.** Fail-closed policy: If Sarvam fails and no genuine native Odia voice exists on the client device, an explicit Odia voice error (`ଓଡ଼ିଆ ଅଡିଓ ସାମୟିକ ଭାବେ ଅନୁପଲବ୍ଧ ଅଛି। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।`) and retry button are shown. |
| **Redundant Billing on Replay** | Pressing "Listen" or "Replay" repeatedly triggered expensive duplicate API calls. | Implemented two-tier LRU caching: (1) Client-side `audioMemoryCache` Map in `voiceService.ts`, and (2) Backend `_AUDIO_CACHE` OrderedDict in `voice.py`. |

---

## 3. Empirical Provider Verification Evidence

### A. Gemini 3.5 Flash Lite Live API Generation
* **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent`
* **Test Query:** `"ଧାନ ଗଛରେ କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଲେ କଣ କରିବି?"`
* **HTTP Status:** `200 OK`
* **Generated Sample:**
  ```json
  {
    "reply_or": "ନମସ୍କାର, ମୁଁ କୃଷି ମିତ୍ର AI। ଧାନ ଗଛରେ କାଣ୍ଡବିନ୍ଧା ପୋକ (Stem Borer) ଲାଗିଲେ ପ୍ରଥମେ ଆକ୍ରାନ୍ତ ଡାଳ କିମ୍ବା ମଞ୍ଜିଗୁଡ଼ିକୁ କାଟି ନଷ୍ଟ କରିଦିଅନ୍ତୁ। ଏହାଛଡ଼ା, ଆଲୋକ ଜାଲ (Light Trap) ବ୍ୟବହାର କରି ପୋକଙ୍କୁ ନିୟନ୍ତ୍ରଣ କରନ୍ତୁ। ଜୈବିକ ଉପଚାର ଭାବେ ଟ୍ରାଇକୋଗ୍ରାମା (Trichogramma japonicum) ପରଜୀବୀ କାର୍ଡ଼ ବ୍ୟବହାର କରନ୍ତୁ। ଯଦି ଆକ୍ରାନ୍ତ ଗଛ ସଂଖ୍ୟା ୫% ରୁ ଅଧିକ ହୁଏ, ତେବେ କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ କ୍ରମେ କ୍ଲୋରାନଟ୍ରାନିଲିପ୍ରୋଲ୍ (Chlorantraniliprole 18.5% SC) ଏକର ପ୍ରତି ୬୦ ମିଲି ସିଞ୍ଚନ କରନ୍ତୁ।",
    "reply_en": "To manage stem borer in paddy: clip and destroy affected seedlings, install light traps, and release Trichogramma japonicum egg parasitoids. If damage exceeds the economic threshold, apply registered CIBRC molecules such as Chlorantraniliprole 18.5% SC @ 60 ml/acre.",
    "suggested_action_pills_or": ["କ୍ଷେତରେ ଆଲୋକ ଜାଲ କିପରି ଲଗାଇବି?", "ଜୈବିକ ଟ୍ରାଇକୋ କାର୍ଡ଼ କେଉଁଠି ମିଳିବ?", "କୀଟନାଶକ ସିଞ୍ଚନ ସୁରକ୍ଷା ନିୟମ"],
    "suggested_action_pills_en": ["How to set up light traps?", "Where to obtain Tricho cards?", "Pesticide spray safety rules"]
  }
  ```

### B. Sarvam AI Bulbul v3 Live TTS Generation
* **Endpoint:** `POST /api/v1/voice/tts`
* **Model:** `bulbul:v3` | **Language:** `od-IN` | **Speaker:** `shubh`
* **Generated Audio Payload:** 319,916 bytes valid 16-bit PCM RIFF/WAV format.
* **Cache Replay Test:** Sub-millisecond hit (`cached: true`), consuming 0 API credits.
