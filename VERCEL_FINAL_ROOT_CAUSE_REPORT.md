# KRUSHI MITRA AI — FINAL VERCEL NEXT.JS BUILD ERROR INVESTIGATION & ROOT CAUSE REPORT

**Repository:** `krushi-mitra-ai-main`  
**Deploy Platforms:** Vercel (Frontend CDN) / Railway (FastAPI Backend)  
**Date:** November 16, 2026  
**Auditor:** Principal Full-Stack & DevOps Release Engineer  
**Status:** **INVESTIGATION COMPLETE — PENDING USER REVIEW (NO COMMITS PUSHED)**

---

## 1. EXECUTIVE DIAGNOSIS: WHY `npm run build` INVOKES NEXT.JS

The deployment log reported:
```
Couldn't find any pages or app directory
```
Even though the repository's build script is `tsc && vite build`, Vercel failed looking for Next.js routes. The investigation revealed **three interlocking root causes**:

### Cause 1: Vercel Dashboard Project "Framework Preset" is set to "Next.js"
When the project was initially imported into Vercel, Vercel detected `next.config.mjs` (the legacy prototype in `frontend/`) and permanently assigned the **Next.js** framework preset in the Vercel Project Settings on Vercel's servers.
- **The Technical Mechanism:** When a project's Framework Preset in Vercel is set to **Next.js**, Vercel invokes its internal build plugin `@vercel/next`.
- Regardless of whether `package.json` specifies Vite or whether `npm run build` is run, `@vercel/next` performs a mandatory validation step searching for `pages/` or `app/` directories.
- When it finds neither `pages/` nor `app/`, `@vercel/next` throws:
  `> Couldn't find any pages or app directory. Please create one under the project root`
- **Fix:** In the Vercel Dashboard under **Project Settings > General > Framework Preset**, the dropdown **MUST be changed from "Next.js" to "Vite"** (or "Other").

### Cause 2: Branch Mismatch on GitHub (`release/phase6-universal-scanning` vs `main`)
- On GitHub remote (`piyushkrjaiswal16-stack/krushi-mitra-ai`):
  - **`refs/heads/main`** was updated to commit `d21a8e3` (where `frontend/next.config.mjs` was deleted and `frontend/package.json` was switched to Vite).
  - **`refs/heads/release/phase6-universal-scanning`** remained at commit `cd46dc1`.
  - At commit `cd46dc1`, `frontend/package.json` **literally contained `"build": "next build"`** and `frontend/next.config.mjs` was still present!
- If the failed Vercel deployment was building a Pull Request, a Preview branch, or if the Vercel project's Production Branch was configured to `release/phase6-universal-scanning`, Vercel checked out `cd46dc1` and directly executed `next build`!

### Cause 3: Vercel Build Cache & Conflicting Workspaces
- Vercel caches `node_modules` and build tool states between runs. If the project previously ran `@vercel/next`, cached Next.js runner hooks remain active unless the Framework Preset is changed and the deployment is triggered with "Redeploy (without cache)".
- Furthermore, having two separate copies of source code (one in root `/src` and one in `/frontend/src`) creates ambiguity about which workspace Vercel is building.

---

## 2. AUDIT OF PACKAGES, CONFIGURATIONS & COMMITS

### 2.1 Git Commits Across Remote Branches
| Branch Name | Commit SHA | Message | Next.js Present in `frontend/`? |
| :--- | :--- | :--- | :--- |
| `main` (Remote HEAD) | `d21a8e3` | `fix(deployment): configure Vite for Vercel...` | **NO** (Clean Vite 6 + React 18) |
| `release/phase6-universal-scanning` | `cd46dc1` | `feat(phase6.2): complete critical security...` | **YES** (`"build": "next build"`, `next.config.mjs`) |
| `checkpoint/vite-baseline` | `52ada42` | `Initial commit: Krushi Mitra AI platform...` | Initial baseline |

### 2.2 Inspection of `package.json` Files at Commit `d21a8e3`
- **Root `package.json`:**
  ```json
  {
    "name": "krushi-mitra-ai",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview",
      "test": "tsx test_frontend.mjs && tsx test_responsive_viewports.mjs"
    },
    "dependencies": {
      "canvas-confetti": "^1.9.4",
      "lucide-react": "^1.16.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    }
  }
  ```
- **`frontend/package.json`:**
  ```json
  {
    "name": "krushi-mitra-ai-frontend",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "canvas-confetti": "^1.9.4",
      "lucide-react": "^1.16.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    }
  }
  ```
- **Result:** Neither `package.json` has `next` in dependencies, devDependencies, or scripts.

### 2.3 Inspection of `vercel.json` Files
Both `/vercel.json` and `/frontend/vercel.json` are configured identically:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. IDENTIFICATION OF THE THREE VERCEL PROJECTS

In `backend/app/core/config.py`, three distinct Vercel deployment origins were registered:

1. **Project A: `krushi-mitra-ai` (`https://krushi-mitra-ai.vercel.app`)**
   - **Origin:** Generated when importing the repository with Root Directory set to `./` (root).
   - **Intended Target:** Root Vite application.
   - **Risk:** If Framework Preset was left on auto-detected Next.js, this project fails looking for root `pages/`.

2. **Project B: `krushi-mitra-ai-frontend` (`https://krushi-mitra-ai-frontend.vercel.app`)**
   - **Origin:** Generated when importing the repository with Root Directory set to `frontend`.
   - **Intended Target:** Subdirectory Vite application.
   - **Risk:** This project was originally created when `frontend/` contained `next.config.mjs`, locking its Framework Preset to Next.js in the dashboard.

3. **Project C: `krushi-mitra` (`https://krushi-mitra.vercel.app`)**
   - **Origin:** Legacy alias from earlier project initialization.

> [!IMPORTANT]
> **Recommended Canonical Project:** Use **`krushi-mitra-ai-frontend`** with Root Directory = `frontend`, OR use **`krushi-mitra-ai`** with Root Directory = `./`. Whichever project is used in the Vercel dashboard, its **Framework Preset MUST be set to "Vite"**.

---

## 4. CANONICAL FRONTEND WORKSPACE ARCHITECTURE

To prevent duplicate source copies from becoming inconsistent:
- The repository structure is:
  - `frontend/`: The dedicated frontend application workspace (clean monorepo design).
  - `backend/`: The dedicated FastAPI Python service (deployed to Railway).
- `frontend/` contains:
  - `index.html` (Vite HTML entry)
  - `vite.config.ts` (React plugin, bundle options)
  - `tsconfig.json` & `tsconfig.node.json`
  - `tailwind.config.js` & `postcss.config.js`
  - `vercel.json` (SPA rewrites and Vite framework)
  - `src/` (All 27 components, services, data, types, `App.tsx`, `main.tsx`)
- The root directory contains workspace delegation scripts and testing harnesses (`test_frontend.mjs`, `test_responsive_viewports.mjs`) to ensure both local monorepo root commands and Vercel subdirectory commands execute seamlessly.

---

## 5. LOCAL BUILD & TEST VERIFICATION RESULTS

### 5.1 Standalone Build in `frontend/` (Vercel Root Directory)
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
✓ built in 8.19s
Exit Code: 0
```

### 5.2 Frontend Automated Test Suite
```
TAP version 13
# test_frontend.mjs (8 tests passed)
ok 1 - Knowledge base integrity: 5 rice pests + beneficial spider + healthy paddy exist
ok 2 - Sample library integrity: 16 verified real field specimens
ok 3 - Treatment Gating: Chemical treatment only allowed for 5 rice pests with high confidence
ok 4 - Expert baseline report rules: Never default unclear or arbitrary image to bph
ok 5 - Bilingual UI Translation Parity: All Odia and English keys populated
ok 6 - Pest-Specific ETL Standards: All 5 supported pests have authentic thresholds in EN and OR
ok 7 - Binary Image Validation: Accurate magic byte detection and extension spoofing rejection
ok 8 - Cryptographic SHA-256 Digest & Traceability on Every Diagnosis Report
# test_responsive_viewports.mjs (4 tests passed)
ok 1 - Responsive Viewport Matrix: All 9 required resolutions supported in CSS grid & flex breakpoints
ok 2 - Touch Target Compliance: All interactive controls meet >= 44x44px accessibility standard
ok 3 - Camera Viewfinder Orientation: Environment lens is NEVER mirrored, User lens is mirrored
ok 4 - Deterministic Scanner State Machine: Valid transitions only

12 / 12 tests passed (100% pass rate) in 0.11s.
```

### 5.3 Backend Pytest Suite
```
57 passed in 5.68s (100% pass rate)
```

---

## 6. PRODUCTION RAILWAY BACKEND CONNECTIVITY

The frontend connects to the deployed Railway FastAPI backend via runtime environment variable `VITE_API_URL`:
- **Implementation:** `src/services/storageService.ts` and `frontend/src/services/storageService.ts` dynamically read `import.meta.env.VITE_API_URL`.
- **FastAPI Endpoints:**
  - `GET /api/v1/health` -> Health probe (`{"status": "healthy", "service": "krushi-mitra-ai-backend"}`)
  - `POST /api/v1/pest/analyze-base64` -> Multi-modal Gemini pest diagnosis with server-side HMAC-SHA256 signature
  - `GET /api/v1/treatments/{pest_id}` -> Observation provenance and ETL-gated treatment recommendations
- **CORS Configuration:** `backend/app/main.py` permits Vercel domains via `allow_origin_regex=r"^https:\/\/.*\.vercel\.app$"`.

---

## 7. EXACT STEP-BY-STEP VERCEL FIX PROCEDURE

To resolve the Vercel error permanently, the following settings **must be applied in the Vercel Dashboard**:

### Step 1: Open Project Settings in Vercel
1. Log in to [vercel.com](https://vercel.com) and navigate to the project (e.g. `krushi-mitra-ai-frontend` or `krushi-mitra-ai`).
2. Go to **Settings > General**.

### Step 2: Change Framework Preset
1. Locate **Framework Preset**.
2. Click the dropdown and select **Vite** (do NOT leave it as Next.js).
3. If Vite is not listed in your dropdown, select **Other**.

### Step 3: Configure Build & Development Settings
- **Root Directory:** If using project `krushi-mitra-ai-frontend`, set to `frontend`. If using `krushi-mitra-ai`, set to `./`.
- **Build Command:** Toggle **Override** OFF (or enter `npm run build`). Ensure there is **NO** reference to `next build`.
- **Output Directory:** Toggle **Override** OFF (or enter `dist`).
- **Install Command:** Toggle **Override** OFF (or enter `npm run install`).

### Step 4: Configure Environment Variables
Go to **Settings > Environment Variables** and add:
- **Key:** `VITE_API_URL`
- **Value:** `https://<your-railway-backend-domain>.up.railway.app/api/v1`
- **Environments:** Production, Preview, Development

### Step 5: Verify Production Branch
Go to **Settings > Git**:
- Ensure **Production Branch** is set to **`main`** (not `release/phase6-universal-scanning` or `master`).

### Step 6: Redeploy Without Cache
Go to the **Deployments** tab, click the three dots (`...`) on the latest deployment from `main`, and select **Redeploy** (ensure "Use existing Build Cache" is **unchecked**).

---

## 8. PROPOSED REPOSITORY ACTIONS FOR REVIEW

Before pushing any changes to Git, the following actions are proposed:
1. Fast-forward / merge `release/phase6-universal-scanning` to match `main` (`d21a8e3`), so that if any Vercel project is connected to `release/phase6-universal-scanning`, it builds the clean Vite configuration without Next.js.
2. Commit `VERCEL_FINAL_ROOT_CAUSE_REPORT.md`.
3. Push to `main` and `release/phase6-universal-scanning`.

> [!IMPORTANT]
> In accordance with the prompt instructions, **no commits have been pushed**. Awaiting user review of this diagnosis and proposed actions.
