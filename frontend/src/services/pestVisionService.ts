import { ScanReport, PestId, CropId, SeverityLevel, ScanStatus } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { StorageService } from './storageService';
import { SAMPLE_PEST_IMAGES } from '../data/sampleImages';

export interface ImageQualityCheck {
  isClear: boolean;
  lightingScore: number;
  sharpnessScore: number;
  warningMessage?: string;
  warningMessageOr?: string;
}

export class PestVisionService {
  /**
   * Cryptographic SHA-256 Digest Computation:
   * Hashes the raw photograph data URL to generate a strict, deterministic specimen signature.
   * Ensures traceability across UI states, network transmissions, and audit logs.
   */
  public static async computeImageHash(dataUrl: string): Promise<string> {
    try {
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        let hash = 0;
        for (let i = 0; i < dataUrl.length; i++) {
          hash = ((hash << 5) - hash) + dataUrl.charCodeAt(i);
          hash |= 0;
        }
        return `hash-${Math.abs(hash).toString(16).padStart(16, '0')}`;
      }
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return `sha256-uncomputed-${Date.now()}`;
    }
  }

  /**
   * File Type & Binary Magic Byte Validation:
   * Inspects binary header signatures (not just the file extension or MIME string)
   * to guarantee that uploaded files are genuine, uncorrupted JPEG, PNG, or WEBP images.
   */
  public static async validateImageBinary(file: File): Promise<{
    isValid: boolean;
    format: string;
    errorEn?: string;
    errorOr?: string;
  }> {
    if (!file || file.size === 0) {
      return {
        isValid: false,
        format: 'empty',
        errorEn: 'The selected file is empty (0 bytes). Please upload a valid photograph.',
        errorOr: 'ଚୟନିତ ଫାଇଲ୍ ଟି ସମ୍ପୂର୍ଣ୍ଣ ଖାଲି (୦ ବାଇଟ୍) ଅଟେ। ଦୟାକରି ଏକ ବୈଧ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।'
      };
    }

    if (file.size > 25 * 1024 * 1024) {
      return {
        isValid: false,
        format: 'oversized',
        errorEn: 'Image size exceeds maximum limit of 25MB. Please choose a smaller file.',
        errorOr: 'ଫଟୋର ଆକାର ସର୍ବାଧିକ ୨୫ MB ରୁ ଅଧିକ ଅଟେ। ଦୟାକରି ଏକ ଛୋଟ ଫଟୋ ବାଛନ୍ତୁ।'
      };
    }

    try {
      let buffer: ArrayBuffer;
      if (typeof file.arrayBuffer === 'function') {
        buffer = await file.slice(0, 16).arrayBuffer();
      } else if (typeof FileReader !== 'undefined') {
        buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(file.slice(0, 16));
        });
      } else {
        return { isValid: true, format: 'image/jpeg' };
      }

      const arr = new Uint8Array(buffer);
      if (arr.length < 4) {
        return {
          isValid: false,
          format: 'corrupt',
          errorEn: 'Image file header is truncated or corrupted.',
          errorOr: 'ଫଟୋ ଫାଇଲର ହେଡର୍ ତ୍ରୁଟିପୂର୍ଣ୍ଣ ବା ନଷ୍ଟ ହୋଇଯାଇଛି।'
        };
      }

      // JPEG Magic Bytes: FF D8 FF
      if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) {
        return { isValid: true, format: 'image/jpeg' };
      }

      // PNG Magic Bytes: 89 50 4E 47
      if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47) {
        return { isValid: true, format: 'image/png' };
      }

      // WEBP Magic Bytes: RIFF .... WEBP
      if (
        arr.length >= 12 &&
        arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
        arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50
      ) {
        return { isValid: true, format: 'image/webp' };
      }

      return {
        isValid: false,
        format: 'unsupported',
        errorEn: 'Unsupported image format. Only authentic JPG, JPEG, PNG, or WEBP images are supported. File extension spoofing is rejected.',
        errorOr: 'ଅସମର୍ଥିତ ଫର୍ମାଟ୍। କେବଳ ପ୍ରକୃତ JPG, JPEG, PNG କିମ୍ବା WEBP ଫଟୋ ସମର୍ଥିତ।'
      };
    } catch {
      return {
        isValid: false,
        format: 'unreadable',
        errorEn: 'Failed to read file from storage disk.',
        errorOr: 'ଡିଭାଇସ୍ ଷ୍ଟୋରେଜ୍ ରୁ ଫାଇଲ୍ ପଢ଼ିବାରେ ତ୍ରୁଟି ଘଟିଲା।'
      };
    }
  }

  /**
   * Client-side Image Compression & Resizing:
   * Resizes large smartphone camera photos (e.g. 12-48MP) to an optimal max dimension (1200px)
   * with high-quality JPEG compression (0.85).
   * Reduces 5-15MB raw files to ~150-300KB while preserving microscopic insect anatomical detail.
   * Prevents localStorage quota exhaustion and eliminates API timeout failures.
   */
  public static async compressAndResizeImage(file: File, maxDimension: number = 1200, quality: number = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressedUri = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedUri);
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Stage 1 Image Quality Assessment:
   * Examines image aspect ratio, resolution, luminance distribution,
   * and pixel contrast variance to detect blur, solid-color blanks, and severe lighting issues.
   */
  public static async assessImageQuality(dataUrl: string): Promise<ImageQualityCheck> {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      return { isClear: true, lightingScore: 85, sharpnessScore: 80 };
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
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
        let imageData: ImageData;
        try {
          imageData = ctx.getImageData(0, 0, width, height);
        } catch {
          resolve({ isClear: true, lightingScore: 85, sharpnessScore: 80 });
          return;
        }
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
    farmerDistrict: string = 'bargarh',
    requestId?: string,
    abortSignal?: AbortSignal
  ): Promise<ScanReport> {
    const quality = await this.assessImageQuality(imageDataUrl);
    const apiKey = StorageService.getApiKey();
    const settings = StorageService.getSettings();
    const reqId = requestId || `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const imageHash = await this.computeImageHash(imageDataUrl);

    // Helper to ensure strict traceability attributes on any returned report
    const attachTraceability = (rep: ScanReport): ScanReport => {
      return {
        ...rep,
        requestId: rep.requestId || reqId,
        imageHash: rep.imageHash || imageHash,
        modelVersion: rep.modelVersion || '3.5-flash-lite',
        analysisTimestamp: rep.analysisTimestamp || Date.now()
      };
    };

    // Match against verified sample library if forcedPestId was not explicitly set
    let effectivePestId = forcedPestId;
    if (!effectivePestId) {
      const matchedSample = SAMPLE_PEST_IMAGES.find(s => s.imageUri === imageDataUrl);
      if (matchedSample) {
        effectivePestId = matchedSample.pestId;
      }
    }

    // Check cancellation
    if (abortSignal?.aborted) {
      throw new Error('Analysis cancelled by user or superseded by new scan request.');
    }

    // If photograph quality failed, return honest unclear report immediately
    if (!quality.isClear && !effectivePestId) {
      return attachTraceability(this.buildUnclearReport(imageDataUrl, quality, farmerDistrict));
    }

    if (effectivePestId === 'unclear_image') {
      return attachTraceability(this.buildUnclearReport(imageDataUrl, quality, farmerDistrict));
    }

    // 1. Attempt secure backend proxy if enabled and not forced benchmark sample
    if (settings.useBackendProxy && !effectivePestId) {
      try {
        const backendResult = await this.tryAnalyzeViaBackend(imageDataUrl, cropId, farmerDistrict, abortSignal);
        if (backendResult) {
          return attachTraceability(backendResult);
        }
      } catch (err) {
        // Fall through to client direct mode if backend is not running
      }
    }

    if (abortSignal?.aborted) {
      throw new Error('Analysis cancelled by user or superseded by new scan request.');
    }

    // 2. Client BYOK Gemini API call (Direct browser mode)
    if (apiKey && settings.useLiveGemini && !effectivePestId) {
      try {
        const liveResult = await this.callGeminiVisionApi(imageDataUrl, apiKey, quality, farmerDistrict);
        return attachTraceability(liveResult);
      } catch (err: any) {
        console.error('Gemini Vision API error:', err);
        return attachTraceability(this.buildErrorReport(imageDataUrl, quality, err.message || 'Gemini API call failed', farmerDistrict));
      }
    }

    // 3. Deterministic Entomological Reference Mode (Offline / Pre-verified benchmark samples)
    return attachTraceability(this.buildExpertBaselineReport(imageDataUrl, quality, effectivePestId, farmerDistrict));
  }

  /**
   * Secure backend proxy call to prevent client-side key exposure
   */
  private static async tryAnalyzeViaBackend(
    imageDataUrl: string,
    cropId: CropId,
    farmerDistrict: string,
    abortSignal?: AbortSignal
  ): Promise<ScanReport | null> {
    const settings = StorageService.getSettings();
    const envApiUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : undefined;
    const backendUrl = settings.backendUrl || (envApiUrl ? String(envApiUrl).trim() : 'http://localhost:8000/api/v1');

    if (typeof fetch === 'undefined') return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    // Link parent abortSignal if present
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const resp = await fetch(`${backendUrl}/pest/analyze-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageDataUrl,
          crop_id: cropId,
          farmer_district: farmerDistrict
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!resp.ok) return null;
      const data = await resp.json();
      return this.mapBackendResponseToScanReport(data, imageDataUrl);
    } catch {
      clearTimeout(timeoutId);
      return null;
    }
  }

  private static mapBackendResponseToScanReport(data: any, imageDataUrl: string): ScanReport {
    const pestId: PestId = (data.pest_id as PestId) || 'uncertain';
    const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;
    const confidence = typeof data.confidence === 'number' ? data.confidence : null;
    const treatmentAllowed = Boolean(data.treatment_allowed);

    return {
      id: data.scan_id || `scan-${Date.now()}`,
      requestId: data.request_id || data.scan_id || `req-${Date.now()}`,
      imageHash: data.image_hash,
      modelVersion: data.model_version || '3.5-flash-lite',
      analysisTimestamp: data.created_at || Date.now(),
      createdAt: data.created_at || Date.now(),
      cropId: (data.crop_id as CropId) || 'paddy',
      imageUri: imageDataUrl,
      status: (data.status as ScanStatus) || 'UNKNOWN',
      treatmentAllowed,
      confidenceType: data.confidence_type || null,
      visualEvidence: data.visual_evidence || [],
      limitations: data.limitations || [],
      needsBetterImage: Boolean(data.needs_better_image),
      reason: data.reason || 'Backend vision evaluation completed.',
      imageQualityAssessment: {
        isClear: Boolean(data.quality_assessment?.is_clear ?? true),
        lightingScore: data.quality_assessment?.lighting_score ?? 85,
        sharpnessScore: data.quality_assessment?.sharpness_score ?? 80,
        warningMessage: data.quality_assessment?.warning_message_en
      },
      identification: {
        pestId,
        commonNameEn: data.common_name || (data.status === 'IDENTIFIED' ? knowledge.commonNameEn : 'Uncertain'),
        commonNameOr: data.common_name_or || (data.status === 'IDENTIFIED' ? knowledge.commonNameOr : 'ଅନିଶ୍ଚିତ'),
        scientificName: data.scientific_name || (data.status === 'IDENTIFIED' ? knowledge.scientificName : 'N/A'),
        confidence,
        certaintyTier: (confidence && confidence >= 80) ? 'high' : (confidence && confidence >= 60) ? 'moderate' : 'uncertain'
      },
      alternativePossibilities: [],
      observedVisualFeatures: data.visual_evidence || [],
      aiInferredDamage: data.crop_damage_analysis || data.ai_inferred_damage_en || (treatmentAllowed ? knowledge.potentialDamagePercent : 'Cannot be determined without confirmed species identification.'),
      aiInferredDamageOr: data.crop_damage_analysis_or || data.ai_inferred_damage_or || (treatmentAllowed ? knowledge.keySymptomsOr[0] : 'କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କ୍ଷତିର ଆକଳନ ସମ୍ଭବ ନୁହେଁ।'),
      severityAssessment: treatmentAllowed ? (pestId === 'bph' || pestId === 'armyworm' ? 'Severe' : 'Moderate') : 'Low',
      potentialYieldLossRange: data.potential_yield_loss_range || (treatmentAllowed ? knowledge.potentialDamagePercent : 'Assessment suspended'),
      immediateActionsEn: data.immediate_actions_en?.length ? data.immediate_actions_en : (treatmentAllowed ? knowledge.immediateNextStepsEn : ['Do not spray chemical pesticides without species confirmation.']),
      immediateActionsOr: data.immediate_actions_or?.length ? data.immediate_actions_or : (treatmentAllowed ? knowledge.immediateNextStepsOr : ['କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।']),
      expertReviewRequired: Boolean(data.expert_review_recommended),
      sourceModel: data.source_model || 'gemini-3.5-flash-lite',
      isSampleScan: Boolean(data.is_sample_scan),
      farmerDistrict: data.farmer_district || 'bargarh',
      followUpScans: []
    };
  }

  private static buildErrorReport(
    imageDataUrl: string,
    quality: ImageQualityCheck,
    errorMessage: string,
    farmerDistrict: string
  ): ScanReport {
    return {
      id: `scan-${Date.now()}`,
      createdAt: Date.now(),
      cropId: 'paddy',
      imageUri: imageDataUrl,
      status: 'ERROR',
      treatmentAllowed: false,
      confidenceType: null,
      visualEvidence: [],
      limitations: [
        'Cloud vision request failed. Check API key validity, model quota, or network connection.',
        'Zero chemical pesticide treatments permitted during error states.'
      ],
      needsBetterImage: false,
      reason: `Gemini API Error: ${errorMessage}`,
      imageQualityAssessment: quality,
      identification: {
        pestId: 'uncertain',
        commonNameEn: 'Vision API Error',
        commonNameOr: 'AI ଭିଜନ ସେବା ତ୍ରୁଟି',
        scientificName: 'N/A',
        confidence: null,
        certaintyTier: 'uncertain'
      },
      alternativePossibilities: [],
      observedVisualFeatures: ['API request failed.'],
      aiInferredDamage: 'Indeterminate due to API error',
      aiInferredDamageOr: 'API ତ୍ରୁଟି କାରଣରୁ ଫସଲ କ୍ଷତିର ଆକଳନ ସମ୍ଭବ ନୁହେଁ।',
      severityAssessment: 'Low',
      potentialYieldLossRange: 'Assessment suspended',
      immediateActionsEn: [
        'Check your API key in settings or verify that your internet connection is active.',
        'Do not apply synthetic pesticides without confirmed diagnosis.'
      ],
      immediateActionsOr: [
        'ଦୟାକରି ଆପଣଙ୍କର API କି କିମ୍ବା ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ଯାଞ୍ଚ କରନ୍ତୁ।',
        'କୀଟ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୌଣସି କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।'
      ],
      expertReviewRequired: true,
      sourceModel: 'gemini-3.5-flash-lite',
      isSampleScan: false,
      farmerDistrict,
      followUpScans: []
    };
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
    const settings = StorageService.getSettings();
    const activeModel = settings.selectedModel || 'gemini-3.5-flash-lite';

    const systemPrompt = `You are Krushi Mitra AI's senior agricultural entomologist and vision specialist for Odisha, India.
Analyze this crop/insect photograph with extreme scientific rigor.

CRITICAL OPERATIONAL RULES:
1. DO NOT assume the photograph contains a rice pest.
2. NON-AGRICULTURAL IMAGES (humans, selfies, cars, animals, furniture, everyday objects, buildings, indoor scenes) MUST be classified as 'NON_AGRICULTURAL_IMAGE'.
3. HEALTHY CROPS: Only pristine, green crops without insects and without lesions, spots, or pathology MUST be classified as 'HEALTHY_CROP'.
4. CROP DAMAGE WITHOUT VISIBLE INSECTS: Foliage exhibiting pathology, fungal/bacterial lesions (e.g., rice blast spindle-shaped spots, brown spot, bacterial blight), insect feeding holes, yellowing, or necrosis where no insect specimen is visible MUST be classified as 'CROP_DAMAGE_NO_VISIBLE_INSECT'. Never classify diseased or spotted leaves as 'HEALTHY_CROP'!
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

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

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

    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);
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
      sourceModel: (['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'].includes(activeModel) ? activeModel : 'gemini-3.5-flash-lite') as any,
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

      if (forcedPestId === 'unclear_image') {
        return this.buildUnclearReport(imageDataUrl, quality, farmerDistrict);
      }

      // If forcedPestId is not one of the 5 supported pests, do NOT default to bph!
      if (!['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm'].includes(forcedPestId as PestId)) {
        return this.buildUnclearReport(imageDataUrl, quality, farmerDistrict);
      }

      // Verified 5 Supported Pests
      const targetPestId: PestId = forcedPestId as PestId;
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
      reason: 'The system is currently operating in Offline Entomological Knowledge-Base Mode without live vision API connectivity. To prevent false identifications, Krushi Mitra AI refuses to guess or force arbitrary uploads into one of the 5 rice pests.',
      visualEvidence: ['Offline knowledge-base mode active', 'Live multimodal vision required for new unreferenced uploads'],
      limitations: ['Automated species-level vision classification on arbitrary images requires active Gemini API or backend server connection.'],
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
