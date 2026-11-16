# PHASE 6.4 PRODUCTION SMOKE TESTS & VERIFICATION PROTOCOL
**Target URL:** https://krushi-psi.vercel.app/  
**Verification Suite:** Full End-to-End Production Acceptance Test  
**Status:** READY FOR VERIFICATION  
**Date:** November 2026  

---

## 1. Test Execution Runbook

### Test 1: Camera Subsystem Verification (Mobile & Desktop)
1. Navigate to `https://krushi-psi.vercel.app/`.
2. Tap the primary **"Open Live Camera"** (`ଲାଇଭ୍ କ୍ୟାମେରା ଖୋଲନ୍ତୁ`) button.
3. **Verify:**
   - Viewfinder initializes within <500ms without browser lag.
   - Rear camera lens (`facingMode: 'environment'`) activates by default.
   - Orientation is natural (unmirrored).
   - Tap "Switch Lens" (`କ୍ୟାମେରା ବଦଳାନ୍ତୁ`) toggles front/rear seamlessly.
   - Tap "Capture Photo" (`ଫଟୋ ଉଠାନ୍ତୁ`) captures the specimen, delivers haptic vibration, and releases camera hardware tracks immediately.

### Test 2: Universal Odisha Crop Selection (Step 1 & 2)
1. On the scanner screen, inspect the crop selector bar.
2. Select **"Maize"** (`ମକା`), then select plant part **"Stem"** (`🎋 କାଣ୍ଡ / ଗଛ ମୂଳ`).
3. Tap **"All 32 Odisha Crops"** (`ସମସ୍ତ ୩୨ ଫସଲ ଦେଖନ୍ତୁ`).
4. **Verify:**
   - Modal opens with 5 category filter tabs (`Cereals & Millets`, `Pulses`, `Oilseeds`, `Vegetables`, `Fruits & Horticulture`).
   - Search bar filters dynamically by Odia, English, or Scientific name.
   - Selecting a crop updates the badge and diagnostic context across the app.

### Test 3: False-Positive Rejection (Non-Target & Non-Agricultural)
1. Select the instant test sample: **"Non-Agricultural (Motorcycle)"**.
2. Tap **"Run AI Pest Diagnosis"** (`AI କୀଟ ବିଶ୍ଳେଷଣ ଆରମ୍ଭ କରନ୍ତୁ`).
3. **Verify:**
   - Status returns `NON_AGRICULTURAL_IMAGE` (`ଅଣ-କୃଷି ଫଟୋ ପ୍ରତ୍ୟାଖ୍ୟାତ`).
   - System refuses to force a rice/crop pest identification.
   - Chemical pesticide recommendations are strictly withheld (`treatmentAllowed: false`).
4. Select test sample: **"Wolf Spider (Beneficial Natural Enemy)"**.
5. Tap **"Run AI Pest Diagnosis"**.
6. **Verify:**
   - Status returns `OTHER_INSECT` (`ଅଣ-ଲକ୍ଷ୍ୟ / ବନ୍ଧୁ କୀଟ ଚିହ୍ନଟ`).
   - System advises farmer that spiders regulate planthoppers naturally and warns against chemical sprays.

### Test 4: Multi-Crop Diagnostic & IPM Treatment Gating
1. Select crop **"Maize"**, test specimen: **"Fall Armyworm"**.
2. Run diagnosis.
3. **Verify:**
   - Correctly identifies *Spodoptera frugiperda* with Odia name `ଫଲ୍ ଆର୍ମିୱାର୍ମ (ମକା ଲମ୍ଫ ପୋକ)`.
   - Displays distinctive inverted "Y" head suture and 4 abdominal pinacula.
   - 3-tier treatment recommendations present:
     - Biological: *Trichogramma pretiosum* / *Metarhizium rileyi*.
     - Cultural: Whorl sand/ash application, intercropping with cowpea.
     - Regulated Chemical: CIBRC-registered Chlorantraniliprole 18.5% SC (80 ml/acre) with 14-day PHI.

### Test 5: Odia Voice Assistant & TTS Synthesis
1. On the diagnostic report, tap **"Listen in Odia"** (`ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ`).
2. **Verify:**
   - High-quality Odia narration plays with natural pronunciation via Sarvam AI Bulbul v3.
   - Binomial scientific name and local crop name are pronounced accurately.
   - Playback controls (`Pause`, `Resume`, `Replay`, `Stop`) work smoothly.
   - Tapping multiple times cancels prior audio streams without overlap.

### Test 6: Farmer Feedback Escalation
1. On the report card, tap **"Report Wrong Pest"** (`ଭୁଲ ଚିହ୍ନଟ ଜଣାନ୍ତୁ`).
2. Type observation feedback in the modal and tap Submit.
3. **Verify:** Button switches to "Flagged" (`ଅଭିଯୋଗ ଦାଖଲ ହେଲା`) and stores feedback.
