export type PestId = 
  | 'bph' 
  | 'stem_borer' 
  | 'leaf_folder' 
  | 'rice_hispa' 
  | 'armyworm' 
  | 'fall_armyworm'
  | 'fruit_borer'
  | 'shoot_and_fruit_borer'
  | 'black_thrips'
  | 'groundnut_leaf_miner'
  | 'pulse_pod_borer'
  | 'diamondback_moth'
  | 'healthy_paddy' 
  | 'beneficial_spider' 
  | 'uncertain';

export type CropId =
  // Cereals & Millets
  | 'paddy' | 'maize' | 'ragi' | 'sorghum' | 'pearl_millet' | 'foxtail_millet'
  // Pulses
  | 'green_gram' | 'black_gram' | 'pigeon_pea' | 'chickpea' | 'lentil' | 'cowpea' | 'pulses'
  // Oilseeds
  | 'groundnut' | 'mustard' | 'sesame' | 'sunflower' | 'niger'
  // Vegetables
  | 'tomato' | 'brinjal' | 'chilli' | 'okra' | 'cabbage' | 'cauliflower' | 'bitter_gourd' | 'bottle_gourd' | 'pointed_gourd' | 'onion' | 'potato'
  // Fruits & Horticulture
  | 'mango' | 'banana' | 'papaya' | 'guava' | 'citrus' | 'coconut' | 'cashew';

export type PlantPart = 
  | 'leaf' 
  | 'stem' 
  | 'root' 
  | 'flower' 
  | 'fruit' 
  | 'grain' 
  | 'whole_plant';

export type SeverityLevel = 'Low' | 'Moderate' | 'Severe' | 'Critical';

export type ScanStatus = 
  | 'IDENTIFIED'
  | 'PROBABLE_IDENTIFICATION'
  | 'OTHER_INSECT'
  | 'NON_TARGET_INSECT'
  | 'UNSUPPORTED_SPECIES'
  | 'NO_INSECT'
  | 'HEALTHY_CROP'
  | 'CROP_DAMAGE_NO_VISIBLE_INSECT'
  | 'UNCLEAR_IMAGE'
  | 'IMAGE_QUALITY_INSUFFICIENT'
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
  phiDays: number;
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
  plantPart?: PlantPart;
  imageUri: string;
  
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
    lightingScore: number;
    sharpnessScore: number;
    warningMessage?: string;
  };
  identification: {
    pestId: PestId;
    commonNameEn: string;
    commonNameOr: string;
    scientificName: string;
    confidence: number | null;
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
  sourceModel: string;
  modelVersion?: string;
  requestId?: string;
  imageHash?: string;
  analysisTimestamp?: number;
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
