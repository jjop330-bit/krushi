import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Download, 
  Bookmark, 
  Send, 
  ArrowRight, 
  Bug, 
  Info, 
  HelpCircle,
  FileCheck,
  Building2,
  Calendar,
  Share2
} from 'lucide-react';
import { ScanReport, PestId } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';
import { voiceService } from '../services/voiceService';
import { StorageService } from '../services/storageService';

interface PestReportProps {
  report: ScanReport;
  lang: 'or' | 'en';
  onNavigateTreatments: () => void;
  onFollowUpSchedule: () => void;
  onEscalate: () => void;
}

export const PestReport: React.FC<PestReportProps> = ({
  report,
  lang,
  onNavigateTreatments,
  onFollowUpSchedule,
  onEscalate
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [escalated, setEscalated] = useState(report.expertReviewRequired);

  const t = ODIA_TRANSLATIONS[lang];
  const pestId = report.identification.pestId;
  const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;

  // Confidence color
  const confidence = report.identification.confidence;
  const confidenceColor = 
    confidence >= 85 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    confidence >= 70 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-rose-600 bg-rose-50 border-rose-200';

  const handleAudioNarration = () => {
    if (isPlayingAudio) {
      voiceService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    let speechText = '';

    if (lang === 'or') {
      speechText = `କୃଷି ମିତ୍ର AI ନିରୀକ୍ଷଣ: ଆପଣଙ୍କ ଧାନ ଫସଲରେ ${knowledge.commonNameOr} ର ଲକ୍ଷଣ ଦେଖାଯାଇଛି। ସଠିକତା ଶତକଡ଼ା ${confidence} ଭାଗ। ${knowledge.keySymptomsOr[0]} ତୁରନ୍ତ ପଦକ୍ଷେପ: ${knowledge.immediateNextStepsOr[0]}`;
    } else {
      speechText = `Krushi Mitra AI diagnostic summary: Visual features indicate ${knowledge.commonNameEn} with ${confidence} percent confidence. Primary symptom: ${knowledge.keySymptomsEn[0]}. Immediate recommended action: ${knowledge.immediateNextStepsEn[0]}`;
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
      {/* Top Banner Card: Identification & Speech Audio */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Photograph Thumbnail with Zoom/Badge */}
          <div className="w-full md:w-56 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative flex-shrink-0">
            <img 
              src={report.imageUri} 
              alt={report.identification.commonNameEn}
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
              {report.sourceModel === 'gemini-1.5-flash' ? 'Gemini Vision AI' : 'Verified Field Specimen'}
            </div>
          </div>

          {/* Core Diagnostic Headline */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'or' ? 'କୃଷି ନିରୀକ୍ଷଣ ରିପୋର୍ଟ' : 'Agro-Diagnostic Intelligence Report'}
              </span>
              <span className="text-xs text-slate-400">
                ID: {report.id.substring(0, 16)} • {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {lang === 'or' ? report.identification.commonNameOr : report.identification.commonNameEn}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-sm font-semibold italic text-slate-600">
                {report.identification.scientificName}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                {knowledge.localOdishaName}
              </span>
            </div>

            {/* Confidence & Certainty Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center space-x-1.5 ${confidenceColor}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confidenceLabel}: {confidence}%</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center space-x-1">
                <span>{lang === 'or' ? 'ଗମ୍ଭୀରତା:' : 'Severity:'}</span>
                <span className={`font-black ${
                  report.severityAssessment === 'Severe' ? 'text-rose-600' :
                  report.severityAssessment === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {report.severityAssessment}
                </span>
              </div>

              {/* Audio Listen Button in Odia */}
              <button
                onClick={handleAudioNarration}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  isPlayingAudio 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-lime-500 hover:bg-lime-400 text-agri-950 shadow-sm'
                }`}
                title="Listen to diagnosis aloud in Odia"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio ? (lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Stop Audio') : (lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' : 'Listen in Odia')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onNavigateTreatments}
              className="px-5 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-lime-300 font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-lime-400" />
              <span>{lang === 'or' ? '୩-ସ୍ତରୀୟ ଉପଚାର ପରାମର୍ଶ ଦେଖନ୍ତୁ' : 'View 3-Tier IPM Treatments'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onFollowUpSchedule}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-colors"
            >
              <Calendar className="w-4 h-4 text-agri-700" />
              <span>{lang === 'or' ? 'ପରବର୍ତ୍ତୀ ଯାଞ୍ଚ (Follow-up)' : 'Follow-Up Scan'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveReport}
              disabled={isSaved}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 border transition-all ${
                isSaved 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'text-emerald-600 fill-emerald-600' : ''}`} />
              <span>{isSaved ? (lang === 'or' ? 'ସଂରକ୍ଷିତ ହେଲା' : 'Saved to Records') : t.ctaSaveReport}</span>
            </button>

            {!escalated ? (
              <button
                onClick={handleEscalateToKvk}
                className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center space-x-1"
                title="Escalate uncertain or high-risk case to local KVK"
              >
                <Building2 className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">{lang === 'or' ? 'KVK ବିଜ୍ଞାନୀ' : 'Escalate to KVK'}</span>
              </button>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center space-x-1">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>{lang === 'or' ? 'KVK କୁ ପଠାଗଲା' : 'Escalated to KVK'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Critical Scientific Distinction: Direct Observation vs AI Possibilities */}
      <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/80">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-amber-950">
            <h3 className="font-bold text-sm text-amber-900">
              {lang === 'or' ? 'ବିଜ୍ଞାନଭିତ୍ତିକ ସ୍ପଷ୍ଟୀକରଣ (Explainable AI Transparency):' : 'Explainable AI Diagnostic Separation:'}
            </h3>
            <p>
              <strong>{lang === 'or' ? '୧. ଫଟୋ-ଭିତ୍ତିକ ପ୍ରତ୍ୟକ୍ଷ ନିରୀକ୍ଷଣ:' : '1. Direct Image Observations: '}</strong>
              {report.observedVisualFeatures.join(' ')}
            </p>
            <p>
              <strong>{lang === 'or' ? '୨. AI-ଆଧାରିତ ସମ୍ଭାବ୍ୟ କ୍ଷତି ଆକଳନ:' : '2. AI-Inferred Crop Damage Possibility: '}</strong>
              {lang === 'or' ? report.aiInferredDamageOr : report.aiInferredDamage}
            </p>
            <p className="text-[11px] text-amber-800 italic pt-1">
              * {lang === 'or' 
                ? 'ଗୋଟିଏ ଫଟୋରୁ ସମଗ୍ର କ୍ଷେତର କ୍ଷତିର ମାତ୍ରା ନିର୍ଣ୍ଣୟ କରାଯାଇ ପାରିବ ନାହିଁ। କୌଣସି ରାସାୟନିକ ଔଷଧ ସିଞ୍ଚନ ପୂର୍ବରୁ କ୍ଷେତର ୧୦ଟି ଅଲଗା ସ୍ଥାନରେ ପୋକ ସଂଖ୍ୟା (ETL) ଗଣନା କରନ୍ତୁ।' 
                : 'Scientific Caution: Infestation severity cannot be inferred for an entire field from a single photograph. Always inspect at least 10 random hills across the field to determine the Economic Threshold Level (ETL) before applying chemical insecticides.'}
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Possibilities (Transparent AI Uncertainty) */}
      {report.alternativePossibilities && report.alternativePossibilities.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{lang === 'or' ? 'ଅନ୍ୟାନ୍ୟ ସମ୍ଭାବ୍ୟ ବିକଳ୍ପ (Alternative Possibilities)' : 'Differential Diagnoses / Alternative Possibilities'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'or' 
              ? 'ଯଦିଓ ମୁଖ୍ୟ ପୋକ ସର୍ବାଧିକ ସମ୍ଭାବ୍ୟ, ନିମ୍ନଲିଖିତ ପୋକଗୁଡ଼ିକ ମଧ୍ୟ ସମାନ ଲକ୍ଷଣ ଦେଖାଇପାରନ୍ତି:'
              : 'The vision model detected minor visual overlaps with these alternative rice species:'}
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.alternativePossibilities.map((alt, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">
                  {lang === 'or' ? alt.nameOr : alt.nameEn}
                </span>
                <span className="font-mono text-slate-500 font-bold">
                  {alt.confidence}% confidence
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms & Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Key Symptoms */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center space-x-2 text-agri-900 font-bold text-base">
            <Bug className="w-5 h-5 text-agri-700" />
            <h3>{lang === 'or' ? 'ପ୍ରମୁଖ ଆକ୍ରମଣ ଲକ୍ଷଣ' : 'Key Field Symptoms'}</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {(lang === 'or' ? knowledge.keySymptomsOr : knowledge.keySymptomsEn).map((symp, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-agri-700 mt-2 flex-shrink-0"></span>
                <span>{symp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Conditions Favoring Infestation */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3>{lang === 'or' ? 'ଅନୁକୂଳ ପରିବେଶ ଓ କାରଣ' : 'Conditions Favoring Outbreak'}</h3>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {(lang === 'or' ? knowledge.conditionsFavoringOr : knowledge.conditionsFavoringEn).map((cond, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                <span>{cond}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Immediate Next Steps Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'or' ? 'ଚାଷୀଙ୍କ ପାଇଁ ତୁରନ୍ତ ପଦକ୍ଷେପ' : 'Immediate Next Steps Checklist'}</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            {lang === 'or' ? 'ପ୍ରାଥମିକ କାର୍ଯ୍ୟ' : 'Priority 1'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(lang === 'or' ? knowledge.immediateNextStepsOr : knowledge.immediateNextStepsEn).map((step, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start space-x-3 text-xs sm:text-sm text-emerald-950">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Citations & Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
        <span className="font-bold text-slate-700 block">
          {lang === 'or' ? 'ଅନୁମୋଦିତ ବୈଜ୍ଞାନିକ ତଥ୍ୟ ସ୍ରୋତ:' : 'Validated Scientific References & Extension Literature:'}
        </span>
        <ul className="list-disc list-inside space-y-0.5">
          {knowledge.scientificReferences.map((ref, idx) => (
            <li key={idx}>{ref}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
