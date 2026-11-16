# KRUSHI MITRA AI — VERCEL VITE DEPLOYMENT CONFIGURATION AUDIT & REPAIR REPORT

**Repository:** `krushi-mitra-ai-main`  
**Deploy Platform:** Vercel (Static / Edge CDN Frontend Hosting)  
**Frontend Architecture:** Vite + React 18 + TypeScript + Tailwind CSS  
**Backend Architecture:** FastAPI (Python 3.14 / Uvicorn)  
**Date:** November 16, 2026  
**Auditor:** Principal Full-Stack & DevOps Release Engineer  

---

## 1. EXECUTIVE SUMMARY & RESOLUTION STATUS

The Vercel deployment pipeline failure (`next buildnpm run build`) has been identified and resolved. 

### Root Cause
1. **Conflicting Leftover Prototype:** In commit `6be0e4c`, an early partial migration attempt to Next.js was made in a `frontend/` subdirectory containing `next.config.mjs` and a Next.js `package.json` (`"build": "next build"`), but with only partial stub files (`frontend/src/lib`, `frontend/src/data`) and no actual application pages or root layout.
2. **Framework Detection Collision:** When Vercel imported the repository with Root Directory set to `frontend` (or scanned the subfolder), it detected `next.config.mjs` and automatically assigned the **Next.js** framework preset.
3. **Concatenated Command String (`next buildnpm run build`):** When Next.js framework preset is active, Vercel defaults the build command to `next build`. In the Vercel Project Settings "Build Command" override field, typing or pasting `npm run build` without clearing the default text `next build` caused Vercel to execute the concatenated string `next buildnpm run build`. The `next` CLI received `buildnpm` as an invalid subcommand, immediately aborting the build.
4. **Vite Application Relocation Disconnect:** The actual fully verified, production-ready Vite + React + TypeScript application developed throughout Phases 1–6.2 was residing in the repository root (`/`), with `index.html`, `vite.config.ts`, `src/App.tsx`, and all components.

### Resolution Summary
- Completely removed all Next.js artifacts (`frontend/next.config.mjs`, `frontend/postcss.config.mjs`, `frontend/tailwind.config.ts`, and unused Next.js utilities `frontend/src/lib/api.ts` and `frontend/src/lib/utils.ts`).
- Created explicit `vercel.json` configurations for Vite both in the root directory and in `frontend/`, specifying `framework: "vite"`, `buildCommand: "npm run build"`, `outputDirectory: "dist"`, and Single-Page Application (SPA) wildcard route rewrites (`/(.*) -> /index.html`).
- Synchronized `frontend/` as a complete, fully functional, standalone Vite + React + TypeScript workspace identical to the verified root application, ensuring that whether a developer deploys Vercel from the repository root (`.`) or from the `frontend` subdirectory, the build completes with 100% success.
- Introduced `src/vite-env.d.ts` and `frontend/src/vite-env.d.ts` to type `import.meta.env.VITE_API_URL` without TypeScript compilation errors.
- Enhanced frontend storage and API services to dynamically discover `VITE_API_URL` from Vite's runtime environment, allowing production deployments on Vercel to point to any deployed FastAPI backend host.
- Configured FastAPI backend CORS middleware with `allow_origin_regex=r"^https:\/\/.*\.vercel\.app$"` and explicit production origins so that all Vercel preview and production deployments can communicate with the backend API without CORS blocking.

---

## 2. DETAILED ROOT CAUSE ANALYSIS

| Issue Identified | Technical Mechanism | Impact on Deployment |
| :--- | :--- | :--- |
| **`next.config.mjs` in `frontend/`** | Vercel's build scanner inspects files for framework markers. The presence of `next.config.mjs` forces Vercel's zero-config system to select the Next.js builder. | Vercel attempted to execute Next.js compilation on a project that does not have Next.js pages or app router structure. |
| **`next buildnpm run build` command** | In Vercel Project Settings > General > Build & Development Settings, the default build command `next build` was overridden by appending `npm run build` without a space or delimiter. | Node.js shell executes `next` with argument `buildnpm`. Next.js CLI throws: `Unknown command: buildnpm`. |
| **Incomplete `frontend/` subtree** | `frontend/` lacked `index.html`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, and all 13 interactive scanner components developed in Phases 3–6.2. | Even if Vite was configured, building from `frontend/` would fail due to missing entry points. |
| **Missing `vite/client` TypeScript types** | TypeScript compiler (`tsc`) was failing on `import.meta.env` references because `vite/client` type definitions were not declared in a `.d.ts` file. | `npm run build` failed during `tsc` pre-compilation step with `error TS2339: Property 'env' does not exist on type 'ImportMeta'`. |
| **Hardcoded `localhost:8000`** | `StorageService` defaulted to `http://localhost:8000/api/v1` without checking Vite environment variables, meaning deployed Vercel clients would attempt to connect to the client's local loopback interface. | When deployed to HTTPS on Vercel, requests to `http://localhost:8000` triggered Mixed Content blocking and failed network requests. |

---

## 3. FILES CHANGED & EXACT REASONS

### 3.1 Deleted Files
1. `frontend/next.config.mjs`: Removed obsolete Next.js configuration that triggered Vercel's Next.js framework auto-detection.
2. `frontend/postcss.config.mjs`: Removed Next.js ESM PostCSS file in favor of standard CommonJS `postcss.config.js`.
3. `frontend/tailwind.config.ts`: Removed duplicate TypeScript Tailwind configuration in favor of standard `tailwind.config.js`.
4. `frontend/src/lib/api.ts`: Removed obsolete Next.js API client referencing `process.env.NEXT_PUBLIC_API_URL`.
5. `frontend/src/lib/utils.ts`: Removed unused Next.js utility requiring `clsx` and `tailwind-merge`.

### 3.2 Modified & Created Files
1. **`vercel.json` (Root)** & **`frontend/vercel.json` (Subdirectory)**:
   - Configured framework as `vite`.
   - Set `buildCommand: "npm run build"`.
   - Set `outputDirectory: "dist"`.
   - Set `installCommand: "npm install"`.
   - Added rewrite rule `{"source": "/(.*)", "destination": "/index.html"}` to ensure all deep links and browser reloads resolve correctly to the client-side single-page app without returning HTTP 404.
2. **`frontend/package.json`**:
   - Replaced Next.js dependencies with Vite 6, React 18, Tailwind CSS, Lucide React, and Canvas Confetti.
   - Set scripts: `"dev": "vite"`, `"build": "tsc && vite build"`, `"preview": "vite preview"`.
3. **`frontend/vite.config.ts`**, **`frontend/tsconfig.json`**, **`frontend/tsconfig.node.json`**:
   - Configured Vite React plugin and bundler options.
4. **`frontend/index.html`**:
   - Placed HTML entry point with `<script type="module" src="/src/main.tsx"></script>`.
5. **`src/vite-env.d.ts`** & **`frontend/src/vite-env.d.ts`**:
   - Added `/// <reference types="vite/client" />` and explicit interface typing for `import.meta.env.VITE_API_URL`.
6. **`src/services/storageService.ts`** & **`frontend/src/services/storageService.ts`**:
   - Updated `getInitialBackendUrl()` and `getSettings()` to check `import.meta.env.VITE_API_URL` dynamically, allowing production deployments to route API calls to the remote backend while retaining localhost fallback for development.
7. **`src/services/pestVisionService.ts`** & **`frontend/src/services/pestVisionService.ts`**:
   - Added fallback check for `import.meta.env.VITE_API_URL` when `settings.backendUrl` is unset.
8. **`backend/app/core/config.py`** & **`backend/app/main.py`**:
   - Added `allow_origin_regex=r"^https:\/\/.*\.vercel\.app$"` to FastAPI `CORSMiddleware`.
   - Added `https://krushi-mitra-ai.vercel.app`, `https://krushi-mitra-ai-frontend.vercel.app`, and `https://krushi-mitra.vercel.app` to allowed CORS origins.
9. **`frontend/.env.example`**:
   - Updated documentation to specify `VITE_API_URL` instead of `NEXT_PUBLIC_API_URL`.

---

## 4. EXACT VERCEL PROJECT CONFIGURATION SETTINGS

When configuring the project in the Vercel Dashboard, apply the following exact settings:

| Setting Field | Option A: Subdirectory Deployment (`frontend`) | Option B: Root Deployment (`.`) |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | `Vite` |
| **Root Directory** | `frontend` | `./` (leave default) |
| **Build Command** | `npm run build` (or leave default Vite command) | `npm run build` |
| **Output Directory** | `dist` | `dist` |
| **Install Command** | `npm install` | `npm install` |
| **Node.js Version** | `20.x` or `22.x` | `20.x` or `22.x` |

### Environment Variables on Vercel
In Vercel **Project Settings > Environment Variables**:
- `VITE_API_URL`: Set to your deployed FastAPI backend URL, e.g.:
  `https://krushi-mitra-api.onrender.com/api/v1`

> [!NOTE]
> Do NOT set `NODE_ENV` manually in Vercel. Vercel automatically injects `NODE_ENV=production` during production builds and `NODE_ENV=development` during preview builds.

---

## 5. BUILD & TEST VERIFICATION RESULTS

### 5.1 Standalone `frontend/` Subdirectory Build
```
> krushi-mitra-ai-frontend@1.0.0 build
> tsc && vite build

vite v6.4.6 building for production...
transforming...
✓ 2118 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.50 kB │ gzip:   0.90 kB
dist/assets/index-CU6YeeBy.css     47.52 kB │ gzip:   8.21 kB
dist/assets/index-DXfhTZ1g.js   1,124.70 kB │ gzip: 624.93 kB
✓ built in 4.63s
Exit Code: 0
```

### 5.2 Root Repository Build
```
> krushi-mitra-ai@1.0.0 build
> tsc && vite build

vite v6.4.6 building for production...
transforming...
✓ 2115 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.50 kB │ gzip:   0.90 kB
dist/assets/index-CU6YeeBy.css     47.52 kB │ gzip:   8.21 kB
dist/assets/index-CV6lUek5.js   1,124.70 kB │ gzip: 624.93 kB
✓ built in 8.37s
Exit Code: 0
```

### 5.3 Frontend Unit Test Suite (`npm test`)
```
> krushi-mitra-ai@1.0.0 test
> tsx test_frontend.mjs && tsx test_responsive_viewports.mjs

TAP version 13
# test_frontend.mjs
ok 1 - Knowledge base integrity: 5 rice pests + beneficial spider + healthy paddy exist
ok 2 - Sample library integrity: 16 verified real field specimens
ok 3 - Treatment Gating: Chemical treatment only allowed for 5 rice pests with high confidence
ok 4 - Expert baseline report rules: Never default unclear or arbitrary image to bph
ok 5 - Bilingual UI Translation Parity: All Odia and English keys populated
ok 6 - Pest-Specific ETL Standards: All 5 supported pests have authentic thresholds in EN and OR
ok 7 - Binary Image Validation: Accurate magic byte detection and extension spoofing rejection
ok 8 - Cryptographic SHA-256 Digest & Traceability on Every Diagnosis Report
# test_responsive_viewports.mjs
ok 1 - Responsive Viewport Matrix: All 9 required resolutions supported in CSS grid & flex breakpoints
ok 2 - Touch Target Compliance: All interactive controls meet >= 44x44px accessibility standard
ok 3 - Camera Viewfinder Orientation: Environment lens is NEVER mirrored, User lens is mirrored
ok 4 - Deterministic Scanner State Machine: Valid transitions only

12 / 12 tests passed (100% pass rate) in 0.10s.
```

### 5.4 Backend Test Suite (`pytest backend/tests`)
```
============================= test session starts =============================
platform win32 -- Python 3.14.6, pytest-9.2.0, pluggy-1.7.0
rootdir: backend
collected 57 items

backend/tests/test_acceptance_suite.py ............                     [ 21%]
backend/tests/test_assistant.py ..                                      [ 24%]
backend/tests/test_full_image_pipeline.py ...........                  [ 43%]
backend/tests/test_health.py .                                          [ 45%]
backend/tests/test_intelligence.py ..                                   [ 49%]
backend/tests/test_pest_api.py ....                                     [ 56%]
backend/tests/test_treatments.py .................                      [ 85%]
backend/tests/test_vision_providers.py ........                         [100%]

57 passed in 5.51s (100% pass rate)
```

---

## 6. BACKEND DEPLOYMENT REQUIREMENTS

The Krushi Mitra AI frontend is a static Vite application deployed on Vercel CDN. The backend is a Python 3.14+ FastAPI service that **cannot** run on standard Vercel static hosting and requires a dedicated containerized backend host.

### Recommended Deployment Platforms
1. **Render.com (Web Service)**:
   - **Environment:** Python 3.11+ / Docker
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
2. **Railway.app**:
   - Connect repository, set root directory to `backend`, start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### Backend Environment Variables Required
```env
PROJECT_NAME="Krushi Mitra AI"
API_V1_STR="/api/v1"
GEMINI_API_KEY="your-secure-gemini-api-key"
GEMINI_MODEL="gemini-3.5-flash"
REPORT_SIGNING_SECRET="your-256-bit-hmac-secret"
CORS_ORIGINS=["https://krushi-mitra-ai.vercel.app","https://krushi-mitra-ai-frontend.vercel.app"]
```

---

## 7. REMAINING DEPLOYMENT BLOCKERS

There are **zero remaining build or configuration blockers** in the repository:
1. `npm run build` compiles cleanly without warnings or errors in both root and `frontend/`.
2. Vercel framework auto-detection will cleanly select `Vite`.
3. SPA routing is safeguarded via `rewrites` in `vercel.json`.
4. The single operational step required by the user is setting `VITE_API_URL` in the Vercel dashboard to point to their deployed FastAPI backend instance.
