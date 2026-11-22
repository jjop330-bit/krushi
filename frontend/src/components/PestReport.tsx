import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  FileDown, 
  Share2, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Sprout,
  HelpCircle,
  Camera,
  Info,
  UserCheck,
  AlertCircle,
  Eye,
  Check,
  Flag,
  MessageSquare,
  ShoppingBag
} from 'lucide-react';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';
import { SAMPLE_PEST_IMAGES } from '../data/sampleImages';
import { getCropById } from '../data/cropKnowledge';
import { StorageService } from '../services/storageService';
import { voiceService, AudioPlaybackState } from '../services/voiceService';
import confetti from 'canvas-confetti';

interface PestReportProps {
  report: ScanReport;
  lang: 'or' | 'en';
  onNavigateTreatments: () => void;
  onFollowUpSchedule?: () => void;
  onNavigateAssistant?: () => void;
  onEscalate: () => void;
  onRetakeScan?: () => void;
  onFindProducts?: (cropId?: string, pestId?: string) => void;
  onDiscussWithExpert?: (report: ScanReport) => void;
}

export const PestReport: React.FC<PestReportProps> = ({
  report,
  lang,
  onNavigateTreatments,
  onNavigateAssistant,
  onEscalate,
  onRetakeScan,
  onFindProducts,
  onDiscussWithExpert
}) => {
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [reportFlagged, setReportFlagged] = useState(false);
  const [flagFeedback, setFlagFeedback] = useState<string>('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
    };
  }, []);

  const t = ODIA_TRANSLATIONS[lang];
  const pestId = report.identification.pestId;
  const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;
  const status = report.status || (pestId !== 'uncertain' ? 'IDENTIFIED' : 'UNKNOWN');
  const isTreatmentAllowed = Boolean(report.treatmentAllowed);
  const cropInfo = getCropById(report.cropId);

  const referenceImage = SAMPLE_PEST_IMAGES.find(s => s.pestId === pestId);

  const confidence = report.identification.confidence;
  const confidenceColor = 
    confidence && confidence >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-300' :
    confidence && confidence >= 70 ? 'text-amber-700 bg-amber-50 border-amber-300' :
    'text-slate-600 bg-slate-100 border-slate-300';

  const cropName = lang === 'or' ? (cropInfo?.commonNameOr || 'ଫସଲ') : (cropInfo?.commonNameEn || 'Crop');

  const handleAudioNarration = () => {
    if (audioState === 'playing') {
      voiceService.pause();
      setAudioState('paused');
      return;
    }

    if (audioState === 'paused') {
      voiceService.resume();
      setAudioState('playing');
      return;
    }

    if (audioState === 'loading') {
      voiceService.stopSpeaking();
      setAudioState('idle');
      return;
    }

    setAudioState('loading');
    setAudioError(null);
    let speechText = '';

    if (status === 'IDENTIFIED') {
      if (lang === 'or') {
        speechText = `କୃଷି ମିତ୍ର AI ନିରୀକ୍ଷଣ: ଆପଣଙ୍କ ${cropName} ଫସଲରେ ${knowledge.commonNameOr} (${knowledge.scientificName}) ର ଲକ୍ଷଣ ଚିହ୍ନଟ ହୋଇଛି। ପ୍ରାଥମିକ ଲକ୍ଷଣ: ${knowledge.keySymptomsOr[0] || 'ପତ୍ର କ୍ଷତି'}। ନିରାପଦ ଜୈବିକ ପଦକ୍ଷେପ: ${knowledge.immediateNextStepsOr[0] || 'କୀଟ ନିରୀକ୍ଷଣ କରନ୍ତୁ'}`;
      } else {
        speechText = `Krushi Mitra AI diagnostic summary: Visual features on ${cropName} indicate ${knowledge.commonNameEn} (${knowledge.scientificName}). Primary symptom: ${knowledge.keySymptomsEn[0] || 'foliar damage'}. Immediate recommendation: ${knowledge.immediateNextStepsEn[0] || 'Scout field regularly'}`;
      }
    } else if (status === 'OTHER_INSECT' || status === 'NON_TARGET_INSECT') {
      speechText = lang === 'or' 
        ? `ଏହି କୀଟଟି ${cropName} ପାଇଁ କ୍ଷତିକାରକ ପୋକ ନୁହେଁ। ଏହା ଏକ ବନ୍ଧୁ କୀଟ କିମ୍ବା ନିରପେକ୍ଷ କୀଟ ହୋଇପାରେ। କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।` 
        : `The insect detected is not a destructive pest for ${cropName}. It may be a beneficial predator. Do not spray chemical pesticides.`;
    } else if (status === 'UNSUPPORTED_SPECIES') {
      speechText = lang === 'or'
        ? `ଏହି କୀଟ ବା ଜୀବଟି ବର୍ତ୍ତମାନର ସମର୍ଥିତ ଡାଟାବେସରେ ଅନ୍ତର୍ଭୁକ୍ତ ନୁହେଁ। କୌଣସି ରାସାୟନିକ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।`
        : `This organism is not currently in our validated database. Chemical sprays are strictly withheld.`;
    } else if (status === 'HEALTHY_CROP') {
      speechText = lang === 'or'
        ? `${cropName} ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଅଛି। କୌଣସି ପୋକ ବା ରୋଗର ଲକ୍ଷଣ ନାହିଁ। କୌଣସି କୀଟନାଶକ ଆବଶ୍ୟକ ନାହିଁ।`
        : `The ${cropName} crop is healthy with zero harmful pests detected. No pesticide application required.`;
    } else if (status === 'CROP_DAMAGE_NO_VISIBLE_INSECT') {
      speechText = lang === 'or'
        ? `ପତ୍ରରେ କ୍ଷତିର ଚିହ୍ନ ଅଛି, କିନ୍ତୁ କୌଣସି ପୋକ ଦୃଶ୍ୟମାନ ନାହିଁ। ଜୀବନ୍ତ ପୋକର ଫଟୋ ନ ଉଠାଇ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।`
        : `Leaf damage visible, but insect not present. Do not spray pesticides without confirming the insect species.`;
    } else {
      speechText = lang === 'or'
        ? `ଫଟୋଟି ଅସ୍ପଷ୍ଟ ଅଟେ। ଦୟାକରି ଭଲ ଆଲୋକରେ ସ୍ଥିର ଭାବେ ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।`
        : `The image is unclear. Please retake a steady close-up photograph in natural light.`;
    }

    voiceService.speak(speechText, lang, {
      onStateChange: (state) => setAudioState(state),
      onEnd: () => {
        setAudioState('idle');
        setAudioError(null);
      },
      onError: (errMsg) => {
        setAudioState('error');
        setAudioError(errMsg);
      }
    });
  };

  const handleReplayAudio = () => {
    if (audioState === 'playing' || audioState === 'paused') {
      voiceService.replay();
    } else {
      handleAudioNarration();
    }
  };

  const handleStopAudio = () => {
    voiceService.stopSpeaking();
    setAudioState('idle');
    setAudioError(null);
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

  const handleFlagReport = () => {
    setReportFlagged(true);
    setShowFlagModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {status === 'UNSUPPORTED_SPECIES' && (
        <div className="bg-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-amber-900">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅସମର୍ଥିତ ପ୍ରଜାତି (ମଡେଲ୍ ଅନୁମାନ କରିବାକୁ ମନା କରିଛି)' : 'Unsupported Species (Refusal to Guess)'}</span>
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ଫଟୋରେ ଥିବା କୀଟ ବା ଜୀବଟି କୃଷି ମିତ୍ର AI ର ବୈଜ୍ଞାନିକ ଭାବେ ପ୍ରମାଣିତ କୀଟ ଡାଟାବେସ୍ ବାହାରେ ଅଟେ। ଭୁଲ କୀଟନାଶକ ପ୍ରୟୋଗ ରୋକିବା ପାଇଁ ସିଷ୍ଟମ୍ କୌଣସି ଅନୁମାନ କରୁନାହିଁ। ସ୍ଥାନୀୟ KVK ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।'
              : 'The photographed organism is outside our validated Odisha crop pest knowledge registry. To prevent dangerous chemical misapplications, Krushi Mitra AI refuses to force an unverified diagnosis.'}
          </p>
        </div>
      )}

      {(status === 'OTHER_INSECT' || status === 'NON_TARGET_INSECT') && (
        <div className="bg-amber-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-amber-900">
            <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅଣ-ଲକ୍ଷ୍ୟ / ବନ୍ଧୁ କୀଟ ଚିହ୍ନଟ (କ୍ଷତିକାରକ ନୁହେଁ)' : 'Non-Target / Beneficial Arthropod Detected'}</span>
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed">
            {lang === 'or'
              ? `ଫଟୋରେ ଥିବା କୀଟଟି ${cropName} ଫସଲ ପାଇଁ କ୍ଷତିକାରକ ନୁହେଁ। ଏହା ଏକ ବନ୍ଧୁ କୀଟ (ଯଥା: ବୁଢ଼ିଆଣୀ, ଲେଡିବାର୍ଡ୍ ବିଟଲ୍) କିମ୍ବା ନିରପେକ୍ଷ ଜୀବ ହୋଇପାରେ। କୀଟନାଶକ ସିଞ୍ଚନ ସମ୍ପୂର୍ଣ୍ଣ ନିଷେଧ।`
              : `The insect detected does not damage ${cropName}. It represents natural biodiversity or a predatory beneficial insect. Chemical pesticide recommendations are strictly withheld.`}
          </p>
        </div>
      )}

      {status === 'HEALTHY_CROP' && (
        <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 text-emerald-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
            <span>{lang === 'or' ? `ସୁସ୍ଥ ${cropName} ଫସଲ (ଶୂନ୍ୟ କୀଟନାଶକ ଆବଶ୍ୟକ)` : `Healthy ${cropName} Crop (Zero Intervention Needed)`}</span>
          </div>
          <p className="text-sm text-emerald-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଓ ସତେଜ ଅଛି। କୌଣସି ପୋକ ବା ରୋଗର ଲକ୍ଷଣ ନାହିଁ। କୌଣସି ରାସାୟନିକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।'
              : 'Foliage displays intact tissues with zero economic pest injury. Applying synthetic chemicals will destroy natural biological control and waste money.'}
          </p>
        </div>
      )}

      {status === 'CROP_DAMAGE_NO_VISIBLE_INSECT' && (
        <div className="bg-orange-50 rounded-3xl p-5 sm:p-6 border-2 border-orange-300 text-orange-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-orange-900">
            <AlertTriangle className="w-6 h-6 text-orange-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ପତ୍ରରେ କ୍ଷତି ଅଛି (କିନ୍ତୁ ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ)' : 'Crop Damage Visible (Insect Absent)'}</span>
          </div>
          <p className="text-sm text-orange-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ପତ୍ରରେ କ୍ଷତି ବା ରଙ୍ଗ ପରିବର୍ତ୍ତନ ଅଛି, କିନ୍ତୁ କୌଣସି ପୋକର ଶରୀର ଦେଖାଯାଉନାହିଁ। କେବଳ ପତ୍ର କ୍ଷତିରୁ ପୋକ ଚିହ୍ନଟ ସମ୍ଭବ ନୁହେଁ। ଗଛ ମୂଳ ଓ ପତ୍ର ସନ୍ଧିରୁ ଜୀବନ୍ତ ପୋକ ଖୋଜି ତାର ଫଟୋ ଉଠାନ୍ତୁ।'
              : 'Plant tissue damage is visible, but the causal insect is absent in the photograph. Fungal diseases or past feeding look identical. Inspect stem bases or leaf sheaths and photograph the live pest.'}
          </p>
        </div>
      )}

      {status === 'UNCLEAR_IMAGE' && (
        <div className="bg-slate-100 rounded-3xl p-5 sm:p-6 border-2 border-slate-300 text-slate-900 space-y-2">
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
        <div className="bg-rose-50 rounded-3xl p-5 sm:p-6 border-2 border-rose-300 text-rose-950 space-y-2">
          <div className="flex items-center space-x-2.5 font-extrabold text-base sm:text-lg text-rose-900">
            <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅଣ-କୃଷି ଫଟୋ ପ୍ରତ୍ୟାଖ୍ୟାତ' : 'Non-Agricultural Image Rejected'}</span>
          </div>
          <p className="text-sm text-rose-900/90 leading-relaxed">
            {lang === 'or'
              ? 'ଏହି ଫଟୋରେ କୌଣସି ଫସଲ କିମ୍ବା କୃଷି କୀଟ ନାହିଁ। କୃଷି ମିତ୍ର AI ଅଣ-କୃଷି ବସ୍ତୁ ପାଇଁ ମନଗଢ଼ା କୀଟ ନାମ ସୃଷ୍ଟି କରେ ନାହିଁ।'
              : 'The uploaded image contains an automobile, human subject, or non-agricultural item. The system rejects this scan and refuses to manufacture an insect classification.'}
          </p>
        </div>
      )}

      {/* CORE SPECIMEN DOSSIER CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 space-y-6">
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

        {/* PHOTOGRAPH COMPARISON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{lang === 'or' ? '୨. ବୈଜ୍ଞାନିକ ପ୍ରମାଣିକ ନମୁନା' : '2. Verified Reference Specimen'}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {referenceImage ? referenceImage.sourceName.split('/')[0] : 'Reference Benchmark'}
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
                  <span>{lang === 'or' ? 'ଅସମର୍ଥିତ ବା ଅନିଶ୍ଚିତ ନମୁନା ପାଇଁ ପ୍ରମାଣିକ ଫଟୋ ଉପଲବ୍ଧ ନାହିଁ' : 'Reference photograph available for verified pests only'}</span>
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-agri-100 text-agri-800">
              {lang === 'or' ? `ଫସଲ: ${cropInfo?.commonNameOr || 'ଧାନ'}` : `Crop: ${cropInfo?.commonNameEn || 'Paddy'}`}
            </span>
            {report.plantPart && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {lang === 'or' ? `ଅଂଶ: ${report.plantPart}` : `Part: ${report.plantPart}`}
              </span>
            )}
          </div>

          {/* TELEMETRY & CONFIDENCE PILLS */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {confidence !== null ? (
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center space-x-1.5 ${confidenceColor}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confidenceLabel}: {confidence}%</span>
                <span className="text-[10px] font-normal text-slate-500">
                  ({report.confidenceType === 'benchmark_reference' ? 'Curated Reference Value' : 'Model Raw Score'})
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

            {/* Odia Audio Control Group */}
            <div className="flex items-center space-x-1.5 flex-wrap gap-1">
              {audioState === 'loading' ? (
                <button
                  disabled
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                  <span>{lang === 'or' ? 'ଅଡିଓ ପ୍ରସ୍ତୁତ ହେଉଛି...' : 'Generating Audio...'}</span>
                </button>
              ) : audioState === 'error' ? (
                <button
                  onClick={handleAudioNarration}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 shadow-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'or' ? 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ' : 'Retry Audio'}</span>
                </button>
              ) : audioState === 'playing' || audioState === 'paused' ? (
                <div className="flex items-center space-x-1 bg-white/90 p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    onClick={handleAudioNarration}
                    className="min-h-[44px] px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 bg-agri-700 hover:bg-agri-800 text-white transition-colors"
                  >
                    {audioState === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{audioState === 'playing' ? (lang === 'or' ? 'ରଖନ୍ତୁ' : 'Pause') : (lang === 'or' ? 'ଚଲାନ୍ତୁ' : 'Resume')}</span>
                  </button>

                  <button
                    onClick={handleReplayAudio}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
                    title={lang === 'or' ? 'ପୁନର୍ବାର ଶୁଣନ୍ତୁ' : 'Replay'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleStopAudio}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                    title={lang === 'or' ? 'ଅଡିଓ ବନ୍ଦ କରନ୍ତୁ' : 'Stop'}
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAudioNarration}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 bg-lime-500 hover:bg-lime-400 text-agri-950 shadow-sm transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' : 'Listen in Odia'}</span>
                </button>
              )}
            </div>
          </div>
          {audioState === 'error' && audioError && (
            <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{audioError}</span>
            </div>
          )}
        </div>

        {/* DETAILED CROP DAMAGE ANALYSIS */}
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

        {/* EDUCATIONAL INTEGRATED PEST MANAGEMENT (IPM) & CONFIRMATION PROTOCOL */}
        {isTreatmentAllowed && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                {lang === 'or' 
                  ? 'ସମନ୍ୱିତ କୀଟ ପରିଚାଳନା (IPM) ନିୟମାବଳୀ ଓ କ୍ଷେତ୍ର ଯାଞ୍ଚ ସତର୍କତା' 
                  : 'Integrated Pest Management (IPM) & Field Scouting Advisory'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/90 leading-relaxed">
              {lang === 'or'
                ? `ଏହି ଚିହ୍ନଟ AI ମଡେଲ ଆଧାରିତ ଏକ ସମ୍ଭାବ୍ୟ ନିରୀକ୍ଷଣ। କେବଳ ଏକ ଫଟୋ ଆଧାରରେ ରାସାୟନିକ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। କ୍ଷେତରେ ଯାଞ୍ଚ କରି କ୍ଷତିର ମାତ୍ରା (ETL) ନିର୍ଦ୍ଧାରଣ କରନ୍ତୁ ଏବଂ ନିକଟସ୍ଥ KVK ବିଶେଷଜ୍ଞ କିମ୍ବା କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।`
                : 'This identification is an automated, suspected field diagnosis. Do not spray synthetic chemical pesticides solely based on photograph detection. Scout plants to confirm that insect density exceeds the Economic Threshold Level (ETL), and prioritize cultural/biological methods before chemical intervention.'}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS & TREATMENT GATING */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          {isTreatmentAllowed ? (
            <button
              onClick={onNavigateTreatments}
              className="min-h-[44px] flex-1 py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Sprout className="w-5 h-5 text-lime-300" />
              <span>{lang === 'or' ? '୩-ସ୍ତରୀୟ ସମନ୍ୱିତ ଉପଚାର ପରାମର୍ଶ ଦେଖନ୍ତୁ' : 'View 3-Tier Treatment & IPM Protocols'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="min-h-[44px] flex-1 py-3 px-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center space-x-2">
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
            className={`min-h-[44px] py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
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
            className={`min-h-[44px] py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
              escalated
                ? 'bg-lime-50 text-agri-900 border-lime-300'
                : 'bg-white hover:bg-slate-50 text-agri-900 border-slate-300 shadow-sm'
            }`}
          >
            <UserCheck className="w-4 h-4 text-agri-700" />
            <span>{escalated ? (lang === 'or' ? 'KVK କୁ ପଠାଗଲା' : 'Escalated to KVK') : t.ctaEscalateExpert}</span>
          </button>

          <button
            onClick={() => setShowFlagModal(true)}
            disabled={reportFlagged}
            className={`min-h-[44px] py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-1.5 border transition-all ${
              reportFlagged
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-sm'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-600" />
            <span>{reportFlagged ? (lang === 'or' ? 'ଅଭିଯୋଗ ଦାଖଲ ହେଲା' : 'Flagged') : (lang === 'or' ? 'ଭୁଲ ଚିହ୍ନଟ ଜଣାନ୍ତୁ' : 'Report Wrong Pest')}</span>
          </button>
        </div>

        {/* Contextual Cross-Module Actions: Krushi Store & Expert Support */}
        <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-4 border border-lime-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {lang === 'or' ? 'ନିରୀକ୍ଷଣ ପରବର୍ତ୍ତୀ ଉପଚାର ଓ ସହାୟତା ପଦକ୍ଷେପ:' : 'Post-Diagnosis Procurement & Scientist Consultation:'}
            </h4>
            <p className="text-[11px] text-slate-600">
              {lang === 'or'
                ? 'ଏହି ଫସଲ ସମସ୍ୟା ପାଇଁ ପ୍ରମାଣିତ ଜୈବିକ ଔଷଧ/ଫାନ୍ଦ ଅର୍ଡର କରନ୍ତୁ କିମ୍ବା ବୈଜ୍ଞାନିକଙ୍କ ସହ ସିଧାସଳଖ ଆଲୋଚନା କରନ୍ତୁ।'
                : 'Order verified inputs for this diagnosis or consult directly with an agricultural scientist.'}
            </p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto flex-shrink-0">
            {onFindProducts && (
              <button
                onClick={() => onFindProducts(report.cropId, report.identification?.pestId)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-agri-800 hover:bg-agri-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-lime-300" />
                <span>{lang === 'or' ? 'ଅନୁକୂଳ ଉତ୍ପାଦ ଖୋଜନ୍ତୁ' : 'Find Relevant Products'}</span>
              </button>
            )}
            {onDiscussWithExpert && (
              <button
                onClick={() => onDiscussWithExpert(report)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-lime-500 hover:bg-lime-400 text-agri-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{lang === 'or' ? 'ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ' : 'Discuss With an Expert'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showFlagModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2.5 text-rose-800 font-bold text-base">
              <Flag className="w-5 h-5 text-rose-600" />
              <span>{lang === 'or' ? 'ଭୁଲ ଚିହ୍ନଟ ଅଭିଯୋଗ (Farmer Feedback)' : 'Report Incorrect Identification'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'or'
                ? 'ଯଦି ଆପଣ ଭାବୁଛନ୍ତି AI ଦ୍ୱାରା ଦିଆଯାଇଥିବା କୀଟ ଚିହ୍ନଟ ଭୁଲ ଅଟେ, ତେବେ ଦୟାକରି ଆପଣଙ୍କ ମତାମତ ଲେଖନ୍ତୁ। ଏହା ମଡେଲକୁ ଉନ୍ନତ କରିବାରେ ସାହାଯ୍ୟ କରିବ।'
                : 'If you believe this diagnosis is inaccurate, please describe your observation. This is flagged for entomological retraining.'}
            </p>
            <textarea
              value={flagFeedback}
              onChange={(e) => setFlagFeedback(e.target.value)}
              placeholder={lang === 'or' ? 'ଉଦାହରଣ: ଏହା ମକା ଫସଲରେ ଫଲ୍ ଆର୍ମିୱାର୍ମ ପରି ଦେଖାଯାଉଛି...' : 'e.g. This looks like fall armyworm on maize leaves...'}
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFlagModal(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {lang === 'or' ? 'ବାତିଲ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleFlagReport}
                className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                {lang === 'or' ? 'ଦାଖଲ କରନ୍ତୁ' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
