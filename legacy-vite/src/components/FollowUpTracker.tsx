import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  Camera, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { ScanReport, FollowUpScan } from '../types/pest';
import { StorageService } from '../services/storageService';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';

interface FollowUpTrackerProps {
  lang: 'or' | 'en';
  reports: ScanReport[];
  activeReport: ScanReport | null;
  onSelectReport: (report: ScanReport) => void;
}

export const FollowUpTracker: React.FC<FollowUpTrackerProps> = ({
  lang,
  reports,
  activeReport,
  onSelectReport
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(activeReport?.id || reports[0]?.id || '');
  const [treatmentDate, setTreatmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [treatmentMethod, setTreatmentMethod] = useState<string>('Alternate Wetting & Drying + Neem Azadirachtin 1500ppm');
  const [followUpNote, setFollowUpNote] = useState<string>('');
  const [isLoggingFollowUp, setIsLoggingFollowUp] = useState<boolean>(false);
  const [simulatedFollowUpPhoto, setSimulatedFollowUpPhoto] = useState<string | null>(null);

  const t = ODIA_TRANSLATIONS[lang];
  const targetReport = reports.find(r => r.id === selectedReportId) || activeReport || reports[0];

  const handleSaveTreatmentLog = () => {
    if (!targetReport) return;
    targetReport.treatmentApplied = {
      date: treatmentDate,
      category: 'biological',
      methodName: treatmentMethod,
      weatherCondition: 'Clear sunny morning, 29°C'
    };
    StorageService.saveReport(targetReport);
    alert(lang === 'or' ? 'ଉପଚାର ବିବରଣୀ ସଫଳତାର ସହ ଲଗ୍ ହେଲା!' : 'Treatment application successfully logged in crop record!');
  };

  const handleSimulateFollowUpScan = () => {
    if (!targetReport) return;

    // Create a follow-up scan entry (Day 7)
    const newFollowUp: FollowUpScan = {
      id: `fu-${Date.now()}`,
      scanDate: new Date().toLocaleDateString(),
      daysAfterTreatment: 7,
      imageUri: targetReport.imageUri, // Simulating refreshed inspection photograph
      visualObservationEn: 'Leaf chlorosis stabilized; no fresh honeydew or dead hearts detected. Nymph counts reduced below Economic Threshold Level (ETL).',
      visualObservationOr: 'ପତ୍ର ଶୁଖିବା ସ୍ଥିର ହୋଇଛି ଏବଂ ନୂତନ ପୋକ ଆକ୍ରମଣ ଦେଖାଯାଇ ନାହିଁ। ପୋକ ସଂଖ୍ୟା କ୍ଷତିକାରକ ସୀମା (ETL) ତଳକୁ ଖସିଛି।',
      symptomTrend: 'improving',
      confidenceScore: 91,
      notes: followUpNote || 'Day 7 post-treatment inspection conducted at 8:00 AM.'
    };

    StorageService.addFollowUp(targetReport.id, newFollowUp);
    setIsLoggingFollowUp(false);
    setFollowUpNote('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ପରବର୍ତ୍ତୀ କ୍ଷେତ ଯାଞ୍ଚ' : 'Follow-Up Inspection & Recovery'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Longitudinal Crop Health Tracker
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ଉପଚାର ପରବର୍ତ୍ତୀ ଫସଲ ମନିଟରିଂ' : 'Post-Treatment Follow-up & Recovery Tracker'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ଔଷଧ ବା ପଦ୍ଧତି ପ୍ରୟୋଗ ପରେ ୩ୟ, ୭ମ ଓ ୧୪ଶ ଦିନରେ ନୂଆ ଫଟୋ ଅପଲୋଡ୍ କରି ତୁଳନା କରନ୍ତୁ।'
                : 'Upload follow-up photographs at 3, 7, and 14 days post-intervention to track visual symptom progression and pest recovery.'}
            </p>
          </div>
        </div>

        {/* Scientific Humility Note */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 block">
              {lang === 'or' ? 'ବୈଜ୍ଞାନିକ ସତର୍କତା (Scientific Integrity Disclaimer):' : 'Scientific Transparency Notice:'}
            </span>
            <p className="mt-0.5">
              {lang === 'or'
                ? 'ଫଟୋରେ ସାମାନ୍ୟ ସବୁଜିମା ଦେଖାଯିବା ଅର୍ଥ ନୁହେଁ ଯେ ପୋକ ସମ୍ପୂର୍ଣ୍ଣ ବିଲୋପ ହୋଇସାରିଛି। ଧାନ ଗଛ ମୂଳ ଓ ପତ୍ର ତଳେ ଥିବା ପୋକର ଅଣ୍ଡା ୪-୬ ଦିନ ମଧ୍ୟରେ ପୁଣି ଫୁଟିପାରେ। ତେଣୁ ସମ୍ପୂର୍ଣ୍ଣ ୧୪ ଦିନ ଯାଞ୍ଚ ଜାରି ରଖନ୍ତୁ।'
                : 'Visual recovery in leaf color does not definitively prove pest eradication. Insect egg batches and resting pupae may hatch in subsequent days. Continue scouting until the entire 14-day recovery cycle is complete.'}
            </p>
          </div>
        </div>
      </div>

      {targetReport ? (
        <div className="space-y-6">
          {/* Active Inspection Session Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Baseline Record</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {lang === 'or' ? targetReport.identification.commonNameOr : targetReport.identification.commonNameEn}
                </h3>
                <p className="text-xs text-slate-500">
                  Initial Scan: {new Date(targetReport.createdAt).toLocaleDateString()} • Severity: <strong>{targetReport.severityAssessment}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-xl bg-agri-100 text-agri-900 text-xs font-bold">
                  {lang === 'or' ? 'ଧାନ ଫସଲ' : 'Paddy Crop'}
                </span>
              </div>
            </div>

            {/* Side-by-Side Visual Comparison (Day 0 vs Day 7 Follow-Up) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day 0 Initial Scan Photo */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800">
                    {lang === 'or' ? 'ଦିନ ୦: ପ୍ରଥମ ସ୍କାନ୍' : 'Day 0: Initial Diagnosis'}
                  </span>
                  <span className="text-slate-500">Baseline</span>
                </div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img src={targetReport.imageUri} alt="Baseline" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-slate-600">
                  Observation: {targetReport.observedVisualFeatures[0]}
                </p>
              </div>

              {/* Day 7 Follow-Up Scan Photo */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'or' ? 'ଦିନ ୭: ପରବର୍ତ୍ତୀ ଯାଞ୍ଚ (Follow-Up)' : 'Day 7: Inspection Check'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Improving
                  </span>
                </div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-emerald-300">
                  <img src={targetReport.imageUri} alt="Follow-up" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-emerald-900 font-medium">
                  {lang === 'or' 
                    ? '୭ମ ଦିନର ଫଳାଫଳ: କ୍ଷେତରେ ନୂତନ ପୋକ ସଂଖ୍ୟା ହ୍ରାସ ପାଇଛି। ପତ୍ର ସବୁଜ ରଙ୍ଗ ଫେରୁଛି।' 
                    : 'Day 7 Post-Intervention: Fresh hopper clusters ceased; tiller sheaths exhibit regeneration.'}
                </p>
              </div>
            </div>

            {/* Treatment Applied Log Form */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-agri-700" />
                <span>{lang === 'or' ? 'ପ୍ରୟୋଗ କରାଯାଇଥିବା ଉପଚାର ତଥ୍ୟ ଲଗ୍ କରନ୍ତୁ' : 'Log Applied Treatment Details'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'or' ? 'ଉପଚାର ତାରିଖ' : 'Application Date'}
                  </label>
                  <input
                    type="date"
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'or' ? 'ପ୍ରୟୋଗ କରାଯାଇଥିବା ପଦ୍ଧତି / ଔଷଧ' : 'Applied Protocol / Molecule'}
                  </label>
                  <input
                    type="text"
                    value={treatmentMethod}
                    onChange={(e) => setTreatmentMethod(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveTreatmentLog}
                className="px-4 py-2 rounded-xl bg-agri-800 hover:bg-agri-900 text-lime-300 font-bold text-xs transition-colors"
              >
                {lang === 'or' ? 'ଉପଚାର ଲଗ୍ ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save Treatment Log'}
              </button>
            </div>

            {/* Upload Day 14 Follow-up Photo Trigger */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-500">
                Next scheduled inspection reminder: <strong>Day 14 (12th Nov 2026)</strong>
              </div>
              <button
                onClick={handleSimulateFollowUpScan}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-agri-950 font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'or' ? 'ଆଜିର ଫଟୋ ଉଠାଇ ଯାଞ୍ଚ କରନ୍ତୁ' : 'Record Fresh Follow-Up Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-3 border border-slate-200">
          <CalendarCheck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">
            {lang === 'or' ? 'କୌଣସି ସକ୍ରିୟ ସ୍କାନ୍ ରେକର୍ଡ ନାହିଁ' : 'No Active Scan Records Available'}
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            {lang === 'or' 
              ? 'ପ୍ରଥମେ AI ସ୍କାନର ବ୍ୟବହାର କରି ଏକ ଫଟୋ ସ୍କାନ୍ କରନ୍ତୁ। ସେହି ରିପୋର୍ଟ ଏଠାରେ ମନିଟରିଂ ପାଇଁ ଯୋଡ଼ି ହୋଇଯିବ।'
              : 'Scan your first crop photo using the AI Pest Scanner to initiate the longitudinal follow-up tracker.'}
          </p>
        </div>
      )}
    </div>
  );
};
