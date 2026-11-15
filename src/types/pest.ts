export type PestId = 
  | 'bph' 
  | 'stem_borer' 
  | 'leaf_folder' 
  | 'rice_hispa' 
  | 'armyworm' 
  | 'healthy_paddy' 
  | 'beneficial_spider' 
  | 'uncertain';

export type CropId = 'paddy' | 'maize' | 'tomato' | 'brinjal' | 'chilli' | 'groundnut' | 'pulses';

export type SeverityLevel = 'Low' | 'Moderate' | 'Severe' | 'Critical';

export type ScanStatus = 
  | 'IDENTIFIED'
  | 'OTHER_INSECT'
  | 'NO_INSECT'
  | 'HEALTHY_CROP'
  | 'CROP_DAMAGE_NO_VISIBLE_INSECT'
  | 'UNCLEAR_IMAGE'
  | 'NON_AGRICULTURAL_IMAGE'
  | 'UNKNOWN'
  | 'ERROR';

export interface BiologicalControlMethod {
  titleEn: string;
  titleOr: string;
  descriptionEn: string;
  descriptionOr: string;
  category: 'predator' | 'parasitoid' | 'biopesticide';
  safetyRating: 'Eco-Friendly' | 'Targeted Biological';
  targetStage: string;
}

export interface CulturalControlMethod {
  titleEn: string;
  titleOr: string;
  descriptionEn: string;
  descriptionOr: string;
  actionTiming: string;
}

export interface ChemicalControlMethod {
  activeIngredient: string;
  tradeNames: string[];
  dosagePerAcre: string;
  waterVolumePerAcre: string;
  phiDays: number; // Pre-Harvest Interval in days
  cibrcRegistered: boolean;
  toxicityClass: 'Green (Slightly Toxic)' | 'Blue (Moderately Toxic)' | 'Yellow (Highly Toxic)';
  safetyPrecautionsEn: string;
  safetyPrecautionsOr: string;
  waterSprayInstructions: string;
}

export interface PestKnowledge {
  id: PestId;
  commonNameEn: string;
  commonNameOr: string;
  scientificName: string;
  localOdishaName: string;
  hostCrops: string[];
  affectedPlantParts: string[];
  keySymptomsEn: string[];
  keySymptomsOr: string[];
  potentialDamagePercent: string;
  conditionsFavoringEn: string[];
  conditionsFavoringOr: string[];
  economicThresholdLevelEn: string;
  economicThresholdLevelOr: string;
  immediateNextStepsEn: string[];
  immediateNextStepsOr: string[];
  preventiveMeasuresEn: string[];
  preventiveMeasuresOr: string[];
  biologicalControl: BiologicalControlMethod[];
  culturalControl: CulturalControlMethod[];
  chemicalControl: ChemicalControlMethod[];
  expertConsultationCriteriaEn: string[];
  expertConsultationCriteriaOr: string[];
  scientificReferences: string[];
}

export interface FollowUpScan {
  id: string;
  scanDate: string;
  daysAfterTreatment: number;
  imageUri: string;
  visualObservationEn: string;
  visualObservationOr: string;
  symptomTrend: 'improving' | 'stable' | 'worsening';
  confidenceScore: number;
  notes?: string;
}

export interface ScanReport {
  id: string;
  createdAt: number;
  cropId: CropId;
  imageUri: string;
  
  // Strict Scientific Status & Gating
  status?: ScanStatus;
  treatmentAllowed?: boolean;
  confidenceType?: string | null;
  visualEvidence?: string[];
  limitations?: string[];
  needsBetterImage?: boolean;
  reason?: string;
  referenceImageUri?: string;
  referenceAttribution?: string;
  
  imageQualityAssessment: {
    isClear: boolean;
    lightingScore: number; // 0-100
    sharpnessScore: number; // 0-100
    warningMessage?: string;
  };
  identification: {
    pestId: PestId;
    commonNameEn: string;
    commonNameOr: string;
    scientificName: string;
    confidence: number | null; // null if uncalibrated/uncertain
    certaintyTier: 'high' | 'moderate' | 'uncertain';
  };
  alternativePossibilities: Array<{
    pestId: PestId;
    nameEn: string;
    nameOr: string;
    confidence: number;
  }>;
  observedVisualFeatures: string[];
  aiInferredDamage: string;
  aiInferredDamageOr: string;
  severityAssessment: SeverityLevel;
  potentialYieldLossRange: string;
  immediateActionsEn: string[];
  immediateActionsOr: string[];
  expertReviewRequired: boolean;
  sourceModel: 'gemini-1.5-flash' | 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-2.5-flash' | 'expert-verified-baseline' | 'deterministic-reference-kb';
  isSampleScan?: boolean;
  farmerDistrict?: string;
  farmerNotes?: string;
  treatmentApplied?: {
    date: string;
    category: 'biological' | 'cultural' | 'chemical';
    methodName: string;
    dosageNotes?: string;
    weatherCondition?: string;
  };
  followUpScans: FollowUpScan[];
}
