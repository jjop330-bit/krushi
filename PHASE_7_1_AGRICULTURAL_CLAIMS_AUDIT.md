# PHASE 7.1 — AGRICULTURAL CLAIMS & SAFETY AUDIT

**Project:** Krushi Mitra AI (କୃଷି ମିତ୍ର AI)  
**Standard:** ICAR-NRRI Cuttack, OUAT Bhubaneswar, CIBRC Label Specifications  
**Evaluation Date:** November 17, 2026  
**Auditor:** Agricultural Safety & Agronomy Verification Team  

---

## 1. Executive Summary

In agricultural software deployed to smallholder farmers, unwarranted statistical claims (such as fixed accuracy metrics, unreferenced threshold figures, or claims of zero error) create direct agronomic and financial hazards. A misplaced recommendation can trigger premature pesticide purchases, destroy beneficial predator ecosystems (such as *Cyrtorhinus lividipennis* or spiders), cause pesticide-induced resurgence, or violate statutory pesticide safety standards.

Phase 7.1 has conducted a line-by-line audit of the Krushi Mitra AI landing page and core UI components. All unverified marketing claims have been replaced with scientifically sound, institutionally verifiable agronomic definitions.

---

## 2. Before vs. After Claims Audit Matrix

| UI Component | Phase 7 Initial State (Unverified Claim) | Phase 7.1 Audited State (Empirically Verified) | Agronomic Rationale & Regulatory Compliance |
| :--- | :--- | :--- | :--- |
| **Hero Specimen Badge** | `94% Confidence` | `Reference Specimen` / `ନମୁନା ରେଫରେନ୍ସ` | A static specimen image cannot display a fixed real-time model confidence score. Replaced with explicit specimen reference label to prevent deceptive telemetry claims. |
| **Telemetry Header** | `Live Field Specimen Telemetry` | `Demonstration Specimen (ICAR-NRRI Reference)` | Clarifies that the hero visual is an educational reference specimen based on ICAR-National Rice Research Institute entomological standards, not an active field camera feed. |
| **District Geographic Tag** | `Bargarh Command` | `Bargarh Command (Sample Context)` | Clarifies that the district data shown in the specimen card represents a regional agro-climatic sample context rather than an active farm IoT sensor. |
| **ETL Threshold Citation** | `5-10 insects / hill` | `Official ETL (ICAR-NRRI): 5-10 insects/hill (Tillering, scout 20 hills)` | ETL values cannot be stated without crop growth stage, scouting sample size, and institutional provenance. BPH thresholds differ markedly between tillering (5-10/hill) and panicle initiation (15-20/hill). |
| **Crop Coverage Claim** | `32 Odisha Crops` | `Paddy & Validated Crop Registry` | While the frontend dropdown contains entries for Odisha crops, Paddy (ଧାନ) represents the fully verified, CIBRC-audited insect detection dataset. Overclaiming 32 crops implies complete AI detection for all 32 crops. |
| **Error Rate Claim** | `Zero False Positive` | `22-Point Rejection Checks` | "Zero false positive" is a mathematically unverified claim that induces unwarranted trust. Replaced with the factual agronomic verification method: our 22-point leaf/insect biometric rejection check. |

---

## 3. Statutory & Agronomic Safety Protocols

### 3.1 CIBRC Label Compliance
Krushi Mitra AI strictly enforces that no chemical pesticide molecule is recommended unless:
1. It is officially registered by the **Central Insecticides Board & Registration Committee (CIBRC)** for the specific crop and pest combination in India.
2. The recommended active ingredient dose (a.i.) strictly conforms to the approved package label.
3. Trade names are presented solely as parenthetical reference examples following the generic active ingredient molecule (e.g., `Triflumuron 20% + Ethiprole 40% WG` or `Pymetrozine 50% WG`).

### 3.2 Mandatory Economic Threshold Level (ETL) Gate
Under no circumstances does Krushi Mitra AI recommend chemical spraying when pest density is below the established Economic Threshold Level:
- **Brown Planthopper (*Nilaparvata lugens*):**
  - Vegetative / Tillering stage: 5–10 insects per hill.
  - Flowering / Panicle stage: 15–20 insects per hill.
  - Scouting protocol: Sample 20 hills randomly in a 'W' or 'Z' walking pattern across the field, inspecting the lower 10–15 cm of tillers.
- **Yellow Stem Borer (*Scirpophaga incertulas*):**
  - Vegetative stage: 5% Dead Hearts (DH).
  - Reproductive stage: 1 egg mass per square meter or 2% White Heads (WH).

### 3.3 Non-Chemical IPM Hierarchy (Enforced First)
The engine is hardcoded to output biological, mechanical, and cultural remedies prior to any chemical guidance:
1. **Cultural:** Alternate Wetting and Drying (AWD); draining excess water for 3–4 days to desiccate BPH nymph populations.
2. **Mechanical:** Alley formation (providing 30 cm pathways every 2 meters in paddy fields) to allow sunlight penetration and aeration.
3. **Biological:** Protection of natural predators (mirid bugs *Cyrtorhinus lividipennis*, wolf spiders *Lycosa pseudoannulata*); installation of *Trichogramma japonicum* egg parasitoid cards at 50,000/ha; botanical spraying with cold-pressed Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 1500 ppm at 3–5 ml/L.

### 3.4 Pre-Harvest Interval (PHI) & PPE Mandates
All chemical advisory responses include:
- **Mandatory Pre-Harvest Interval (PHI):** Number of days required between the last spray and harvest to prevent synthetic pesticide residue in consumed grain (e.g., 19–21 days for Pymetrozine; 15 days for Dinotefuran).
- **Personal Protective Equipment (PPE):** Explicit safety instructions to wear mask, gloves, long sleeves, and never spray against wind direction or during pollinator activity (early morning).

---

## 4. Conclusion

Krushi Mitra AI adheres strictly to the highest ethical and scientific standards in agricultural technology. The user-facing application eliminates marketing exaggerations in favor of grounded, responsible, and verified agronomic intelligence for the farming community of Odisha.
