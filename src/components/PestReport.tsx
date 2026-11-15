import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  FileDown, 
  Share2, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  Sprout,
  HelpCircle,
  Camera,
  Info,
  UserCheck,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';
import { SAMPLE_PEST_IMAGES } from '../data/sampleImages';
import { StorageService } from '../services/storageService';
import { voiceService } from '../services/voiceService';
import confetti from 'canvas-confetti';

interface PestReportProps {
  report: ScanReport;
  lang: 'or' | 'en';
  onNavigateTreatments: () => void;
  onFollowUpSchedule?: () => void;
  onNavigateAssistant?: () => void;
  onEscalate: () => void;
  onRetakeScan?: () => void;
}

export const PestReport: React.FC<PestReportProps> = ({
  report,
  lang,
  onNavigateTreatments,
  onNavigateAssistant,
  onEscalate,
  onRetakeScan
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const t = ODIA_TRANSLATIONS[lang];
  const pestId = report.identification.pestId;
  const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;
  const status = report.status || (pestId !== 'uncertain' ? 'IDENTIFIED' : 'UNKNOWN');
  const isTreatmentAllowed = Boolean(report.treatmentAllowed);

  // Authoritative reference image for side-by-side comparison
  const referenceImage = SAMPLE_PEST_IMAGES.find(s => s.pestId === pestId);

  // Confidence display helper
  const confidence = report.identification.confidence;
  const confidenceColor = 
    confidence && confidence >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-300' :
    confidence && confidence >= 70 ? 'text-amber-700 bg-amber-50 border-amber-300' :
    'text-slate-600 bg-slate-100 border-slate-300';

  const handleAudioNarration = () => {
    if (isPlayingAudio) {
      voiceService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    let speechText = '';

    if (status === 'IDENTIFIED') {
      if (lang === 'or') {
        speechText = `କୃଷି ମିତ୍ର AI ନିରୀକ୍ଷଣ: ଆପଣଙ୍କ ଧାନ ଫସଲରେ ${knowledge.commonNameOr} ର ଲକ୍ଷଣ ଚିହ୍ନଟ ହୋଇଛି। ପ୍ରାଥମିକ ଲକ୍ଷଣ: ${knowledge.keySymptomsOr[0]}। ନିରାପଦ ଜୈବିକ ପଦକ୍ଷେପ: ${knowledge.immediateNextStepsOr[0]}`;
      } else {
        speechText = `Krushi Mitra AI diagnostic summary: Visual features indicate ${knowledge.commonNameEn}. Primary symptom: ${knowledge.keySymptomsEn[0]}. Immediate recommendation: ${knowledge.immediateNextStepsEn[0]}`;
      }
    } else if (status === 'OTHER_INSECT') {
      speechText = lang === 'or' 
        ? 'ଏହି କୀଟଟି ୫ଟି ପ୍ରମୁଖ ଧାନ କ୍ଷତିକାରକ ପୋକ ମଧ୍ୟରେ ଅନ୍ତର୍ଭୁକ୍ତ ନୁହେଁ। ଏହା ବନ୍ଧୁ କୀଟ ହୋଇପାରେ। କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।' 
        : 'The insect detected is not one of the five major rice pests supported. It may be a beneficial predator. Do not spray chemical pesticides.';
    } else if (status === 'HEALTHY_CROP') {
      speechText = lang === 'or'
        ? 'ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଅଛି। କୌଣସି ପୋକ ବା ରୋଗର ଲକ୍ଷଣ ନାହିଁ। କୌଣସି କୀଟନାଶକ ଆବଶ୍ୟକ ନାହିଁ।'
        : 'The crop is healthy with zero harmful pests detected. No pesticide application required.';
    } else if (status === 'CROP_DAMAGE_NO_VISIBLE_INSECT') {
      speechText = lang === 'or'
        ? 'ପତ୍ରରେ କ୍ଷତିର ଚିହ୍ନ ଅଛି, କିନ୍ତୁ କୌଣସି ପୋକ ଦୃଶ୍ୟମାନ ନାହିଁ। ଜୀବନ୍ତ ପୋକର ଫଟୋ ନ ଉଠାଇ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।'
        : 'Leaf damage visible, but insect not present. Do not spray pesticides without confirming the insect species.';
    } else {
      speechText = lang === 'or'
        ? 'ଫଟୋଟି ଅସ୍ପଷ୍ଟ ଅଟେ। ଦୟାକରି ଭଲ ଆଲୋକରେ ସ୍ଥିର ଭାବେ ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।'
        : 'The image is unclear. Please retake a steady close-up photograph in natural light.';
    }

    voiceService.speak(speechText, lang, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSaveReport = () => {
    StorageService.saveReport(report);
    setIsSaved(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#84CC16', '#22C55E', '#166534']
    });
  };

  const handleEscalateToKvk = () => {
    StorageService.escalateToExpert(report.id, report.farmerDistrict || 'bargarh');
    setEscalated(true);
    onEscalate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* STATUS-DRIVEN BANNER NOTIFICATIONS */}
      {status === 'OTHER_INSECT' && (
        <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-amber-900">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅଣ-ସମର୍ଥିତ କୀଟ ଚିହ୍ନଟ (ଚାଷୀର ବନ୍ଧୁ କୀଟ ହୋଇପାରେ)' : 'Non-Target Insect Detected (Not One of 5 Supported Rice Pests)'}</span>
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            {lang === 'or'
              ? 'AI ଏହି ଫଟୋରେ ଏକ କୀଟ ଚିହ୍ନଟ କରିଛି, କିନ୍ତୁ ଏହା କୃଷି ମିତ୍ର AI ର ୫ଟି ଧାନ କ୍ଷତିକାରକ ପୋକ ନୁହେଁ। ଏହା ଏକ ବନ୍ଧୁ କୀଟ (ଯେପରିକି ବୁଢ଼ିଆଣୀ କିମ୍ବା ଲେଡିବାର୍ଡ୍ ବିଟଲ୍) ହୋଇପାରେ। କଦାପି ରାସାୟନିକ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।'
              : 'An insect is visible in the photograph, but it is NOT one of the five specific rice pests currently supported by Krushi Mitra AI. It may be a beneficial predator or neutral arthropod. Chemical insecticide recommendations are strictly withheld.'}
          </p>
        </div>
      )}

      {status === 'HEALTHY_CROP' && (
        <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-300 text-emerald-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ସୁସ୍ଥ ଧାନ ଫସଲ (ଶୂନ୍ୟ କୀଟନାଶକ ଆବଶ୍ୟକ)' : 'Healthy Rice Crop (Zero Pesticide Intervention Required)'}</span>
          </div>
          <p className="text-sm text-emerald-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ଧାନ ଗଛ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଓ ସତେଜ ଅଛି। କୌଣସି ପୋକ ବା କ୍ଷତିକାରକ ରୋଗର ଲକ୍ଷଣ ନାହିଁ। କୌଣସି ରାସାୟନିକ ପ୍ରୟୋଗର ଆବଶ୍ୟକତା ନାହିଁ। କେବଳ ନିୟମିତ କ୍ଷେତ ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।'
              : 'Your rice foliage displays intact vegetative tillers with zero economic insect damage. Applying synthetic chemicals will destroy natural biological control and waste financial capital.'}
          </p>
        </div>
      )}

      {status === 'CROP_DAMAGE_NO_VISIBLE_INSECT' && (
        <div className="bg-orange-50 rounded-3xl p-6 border-2 border-orange-300 text-orange-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-orange-900">
            <AlertTriangle className="w-6 h-6 text-orange-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ପତ୍ରରେ କ୍ଷତି ଅଛି (କିନ୍ତୁ ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)' : 'Crop Damage Visible (Insect Not Confirmed)'}</span>
          </div>
          <p className="text-sm text-orange-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ପତ୍ରରେ କ୍ଷତି କିମ୍ବା ରଙ୍ଗ ପରିବର୍ତ୍ତନର ଚିହ୍ନ ଅଛି, କିନ୍ତୁ ଫଟୋରେ କୌଣସି ପୋକର ଶରୀର ଦେଖାଯାଉନାହିଁ। ପତ୍ର କ୍ଷତିରୁ କେଉଁ ପୋକ କ୍ଷତି କରିଛି ତାହା ପ୍ରମାଣିତ ହୋଇପାରିବ ନାହିଁ। ଦୟାକରି ଗଛ ମୂଳ ଓ ପତ୍ର ସନ୍ଧିରୁ ଜୀବନ୍ତ ପୋକ ଖୋଜି ତାର ଫଟୋ ଉଠାନ୍ତୁ।'
              : 'Foliage damage or discoloration is visible, but the insect responsible cannot be confirmed without a clear photograph of the actual insect. Fungal diseases or past feeding look identical. Inspect stem bases or leaf folds and photograph the live pest.'}
          </p>
        </div>
      )}

      {status === 'UNCLEAR_IMAGE' && (
        <div className="bg-slate-100 rounded-3xl p-6 border-2 border-slate-300 text-slate-900 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-slate-800">
            <Camera className="w-6 h-6 text-slate-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅସ୍ପଷ୍ଟ ଫଟୋ (ପୁନର୍ବାର ଫଟୋ ଉଠାନ୍ତୁ)' : 'Unclear Photograph (Re-Take Required)'}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {lang === 'or'
              ? 'ଫଟୋଟି ଝାପ୍‌ସା କିମ୍ବା କମ ଆଲୋକରେ ଉଠାଯାଇଛି। ସଠିକ ଚିହ୍ନଟ ପାଇଁ ପର୍ଯ୍ୟାପ୍ତ ସୂର୍ଯ୍ୟାଲୋକରେ କ୍ୟାମେରା ସ୍ଥିର ରଖି ପୋକର ଏକ ସ୍ପଷ୍ଟ ନିକଟବର୍ତ୍ତୀ ଫଟୋ ନିଅନ୍ତୁ।'
              : 'The photograph lacks micro-level sharpness or contrast to differentiate insect anatomy. To avoid dangerous misidentification, please retake in steady natural daylight.'}
          </p>
        </div>
      )}

      {status === 'NON_AGRICULTURAL_IMAGE' && (
        <div className="bg-rose-50 rounded-3xl p-6 border-2 border-rose-300 text-rose-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-rose-900">
            <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅଣ-କୃଷି ଫଟୋ ପ୍ରତ୍ୟାଖ୍ୟାତ' : 'Non-Agricultural Image Rejected'}</span>
          </div>
          <p className="text-sm text-rose-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ଏହି ଫଟୋରେ କୌଣସି ଧାନ ଫସଲ କିମ୍ବା କୃଷି କୀଟ ନାହିଁ (ମୋଟର ଗାଡ଼ି, ବସ୍ତୁ କିମ୍ବା ଅନ୍ୟାନ୍ୟ ଦୃଶ୍ୟ)। କୃଷି ମିତ୍ର AI କେବଳ ଧାନ କ୍ଷେତ୍ରର କୀଟ ପରିଚାଳନା ପାଇଁ ପ୍ରସ୍ତୁତ।'
              : 'The uploaded image contains an automobile, household object, or non-agricultural subject. The system rejects this scan and refuses to manufacture an insect classification.'}
          </p>
        </div>
      )}

      {/* CORE SPECIMEN DOSSIER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'or' ? 'ପ୍ରାମାଣିକ ନିରୀକ୍ଷଣ' : 'Diagnostic Intelligence Dossier'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {status === 'IDENTIFIED' ? 'AI-Suspected Observation' : status}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Scan ID: {report.id.substring(0, 16)} • {new Date(report.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* PHOTOGRAPH COMPARISON (USER vs SCIENTIFIC REFERENCE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. User Uploaded Photo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{lang === 'or' ? '୧. ଆପଣଙ୍କ ଅପଲୋଡ୍ ଫଟୋ' : '1. Your Uploaded Photograph'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Sharpness: {report.imageQualityAssessment.sharpnessScore}%
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img 
                src={report.imageUri} 
                alt="User capture"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
                Field Upload
              </div>
            </div>
          </div>

          {/* 2. Authoritative Reference Specimen */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{lang === 'or' ? '୨. ବୈଜ୍ଞାନିକ ପ୍ରମାଣିକ ନମୁନା' : '2. Verified Reference Specimen'}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {referenceImage ? referenceImage.sourceName.split('/')[0] : 'ICAR-NRRI Benchmark'}
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              {referenceImage ? (
                <>
                  <img 
                    src={referenceImage.imageUri} 
                    alt={referenceImage.labelEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-black/70 text-white text-[10px] backdrop-blur-md leading-tight">
                    <span className="font-bold block truncate">{referenceImage.attribution}</span>
                    <span className="text-lime-300 text-[9px]">{referenceImage.license}</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                  <Eye className="w-8 h-8 text-slate-300 mb-2" />
                  <span>{lang === 'or' ? 'ଅଣ-ସମର୍ଥିତ ବା ଅନିଶ୍ଚିତ ନମୁନା ପାଇଁ ପ୍ରମାଣିକ ଫଟୋ ଉପଲବ୍ଧ ନାହିଁ' : 'Reference photograph available for 5 confirmed rice pests only'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HEADLINE ENTOMOLOGY DATA */}
        <div className="pt-2 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {lang === 'or' ? report.identification.commonNameOr : report.identification.commonNameEn}
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {report.identification.scientificName && (
              <span className="text-sm font-semibold italic text-slate-600">
                {report.identification.scientificName}
              </span>
            )}
            {knowledge.localOdishaName && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {knowledge.localOdishaName}
                </span>
              </>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Crop: Paddy (Rice)
            </span>
          </div>

          {/* TELEMETRY & CONFIDENCE PILLS */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {confidence !== null ? (
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center space-x-1.5 ${confidenceColor}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confidenceLabel}: {confidence}%</span>
                <span className="text-[10px] font-normal text-slate-500">
                  ({report.confidenceType === 'benchmark_reference' ? 'Curated Reference Value' : 'LLM Self-Estimate (Uncalibrated)'})
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl border bg-slate-100 border-slate-300 text-slate-600 text-xs font-bold">
                Confidence: Uncalibrated / Uncertain
              </div>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1">
              <span>{lang === 'or' ? 'ଗମ୍ଭୀରତା:' : 'Severity Assessment:'}</span>
              <span className={`font-black ${
                report.severityAssessment === 'Severe' ? 'text-rose-600' :
                report.severityAssessment === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'
              }`}>
                {report.severityAssessment}
              </span>
            </div>

            {/* Odia Audio Button */}
            <button
              onClick={handleAudioNarration}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                isPlayingAudio 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-lime-500 hover:bg-lime-400 text-agri-950 shadow-sm'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? (lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Stop Audio') : (lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' : 'Listen in Odia')}</span>
            </button>
          </div>
        </div>

        {/* DETAILED CROP DAMAGE & HARVEST IMPACT ANALYSIS */}
        {isTreatmentAllowed && (report.aiInferredDamage || report.potentialYieldLossRange) && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50/80 via-amber-50/70 to-orange-50/80 border border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm sm:text-base">
                <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                <span>
                  {lang === 'or' ? 'କୀଟ ଦ୍ୱାରା ଫସଲ କ୍ଷତିର ବିସ୍ତୃତ ଆକଳନ' : 'Crop Damage & Harvest Impact Analysis'}
                </span>
              </div>
              {report.potentialYieldLossRange && (
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-black border border-red-200">
                  {lang === 'or' ? 'କ୍ଷତି ଆଶଙ୍କା: ' : 'Yield Loss Risk: '}{report.potentialYieldLossRange}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {lang === 'or' ? (report.aiInferredDamageOr || report.aiInferredDamage) : report.aiInferredDamage}
            </p>
            {knowledge.keySymptomsEn && knowledge.keySymptomsEn.length > 0 && (
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                  {lang === 'or' ? 'ପ୍ରମୁଖ କ୍ଷତି ଲକ୍ଷଣ (Field Damage Signs):' : 'Key Diagnostic Symptoms & Signs:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {(lang === 'or' ? knowledge.keySymptomsOr : knowledge.keySymptomsEn).map((sym, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-xs text-slate-700">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OBSERVATIONAL EVIDENCE vs AI LIMITATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {lang === 'or' ? 'ପ୍ରତ୍ୟକ୍ଷ ଫଟୋ ନିରୀକ୍ଷଣ (Visual Evidence):' : 'Direct Photographic Observations:'}
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              {(report.visualEvidence && report.visualEvidence.length > 0 ? report.visualEvidence : report.observedVisualFeatures).map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              {lang === 'or' ? 'AI ସୀମାବଦ୍ଧତା ଓ ସତର୍କତା:' : 'Scientific AI Limitations:'}
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">
              {report.reason || 'This identification represents automated image-based feature correlation. A single photograph does not establish field-wide infestation severity or Economic Threshold Levels (ETL).'}
            </p>
            {report.limitations && report.limitations.length > 0 && (
              <ul className="text-[11px] text-amber-700 space-y-1 list-disc list-inside pt-1">
                {report.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS & TREATMENT GATING */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {isTreatmentAllowed ? (
            <button
              onClick={onNavigateTreatments}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Sprout className="w-5 h-5 text-lime-300" />
              <span>{lang === 'or' ? '୩-ସ୍ତରୀୟ ସମନ୍ୱିତ ଉପଚାର ପରାମର୍ଶ ଦେଖନ୍ତୁ' : 'View 3-Tier Treatment & IPM Protocols'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                {lang === 'or' 
                  ? 'ରାସାୟନିକ ଉପଚାର ସ୍ଥଗିତ: ପୋକ ନିଶ୍ଚିତ ନହେବା ପର୍ଯ୍ୟନ୍ତ କୀଟନାଶକ ସିଞ୍ଚନ ନିଷେଧ।' 
                  : 'Treatment Withheld: Chemical recommendations strictly locked until confirmed pest diagnosis.'}
              </span>
            </div>
          )}

          <button
            onClick={handleSaveReport}
            disabled={isSaved}
            className={`py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
              isSaved 
                ? 'bg-slate-100 text-slate-500 border-slate-200' 
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <FileDown className="w-4 h-4" />}
            <span>{isSaved ? (lang === 'or' ? 'ରିପୋର୍ଟ ସଂରକ୍ଷିତ' : 'Report Saved') : t.ctaSaveReport}</span>
          </button>

          <button
            onClick={handleEscalateToKvk}
            disabled={escalated}
            className={`py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
              escalated
                ? 'bg-lime-50 text-agri-900 border-lime-300'
                : 'bg-white hover:bg-slate-50 text-agri-900 border-slate-300 shadow-sm'
            }`}
          >
            <UserCheck className="w-4 h-4 text-agri-700" />
            <span>{escalated ? (lang === 'or' ? 'KVK କୁ ପଠାଗଲା' : 'Escalated to KVK') : t.ctaEscalateExpert}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
