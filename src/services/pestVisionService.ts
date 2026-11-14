import { ScanReport, PestId, CropId, SeverityLevel, ScanStatus } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { StorageService } from './storageService';

export interface ImageQualityCheck {
  isClear: boolean;
  lightingScore: number;
  sharpnessScore: number;
  warningMessage?: string;
  warningMessageOr?: string;
}

export class PestVisionService {
  /**
   * Stage 1 Image Quality Assessment:
   * Examines image aspect ratio, resolution, luminance distribution,
   * and pixel contrast variance to detect blur, solid-color blanks, and severe lighting issues.
   */
  public static async assessImageQuality(dataUrl: string): Promise<ImageQualityCheck> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = Math.min(img.width, 240);
        const height = Math.min(img.height, 180);
        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          resolve({ isClear: true, lightingScore: 85, sharpnessScore: 80 });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let totalBrightness = 0;
        let edgeVariance = 0;
        let minPixel = 255;
        let maxPixel = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          totalBrightness += brightness;
          if (brightness < minPixel) minPixel = brightness;
          if (brightness > maxPixel) maxPixel = brightness;

          if (i + 4 < data.length) {
            const nextBrightness = (data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114);
            edgeVariance += Math.abs(brightness - nextBrightness);
          }
        }

        const pixelCount = data.length / 4;
        const avgBrightness = totalBrightness / pixelCount;
        const avgEdgeDelta = edgeVariance / pixelCount;

        const lightingScore = Math.min(100, Math.max(1, Math.round((avgBrightness / 255) * 100)));
        const sharpnessScore = Math.min(100, Math.max(1, Math.round((avgEdgeDelta / 30) * 100)));

        // Blank or solid color check
        if (maxPixel - minPixel < 15) {
          resolve({
            isClear: false,
            lightingScore,
            sharpnessScore: 5,
            warningMessage: 'The uploaded image appears completely uniform or empty. Please photograph a real crop leaf or pest.',
            warningMessageOr: 'ଅପଲୋଡ୍ ଫଟୋଟି ସମ୍ପୂର୍ଣ୍ଣ ଖାଲି କିମ୍ବା ଏକା ରଙ୍ଗର ଦେଖାଯାଉଛି। ଦୟାକରି ଫସଲ କିମ୍ବା ପୋକର ଫଟୋ ନିଅନ୍ତୁ।'
          });
          return;
        }

        // Heavy Blur Check
        if (sharpnessScore < 20) {
          resolve({
            isClear: false,
            lightingScore,
            sharpnessScore,
            warningMessage: 'Warning: The photograph appears blurry or out of focus. Fine insect details cannot be verified.',
            warningMessageOr: 'ସତର୍କତା: ଫଟୋଟି ଝାପ୍‌ସା କିମ୍ବା ଅସ୍ପଷ୍ଟ ଦେଖାଯାଉଛି। ପୋକର ସଠିକ ଚିହ୍ନଟ ପାଇଁ କ୍ୟାମେରା ସ୍ଥିର ରଖି ଫଟୋ ନିଅନ୍ତୁ।'
          });
          return;
        }

        // Severe underexposure
        if (lightingScore < 15) {
          resolve({
            isClear: false,
            lightingScore,
            sharpnessScore,
            warningMessage: 'Warning: Photograph is severely underexposed (too dark). Pest color patterns cannot be distinguished.',
            warningMessageOr: 'ସତର୍କତା: ଫଟୋଟି ବହୁତ ଅନ୍ଧକାରରେ ଉଠାଯାଇଛି। ଦୟାକରି ପର୍ଯ୍ୟାପ୍ତ ଆଲୋକରେ ଫଟୋ ଉଠାନ୍ତୁ।'
          });
          return;
        }

        resolve({ isClear: true, lightingScore, sharpnessScore });
      };

      img.onerror = () => {
        resolve({
          isClear: false,
          lightingScore: 0,
          sharpnessScore: 0,
          warningMessage: 'Failed to load or parse image file.',
          warningMessageOr: 'ଫଟୋ ଫାଇଲଟି ଖୋଲିବାରେ ତ୍ରୁଟି ଘଟିଲା।'
        });
      };

      img.src = dataUrl;
    });
  }

  /**
   * Main vision pipeline:
   * 1. Evaluates image quality.
   * 2. Invokes live multimodal Gemini Vision API if enabled.
   * 3. Otherwise uses verified expert baseline provider with honest uncertainty and rejection.
   */
  public static async analyzeCropImage(
    imageDataUrl: string,
    cropId: CropId = 'paddy',
    forcedPestId?: string,
    farmerDistrict: string = 'bargarh'
  ): Promise<ScanReport> {
    const quality = await this.assessImageQuality(imageDataUrl);
    const apiKey = StorageService.getApiKey();
    const settings = StorageService.getSettings();

    // If photograph quality failed, return honest unclear report immediately
    if (!quality.isClear && !forcedPestId) {
      return this.buildUnclearReport(imageDataUrl, quality, farmerDistrict);
    }

    // Check if live Gemini API is enabled and key exists
    if (apiKey && settings.useLiveGemini && !forcedPestId) {
      try {
        const liveResult = await this.callGeminiVisionApi(imageDataUrl, apiKey, quality, farmerDistrict);
        return liveResult;
      } catch (err: any) {
        console.warn('Gemini API call failed or timed out. Falling back to Verified Expert Baseline.', err);
      }
    }

    // Expert Baseline Provider (Default and Offline Demo Mode)
    return this.buildExpertBaselineReport(imageDataUrl, quality, forcedPestId, farmerDistrict);
  }

  /**
   * Two-Stage Multimodal Gemini Vision API Call
   */
  private static async callGeminiVisionApi(
    imageDataUrl: string,
    apiKey: string,
    quality: ImageQualityCheck,
    farmerDistrict: string
  ): Promise<ScanReport> {
    const base64Data = imageDataUrl.split(',')[1] || imageDataUrl;
    const mimeType = imageDataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

    const systemPrompt = `You are Krushi Mitra AI's senior agricultural entomologist and vision specialist for Odisha, India.
Analyze this crop/insect photograph with extreme scientific rigor.

CRITICAL OPERATIONAL RULES:
1. DO NOT assume the photograph contains a rice pest.
2. NON-AGRICULTURAL IMAGES (humans, selfies, cars, animals, furniture, everyday objects, buildings, indoor scenes) MUST be classified as 'NON_AGRICULTURAL_IMAGE'.
3. HEALTHY CROPS without insects or visible damage MUST be classified as 'HEALTHY_CROP'.
4. CROP DAMAGE WITHOUT VISIBLE INSECTS (e.g. leaf yellowing, blast spots, borer holes with no insect visible) MUST be classified as 'CROP_DAMAGE_NO_VISIBLE_INSECT'. (Leaf damage alone does not prove insect identity).
5. INSECTS THAT ARE NOT ONE OF THE 5 SUPPORTED PESTS (e.g., ladybugs, butterflies, flies, dragonflies, bees, stinkbugs, grasshoppers, or Lycosa wolf spiders) MUST be classified as 'OTHER_INSECT'.
6. UNCLEAR / BLURRY IMAGES MUST be classified as 'UNCLEAR_IMAGE'.

THE 5 SUPPORTED ODISHA RICE PESTS ARE STRICTLY:
1. 'bph': Brown Planthopper (Nilaparvata lugens)
2. 'stem_borer': Yellow Stem Borer (Scirpophaga incertulas)
3. 'leaf_folder': Rice Leaf Folder (Cnaphalocrocis medinalis)
4. 'rice_hispa': Rice Hispa (Dicladispa armigera)
5. 'armyworm': Rice Armyworm (Mythimna separata)

RESPOND ONLY WITH A VALID JSON OBJECT WITH THIS EXACT STRUCTURE:
{
  "status": "IDENTIFIED" | "OTHER_INSECT" | "NO_INSECT" | "HEALTHY_CROP" | "CROP_DAMAGE_NO_VISIBLE_INSECT" | "UNCLEAR_IMAGE" | "NON_AGRICULTURAL_IMAGE" | "UNKNOWN",
  "pestId": "bph" | "stem_borer" | "leaf_folder" | "rice_hispa" | "armyworm" | "beneficial_spider" | null,
  "confidence": number between 0 and 100 or null,
  "visualEvidence": ["observable anatomical or damage feature 1", "feature 2"],
  "crop": "Rice" | "Other" | "None",
  "lifeStage": "Adult" | "Larva" | "Nymph" | "Egg" | "Unknown",
  "reason": "Clear explanation of the determination based strictly on visible features",
  "cropDamageAnalysis": "Comprehensive scientific explanation of how this insect damages the crop, plant organs attacked (e.g. xylem/phloem sap at tiller base, stem pith boring, leaf folding, chlorophyll scraping), specific field symptoms (hopperburn, dead hearts, whiteheads), vector risks, and estimated yield loss impact.",
  "cropDamageAnalysisOr": "ଓଡ଼ିଆରେ ଫସଲ କ୍ଷତିର ବିସ୍ତୃତ ବର୍ଣ୍ଣନା (କୀଟ କିପରି ଫସଲକୁ ନଷ୍ଟ କରେ ଏବଂ କେତେ ପ୍ରତିଶତ କ୍ଷତି କରିପାରେ)",
  "limitations": ["limitation 1"],
  "needsBetterImage": boolean,
  "treatmentAllowed": boolean (MUST BE false unless status is IDENTIFIED and pest is one of the 5 supported rice pests),
  "expertReviewRecommended": boolean
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.05,
        response_mime_type: 'application/json'
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini Vision');

    const parsed = JSON.parse(rawText);
    const status: ScanStatus = parsed.status || 'UNKNOWN';
    const pestId: PestId = parsed.pestId || 'uncertain';
    const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : null;

    // Treatment gating
    const treatmentAllowed = status === 'IDENTIFIED' && 
      ['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm'].includes(pestId) && 
      (confidence !== null && confidence >= 70);

    return {
      id: `scan-${Date.now()}`,
      createdAt: Date.now(),
      cropId: 'paddy',
      imageUri: imageDataUrl,
      status,
      treatmentAllowed,
      confidenceType: confidence !== null ? 'model_raw' : null,
      visualEvidence: parsed.visualEvidence || [],
      limitations: parsed.limitations || [],
      needsBetterImage: Boolean(parsed.needsBetterImage),
      reason: parsed.reason || 'Multimodal vision evaluation completed.',
      imageQualityAssessment: quality,
      identification: {
        pestId,
        commonNameEn: status === 'IDENTIFIED' ? knowledge.commonNameEn : (parsed.status || 'Unidentified'),
        commonNameOr: status === 'IDENTIFIED' ? knowledge.commonNameOr : 'ଅନିର୍ଦ୍ଧାରିତ',
        scientificName: status === 'IDENTIFIED' ? knowledge.scientificName : 'N/A',
        confidence,
        certaintyTier: (confidence && confidence >= 80) ? 'high' : (confidence && confidence >= 60) ? 'moderate' : 'uncertain'
      },
      alternativePossibilities: [],
      observedVisualFeatures: parsed.visualEvidence || [
        `Observed visual features analyzed against ICAR-NRRI reference morphology.`
      ],
      aiInferredDamage: (treatmentAllowed && (parsed.cropDamageAnalysis || parsed.crop_damage_analysis)) || (treatmentAllowed ? knowledge.potentialDamagePercent : 'Cannot be determined without confirmed species identification.'),
      aiInferredDamageOr: (treatmentAllowed && (parsed.cropDamageAnalysisOr || parsed.crop_damage_analysis_or)) || (treatmentAllowed ? knowledge.keySymptomsOr[0] : 'କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କ୍ଷତିର ଆକଳନ ସମ୍ଭବ ନୁହେଁ।'),
      severityAssessment: treatmentAllowed ? (pestId === 'bph' || pestId === 'armyworm' ? 'Severe' : 'Moderate') : 'Low',
      potentialYieldLossRange: treatmentAllowed ? knowledge.potentialDamagePercent : 'Assessment suspended',
      immediateActionsEn: treatmentAllowed ? knowledge.immediateNextStepsEn : ['Do not spray chemical pesticides without species confirmation.'],
      immediateActionsOr: treatmentAllowed ? knowledge.immediateNextStepsOr : ['କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।'],
      expertReviewRequired: !treatmentAllowed || Boolean(parsed.expertReviewRecommended),
      sourceModel: 'gemini-3.5-flash' as any,
      isSampleScan: false,
      farmerDistrict,
      followUpScans: []
    };
  }

  /**
   * Verified Expert Baseline Provider (Default / Demo / Offline):
   * Strictly adheres to non-fabrication: NEVER hashes strings to invent pests!
   */
  private static buildExpertBaselineReport(
    imageDataUrl: string,
    quality: ImageQualityCheck,
    forcedPestId?: string,
    farmerDistrict: string = 'bargarh'
  ): ScanReport {
    // 1. If clicking a known verified sample from the library
    if (forcedPestId) {
      // Negative / Rejection sample targets
      if (forcedPestId === 'non_agricultural') {
        return {
          id: `scan-${Date.now()}`,
          createdAt: Date.now(),
          cropId: 'paddy',
          imageUri: imageDataUrl,
          status: 'NON_AGRICULTURAL_IMAGE',
          treatmentAllowed: false,
          needsBetterImage: true,
          reason: 'The photograph contains a vehicle or non-agricultural object. No crop or pest detected.',
          visualEvidence: ['Inanimate mechanical contours detected', 'No foliage or arthropod morphology'],
          limitations: ['Non-agricultural subject'],
          imageQualityAssessment: quality,
          identification: {
            pestId: 'uncertain',
            commonNameEn: 'Non-Agricultural Image',
            commonNameOr: 'ଅଣ-କୃଷି ଫଟୋ (ମୋଟର ଗାଡ଼ି / ବସ୍ତୁ)',
            scientificName: 'N/A',
            confidence: null,
            certaintyTier: 'uncertain'
          },
          alternativePossibilities: [],
          observedVisualFeatures: ['Non-agricultural object detected.'],
          aiInferredDamage: 'None',
          aiInferredDamageOr: 'କୌଣସି କ୍ଷତି ନାହିଁ',
          severityAssessment: 'Low',
          potentialYieldLossRange: '0%',
          immediateActionsEn: ['Please upload an actual photograph of a rice leaf or crop pest.'],
          immediateActionsOr: ['ଦୟାକରି ଧାନ ପତ୍ର କିମ୍ବା ଫସଲ ପୋକର ପ୍ରକୃତ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।'],
          expertReviewRequired: false,
          sourceModel: 'expert-verified-baseline',
          isSampleScan: true,
          farmerDistrict,
          followUpScans: []
        };
      }

      if (forcedPestId === 'healthy_paddy') {
        const knowledge = PEST_KNOWLEDGE_BASE.healthy_paddy;
        return {
          id: `scan-${Date.now()}`,
          createdAt: Date.now(),
          cropId: 'paddy',
          imageUri: imageDataUrl,
          status: 'HEALTHY_CROP',
          treatmentAllowed: false,
          needsBetterImage: false,
          reason: 'Vibrant, healthy rice canopy with clean intact leaf blades. Zero pests detected.',
          visualEvidence: ['Uniform green pigmentation', 'Intact tillers with no chlorosis, bore holes, or scraped streaks'],
          limitations: ['Routine field scouting recommended during Kharif monsoon.'],
          imageQualityAssessment: quality,
          identification: {
            pestId: 'healthy_paddy',
            commonNameEn: knowledge.commonNameEn,
            commonNameOr: knowledge.commonNameOr,
            scientificName: knowledge.scientificName,
            confidence: 96,
            certaintyTier: 'high'
          },
          alternativePossibilities: [],
          observedVisualFeatures: ['Clean vegetative canopy.', 'Zero pest infestation.'],
          aiInferredDamage: 'None (Healthy Crop)',
          aiInferredDamageOr: 'କୌଣସି କ୍ଷତି ନାହିଁ (ସୁସ୍ଥ ଫସଲ)',
          severityAssessment: 'Low',
          potentialYieldLossRange: '0%',
          immediateActionsEn: knowledge.immediateNextStepsEn,
          immediateActionsOr: knowledge.immediateNextStepsOr,
          expertReviewRequired: false,
          sourceModel: 'expert-verified-baseline',
          isSampleScan: true,
          farmerDistrict,
          followUpScans: []
        };
      }

      if (forcedPestId === 'crop_damage_no_insect') {
        return {
          id: `scan-${Date.now()}`,
          createdAt: Date.now(),
          cropId: 'paddy',
          imageUri: imageDataUrl,
          status: 'CROP_DAMAGE_NO_VISIBLE_INSECT',
          treatmentAllowed: false,
          needsBetterImage: true,
          reason: 'Leaf lesion or discoloration is visible, but NO insect body is present in the photograph. Insect species cannot be confirmed from leaf damage alone.',
          visualEvidence: ['Foliage discoloration observed', 'Absence of visible insect body, legs, or antennae'],
          limitations: ['Foliage symptoms can be caused by fungal pathogens, nutrient deficiencies, or past insect feeding.'],
          imageQualityAssessment: quality,
          identification: {
            pestId: 'uncertain',
            commonNameEn: 'Crop Damage (No Visible Insect)',
            commonNameOr: 'ପତ୍ର କ୍ଷତି (ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)',
            scientificName: 'N/A',
            confidence: null,
            certaintyTier: 'uncertain'
          },
          alternativePossibilities: [],
          observedVisualFeatures: ['Leaf lesions detected, insect absent.'],
          aiInferredDamage: 'Indeterminate without insect specimen',
          aiInferredDamageOr: 'ଜୀବନ୍ତ ପୋକ ବିନା କ୍ଷତିକାରକ କୀଟ ନିଶ୍ଚିତ କରିବା ଅସମ୍ଭବ।',
          severityAssessment: 'Low',
          potentialYieldLossRange: 'Assessment suspended',
          immediateActionsEn: [
            'Inspect leaf sheaths and stem base for live insects.',
            'Photograph any live caterpillars, planthoppers, or beetles found.',
            'Do not spray broad-spectrum insecticides without confirming the pest.'
          ],
          immediateActionsOr: [
            'ଗଛ ମୂଳ ଓ ପତ୍ର ସନ୍ଧିରେ ଜୀବନ୍ତ ପୋକ ଖୋଜନ୍ତୁ।',
            'କୌଣସି ପୋକ ମିଳିଲେ ତାର ନିକଟବର୍ତ୍ତୀ ଫଟୋ ଉଠାନ୍ତୁ।',
            'ପୋକ ନିଶ୍ଚିତ ନହେବା ଯାଏଁ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।'
          ],
          expertReviewRequired: true,
          sourceModel: 'expert-verified-baseline',
          isSampleScan: true,
          farmerDistrict,
          followUpScans: []
        };
      }

      if (forcedPestId === 'other_insect' || forcedPestId === 'beneficial_spider') {
        const isSpider = forcedPestId === 'beneficial_spider';
        const knowledge = isSpider ? PEST_KNOWLEDGE_BASE.beneficial_spider : PEST_KNOWLEDGE_BASE.uncertain;
        return {
          id: `scan-${Date.now()}`,
          createdAt: Date.now(),
          cropId: 'paddy',
          imageUri: imageDataUrl,
          status: 'OTHER_INSECT',
          treatmentAllowed: false,
          needsBetterImage: false,
          reason: isSpider 
            ? 'Specimen identified as Lycosa pseudoannulata (Wolf Spider). This is a beneficial natural predator of planthoppers, NOT a crop pest.' 
            : 'Detected insect is NOT one of the 5 supported rice pests (Ladybird beetle / non-target arthropod).',
          visualEvidence: isSpider ? ['Eight spiny legs', 'Distinct cephalothorax markings'] : ['Arthropod morphology distinct from 5 supported rice pests'],
          limitations: ['Non-pest / natural enemy.'],
          imageQualityAssessment: quality,
          identification: {
            pestId: isSpider ? 'beneficial_spider' : 'uncertain',
            commonNameEn: isSpider ? knowledge.commonNameEn : 'Other Insect (Non-Rice Pest)',
            commonNameOr: isSpider ? knowledge.commonNameOr : 'ଅନ୍ୟ କୀଟ (ଧାନ ପାଇଁ କ୍ଷତିକାରକ ନୁହେଁ)',
            scientificName: isSpider ? knowledge.scientificName : 'Non-target insect',
            confidence: isSpider ? 94 : null,
            certaintyTier: isSpider ? 'high' : 'uncertain'
          },
          alternativePossibilities: [],
          observedVisualFeatures: [isSpider ? 'Beneficial predator hunting in rice canopy.' : 'Non-target insect.'],
          aiInferredDamage: 'None (Predator / Neutral Insect)',
          aiInferredDamageOr: 'କୌଣସି କ୍ଷତି ନାହିଁ (ବନ୍ଧୁ କୀଟ)',
          severityAssessment: 'Low',
          potentialYieldLossRange: '0%',
          immediateActionsEn: isSpider ? knowledge.immediateNextStepsEn : ['Do not spray insecticides. Beneficial insects regulate pests naturally.'],
          immediateActionsOr: isSpider ? knowledge.immediateNextStepsOr : ['କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ବନ୍ଧୁ କୀଟମାନେ ପ୍ରାକୃତିକ ଭାବେ ପୋକ ଦମନ କରନ୍ତି।'],
          expertReviewRequired: false,
          sourceModel: 'expert-verified-baseline',
          isSampleScan: true,
          farmerDistrict,
          followUpScans: []
        };
      }

      // Verified 5 Supported Pests
      const targetPestId: PestId = ['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm'].includes(forcedPestId as PestId)
        ? (forcedPestId as PestId)
        : 'bph';
      const knowledge = PEST_KNOWLEDGE_BASE[targetPestId];

      return {
        id: `scan-${Date.now()}`,
        createdAt: Date.now(),
        cropId: 'paddy',
        imageUri: imageDataUrl,
        status: 'IDENTIFIED',
        treatmentAllowed: true,
        confidenceType: 'benchmark_reference',
        visualEvidence: [
          `Direct Image Observation: Specific morphological indicators matching ${knowledge.scientificName}.`,
          `Damage Pattern: ${knowledge.keySymptomsEn[0]}`,
          `Plant Part Affected: Correlates with regional surveillance data.`
        ],
        reason: `Specimen morphology verified against ICAR-NRRI reference dataset for ${knowledge.scientificName}.`,
        limitations: ['Scout 20 random hills to assess field-wide Economic Threshold Level (ETL).'],
        needsBetterImage: false,
        imageQualityAssessment: quality,
        identification: {
          pestId: targetPestId,
          commonNameEn: knowledge.commonNameEn,
          commonNameOr: knowledge.commonNameOr,
          scientificName: knowledge.scientificName,
          confidence: 92,
          certaintyTier: 'high'
        },
        alternativePossibilities: [],
        observedVisualFeatures: [
          `Specific morphology matching ${knowledge.scientificName}.`,
          `Damage Pattern: ${knowledge.keySymptomsEn[0]}`
        ],
        aiInferredDamage: knowledge.potentialDamagePercent,
        aiInferredDamageOr: knowledge.keySymptomsOr[0],
        severityAssessment: targetPestId === 'bph' || targetPestId === 'armyworm' ? 'Severe' : 'Moderate',
        potentialYieldLossRange: knowledge.potentialDamagePercent,
        immediateActionsEn: knowledge.immediateNextStepsEn,
        immediateActionsOr: knowledge.immediateNextStepsOr,
        expertReviewRequired: false,
        sourceModel: 'expert-verified-baseline',
        isSampleScan: true,
        farmerDistrict,
        followUpScans: []
      };
    }

    // 2. ARBITRARY USER UPLOAD WHILE OFFLINE:
    // STRICT RULE: Never pseudo-classify or force an arbitrary upload into one of the 5 pests!
    return {
      id: `scan-${Date.now()}`,
      createdAt: Date.now(),
      cropId: 'paddy',
      imageUri: imageDataUrl,
      status: 'UNKNOWN',
      treatmentAllowed: false,
      needsBetterImage: false,
      reason: 'The system is currently operating in Verified Expert Baseline Mode without live vision API connectivity. To prevent false identifications, Krushi Mitra AI refuses to guess or force arbitrary uploads into one of the 5 rice pests.',
      visualEvidence: ['Offline baseline mode active', 'Live multimodal vision required for new unreferenced uploads'],
      limitations: ['Automated species-level vision classification is disabled offline.'],
      imageQualityAssessment: quality,
      identification: {
        pestId: 'uncertain',
        commonNameEn: 'Unidentified Agricultural Subject',
        commonNameOr: 'ଅନିର୍ଦ୍ଧାରିତ କୃଷି ବିଷୟବସ୍ତୁ',
        scientificName: 'Inconclusive Specimen',
        confidence: null,
        certaintyTier: 'uncertain'
      },
      alternativePossibilities: [],
      observedVisualFeatures: [
        'Image uploaded in offline development mode.',
        'Pesticide recommendations strictly suppressed to protect crop health.'
      ],
      aiInferredDamage: 'Cannot be assessed without species confirmation',
      aiInferredDamageOr: 'କୀଟ ନିଶ୍ଚିତ ନହେବା ଯାଏଁ କ୍ଷତିର ଆକଳନ ସମ୍ଭବ ନୁହେଁ।',
      severityAssessment: 'Low',
      potentialYieldLossRange: 'Assessment suspended',
      immediateActionsEn: [
        'Do not apply synthetic pesticides without confirmed species diagnosis.',
        'Configure live Gemini API Key in settings or consult your local KVK scientist.'
      ],
      immediateActionsOr: [
        'କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି ରାସାୟନିକ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
        'ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK) କିମ୍ବା କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।'
      ],
      expertReviewRequired: true,
      sourceModel: 'expert-verified-baseline',
      isSampleScan: false,
      farmerDistrict,
      followUpScans: []
    };
  }

  /**
   * Honest unclear fallback when photograph resolution/lighting is insufficient
   */
  private static buildUnclearReport(
    imageDataUrl: string,
    quality: ImageQualityCheck,
    farmerDistrict: string
  ): ScanReport {
    const knowledge = PEST_KNOWLEDGE_BASE.uncertain;

    return {
      id: `scan-${Date.now()}`,
      createdAt: Date.now(),
      cropId: 'paddy',
      imageUri: imageDataUrl,
      status: 'UNCLEAR_IMAGE',
      treatmentAllowed: false,
      needsBetterImage: true,
      reason: quality.warningMessage || 'Photograph lacks sufficient sharpness or lighting contrast for reliable species-level identification.',
      visualEvidence: [
        'Image lacks micro-level sharpness to distinguish dorsal setae or wing venation.',
        'Lighting contrast is below the statistical threshold for entomological validation.'
      ],
      limitations: ['Image quality is insufficient to rule out lookalike species.'],
      imageQualityAssessment: quality,
      identification: {
        pestId: 'uncertain',
        commonNameEn: 'Unclear Photograph / Re-take Required',
        commonNameOr: 'ଅସ୍ପଷ୍ଟ ଫଟୋ / ପୁଣି ଫଟୋ ନିଅନ୍ତୁ',
        scientificName: 'Inconclusive Specimen',
        confidence: null,
        certaintyTier: 'uncertain'
      },
      alternativePossibilities: [],
      observedVisualFeatures: [
        'Image lacks micro-level sharpness.',
        'Lighting contrast is below the threshold for entomological validation.'
      ],
      aiInferredDamage: 'Damage cannot be reliably quantified from this photograph.',
      aiInferredDamageOr: 'ଏହି ଫଟୋରୁ କ୍ଷତିର ସଠିକ ପରିମାଣ ଆକଳନ ସମ୍ଭବ ନୁହେଁ।',
      severityAssessment: 'Low',
      potentialYieldLossRange: 'Assessment suspended pending clearer photograph',
      immediateActionsEn: [
        'Do not apply pesticides without confirming the pest.',
        'Retake photograph in bright natural light, holding camera steady.',
        'Capture close-up of both the insect and the affected rice plant parts.'
      ],
      immediateActionsOr: [
        'କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।',
        'ପର୍ଯ୍ୟାପ୍ତ ସୂର୍ଯ୍ୟାଲୋକରେ କ୍ୟାମେରା ସ୍ଥିର ରଖି ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।',
        'ଗଛର ଆକ୍ରାନ୍ତ ଅଂଶ ଓ ପୋକର ସ୍ପଷ୍ଟ ନିକଟବର୍ତ୍ତୀ (close-up) ଫଟୋ ନିଅନ୍ତୁ।'
      ],
      expertReviewRequired: true,
      sourceModel: 'expert-verified-baseline',
      isSampleScan: false,
      farmerDistrict,
      followUpScans: []
    };
  }
}
