# PHASE 6.4 API INTEGRATION & RELIABILITY AUDIT
**Project:** Krushi Mitra AI  
**Scope:** Complete Frontend-to-Backend End-to-End API Audit, Schemas, Timeout Handling, and Security  
**Status:** VERIFIED & PASS  
**Date:** November 2026  

---

## 1. Overview of Audited Endpoints

The complete API surface of Krushi Mitra AI was audited for method correctness, schema consistency, CORS policies, timeout behavior, error handling, rate limiting, and zero-fabrication safety:

| Endpoint | Method | Path | Request Schema | Response Schema | Status Code | Timeout |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **System Health** | `GET` | `/api/v1/health` | None | `{ status: "ok", version: "6.4.0", timestamp: ... }` | 200 OK | 5,000 ms |
| **All Crops Registry** | `GET` | `/api/v1/crops` | None | `CropListResponse` (32 crops) | 200 OK | 5,000 ms |
| **Crop Categories** | `GET` | `/api/v1/crops/categories` | None | Array of 5 category objects | 200 OK | 5,000 ms |
| **Single Crop Detail** | `GET` | `/api/v1/crops/{crop_id}` | Path param: `crop_id` | `CropDetail` structured registry | 200 OK / 404 | 5,000 ms |
| **Pest Species List** | `GET` | `/api/v1/pest/species` | Optional query `crop_id` | Array of supported pest definitions | 200 OK | 5,000 ms |
| **Single Pest Detail** | `GET` | `/api/v1/pest/species/{pest_id}`| Path param: `pest_id` | Full biological, cultural & ETL spec | 200 OK / 404 | 5,000 ms |
| **Base64 Image Scan** | `POST`| `/api/v1/pest/analyze-base64` | `{ image_base64, crop_id, plant_part, farmer_district }` | `PestIdentificationResponse` | 200 OK / 422 | 25,000 ms |
| **Multipart File Scan**| `POST`| `/api/v1/pest/analyze-file` | `multipart/form-data (image, crop_id, plant_part)` | `PestIdentificationResponse` | 200 OK / 400 | 25,000 ms |
| **Treatment Guidance** | `POST`| `/api/v1/treatments/recommendation` | `{ scan_id, crop_id, pest_id, observation_provenance }` | 3-tier IPM advice (chemical locked if below ETL) | 200 OK / 403 | 5,000 ms |
| **Chemical Auth Gate** | `POST`| `/api/v1/treatments/authorize-chemical` | `{ scan_id, pest_id, field_count, verified_hill_count }` | Signed cryptographic authorization token or refusal | 200 OK / 403 | 5,000 ms |
| **Odia Voice TTS** | `POST`| `/api/v1/voice/tts` | `{ text, target_language_code: "od-IN", speaker }` | Base64 audio + duration metadata | 200 OK / 400 | 15,000 ms |
| **Voice Speakers** | `GET` | `/api/v1/voice/speakers` | None | `{ supported_languages: ["od-IN", "en-IN"], speakers: [...] }` | 200 OK | 5,000 ms |

---

## 2. In-Depth Audit of the Scanning Flow

### Scanning Endpoint: `POST /api/v1/pest/analyze-base64`
1. **Frontend Request:**
   - Validates authentic JPG/PNG/WEBP binary magic bytes on client side.
   - Resizes large smartphone snapshots to max 1280px JPEG 0.88 (~180KB–240KB).
   - Generates SHA-256 client hash.
   - Attaches `crop_id` (e.g. `maize`, `tomato`, `paddy`) and `plant_part` (e.g. `leaf`, `stem`, `fruit`).
   - Links request to an `AbortController` signal with 25-second watchdog timer.
2. **Backend Validation:**
   - Inspects Base64 header and rejects non-image payloads with HTTP 400.
   - Enforces 25MB maximum raw size and Pillow decompression bomb defense.
   - Performs image quality check (sharpness, brightness, variance).
   - Invokes crop-aware multimodal vision inference or deterministic entomological reference knowledge base.
3. **Structured Response Contract:**
   - Rejection cases (`UNSUPPORTED_SPECIES`, `NON_TARGET_INSECT`, `HEALTHY_CROP`, `CROP_DAMAGE_NO_VISIBLE_INSECT`, `NON_AGRICULTURAL_IMAGE`) are returned with `treatment_allowed: false` and explicit diagnostic reasons.
   - Supported identified pests return confidence score, scientific name, Odia name, observed visual evidence, and harvest damage range.

---

## 3. Reliability & Fail-Closed Safety Protections

- **Secret Key Protection:** Server-side API keys (`GEMINI_API_KEY`, `SARVAM_API_KEY`) are protected in backend `.env` and never leaked into client bundles. Direct browser fallback mode uses client-side BYOK storage.
- **AI Provider Outage Behavior:** If the upstream multimodal AI model times out or returns HTTP 429 / 503, the backend does **NOT** invent a pest or default to `bph`. It returns an honest service degradation error with guidance to scout physically or contact the KVK.
- **CORS Configuration:** Verified permissive across localhost, preview Vercel URLs, and `https://krushi-psi.vercel.app/`.
- **Concurrency & Re-entrancy:** Active requests track a unique `activeRequestIdRef`. When a user retakes or replaces a photograph, previous in-flight HTTP requests are aborted.

---

## 4. Audit Conclusion
All 12 endpoints pass schema validation, HTTP status code checks, timeout tests, and chemical authorization safeguards with 100% compliance.
