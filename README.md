# Krushi Mitra AI (କୃଷି ମିତ୍ର AI)
> **Detect Early. Understand the Damage. Save the Harvest.**  
> *AI-Powered Agricultural Pest Intelligence Platform for Odisha*  
> **Odisha AI Hackathon 2026**

Krushi Mitra AI is an explainable, mobile-first, bilingual (Odia & English) agricultural pest intelligence platform engineered for paddy farmers in Odisha, India.

---

## 🌟 Key Features

1. **Multimodal AI Pest Scanner:**
   - Real-time vision classification supporting Gallery upload, Camera capture (`JPG`, `JPEG`, `PNG`, `WEBP`).
   - Image quality check assessing lighting and sharpness with honest blur warnings.
   - Pre-loaded with 8 high-fidelity verified field specimens for 1-click evaluation.
   - Supported Rice Pests: Brown Planthopper (*Nilaparvata lugens*), Yellow Stem Borer (*Scirpophaga incertulas*), Rice Leaf Folder (*Cnaphalocrocis medinalis*), Rice Hispa (*Dicladispa armigera*), and Rice Armyworm (*Mythimna separata*).
   - Dedicated Beneficial Predator (*Lycosa* Wolf Spider) and Healthy Crop baseline classification to prevent unnecessary pesticide spraying!

2. **Pest Intelligence & Diagnostic Report:**
   - Common name (English & Odia), verified scientific name, and local Odisha name.
   - Confidence score and certainty tier.
   - Distinct separation of direct image observations vs AI inferences.
   - Potential crop yield damage estimates and symptom analysis.
   - Built-in Web Speech API Odia audio narration button ("ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ").

3. **3-Tier Smart Treatment Recommendation Engine:**
   - **Tier 1: Biological Control:** Natural enemy conservation (*Lycosa* spiders, *Cyrtorhinus* bugs), *Trichogramma* cards, *Beauveria bassiana*, and Neem biopesticides.
   - **Tier 2: Cultural & Mechanical:** Alternate Wetting and Drying (AWD), 30 cm alleyways, morning rope dragging, tip clipping.
   - **Tier 3: Regulated Chemical Control:** CIBRC registered active ingredients (Triflumezopyrim, Pymetrozine, Chlorantraniliprole, Cartap) with strict dosage per acre, water dilution, Pre-Harvest Intervals (PHI in days), and PPE precautions.

4. **Interactive Odia AI Voice Assistant:**
   - Text and voice microphone input.
   - Voice audio playback of replies.
   - Context-aware responses in natural Odia.

5. **District Outbreak Intelligence Map:**
   - Real district metrics across Odisha differentiating AI-suspected, farmer-reported, and expert-confirmed cases.
   - Meteorological pest risk telemetry (BPH risk index based on humidity & temperature).

6. **Post-Treatment Follow-Up Monitoring:**
   - Side-by-side Day 0 vs Day 7 visual comparison.
   - Treatment application logger and inspection reminders.

7. **Agricultural Expert Review Queue:**
   - Dedicated review desk for local Krishi Vigyan Kendra (KVK) and OUAT scientists for escalated uncertain cases.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Development
```bash
cd "C:\Users\Pratyush\.gemini\antigravity\scratch\krushi-mitra-ai"
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Gemini API Configuration
The application runs out of the box in **Verified Expert Baseline Mode** using authentic ICAR-NRRI & OUAT data with zero configuration. To enable live multimodal Gemini Vision analysis:
1. Open the application.
2. Click **Settings** (⚙️) in the top bar.
3. Toggle on **Enable Live Multimodal Gemini API** and enter your Google Gemini API key.
4. Click **Test Connection** and save.

---

## 📄 Scientific Disclaimers
*Krushi Mitra AI is an independent research prototype developed for the Odisha AI Hackathon 2026. It is NOT officially affiliated with ICAR, OUAT, or the Government of Odisha. Farmers must consult local agricultural extension officers or the Kisan Call Centre (Toll-Free: 1800-180-1551) for critical field outbreaks.*
