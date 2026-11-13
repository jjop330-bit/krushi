import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sprout, 
  Wrench, 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Droplets, 
  Clock, 
  ShieldAlert, 
  HeartHandshake,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ScanReport, PestId } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';

interface TreatmentEngineProps {
  report: ScanReport;
  lang: 'or' | 'en';
  onNavigateAssistant: () => void;
  onFollowUpSchedule: () => void;
}

export const TreatmentEngine: React.FC<TreatmentEngineProps> = ({
  report,
  lang,
  onNavigateAssistant,
  onFollowUpSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'biological' | 'cultural' | 'chemical'>('biological');
  const t = ODIA_TRANSLATIONS[lang];
  const pestId = report.identification.pestId;
  const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;

  const isBeneficialOrHealthy = pestId === 'beneficial_spider' || pestId === 'healthy_paddy';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ସମନ୍ୱିତ କୀଟ ପରିଚାଳନା (IPM)' : '3-Tier Integrated Pest Management'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                CIBRC &amp; ICAR-NRRI Validated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ସ୍ମାର୍ଟ ଉପଚାର ପରାମର୍ଶ ମଞ୍ଚ' : 'Smart Treatment Recommendation Engine'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? `${knowledge.commonNameOr} ପାଇଁ ପରିବେଶ-ଉପଯୋଗୀ ଜୈବିକ, ଚାଷ ପଦ୍ଧତି ଓ ସୁରକ୍ଷିତ ରାସାୟନିକ ଉପଚାର।`
                : `Actionable, scientifically verified management protocols for ${knowledge.commonNameEn} in Odisha rice ecosystems.`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">{lang === 'or' ? 'ଲକ୍ଷ୍ୟ କୀଟ:' : 'Target Pest:'}</span>
            <span className="text-sm font-extrabold text-agri-900">
              {lang === 'or' ? knowledge.commonNameOr : knowledge.commonNameEn}
            </span>
          </div>
        </div>

        {/* Responsible Stewardship Alert */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs text-emerald-950 flex items-start space-x-3">
          <HeartHandshake className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900 block">
              {lang === 'or' ? 'ପରିବେଶ ଅନୁକୂଳ ପରାମର୍ଶ ନୀତି (Biological-First Mandate):' : 'Responsible Agricultural Principle:'}
            </span>
            <p className="mt-0.5">
              {lang === 'or'
                ? 'କୀଟ ଦେଖିବା ମାତ୍ରେ ରାସାୟନିକ ବିଷ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ପ୍ରଥମେ କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ, ଆଲି ଛାଡ଼ିବା ଓ ବନ୍ଧୁ କୀଟଙ୍କ ସଂରକ୍ଷଣ କରନ୍ତୁ। ପୋକ ସଂଖ୍ୟା ETL ଅତିକ୍ରମ କଲେ ହିଁ ଅନୁମୋଦିତ ମାତ୍ରାରେ ଔଷଧ ସିଞ୍ଚନ କରନ୍ତୁ।'
                : 'Do not spray chemical insecticides indiscriminately upon sighting insects. Always implement cultural adjustments and biological conservation first. Chemical controls are reserved only when field sampling confirms populations exceeding Economic Threshold Levels (ETL).'}
            </p>
          </div>
        </div>

        {/* 3-Tier Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('biological')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'biological'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{t.biologicalTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('cultural')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'cultural'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{t.culturalTab}</span>
          </button>

          <button
            onClick={() => setActiveTab('chemical')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'chemical'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{t.chemicalTab}</span>
          </button>
        </div>
      </div>

      {/* Special Case: Beneficial Predator or Healthy Crop */}
      {isBeneficialOrHealthy && (
        <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-300 text-emerald-950 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            <h3>{lang === 'or' ? 'କୌଣସି ରାସାୟନିକ ସିଞ୍ଚନର ଆବଶ୍ୟକତା ନାହିଁ' : 'Zero Chemical Intervention Required'}</h3>
          </div>
          <p className="text-sm">
            {lang === 'or'
              ? 'ଚିହ୍ନଟ ହୋଇଥିବା କୀଟ ଚାଷୀଙ୍କ ପରମ ବନ୍ଧୁ କିମ୍ବା ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ସୁସ୍ଥ ଅଛି। ଏହି କ୍ଷେତ୍ରରେ କୀଟନାଶକ ପ୍ରୟୋଗ କଲେ ଖର୍ଚ୍ଚ ବୃଦ୍ଧି ପାଇବା ସହ ବନ୍ଧୁ ପୋକ ନଷ୍ଟ ହେବେ। କେବଳ ନିୟମିତ କ୍ଷେତ ଯାଞ୍ଚ କରନ୍ତୁ।'
              : 'The specimen is a beneficial predatory natural enemy (Lycosa spider) or healthy rice crop foliage. Applying synthetic chemical pesticides will destroy the natural biological equilibrium, eradicate beneficial predators, and waste farmer capital.'}
          </p>
        </div>
      )}

      {/* TAB 1: BIOLOGICAL CONTROL */}
      {activeTab === 'biological' && !isBeneficialOrHealthy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'or' ? 'ଜୈବିକ ଓ ପ୍ରାକୃତିକ ଶତ୍ରୁ କୀଟ ସଂରକ୍ଷଣ' : 'Biological Control & Beneficial Predators'}</span>
            </h2>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              100% Eco-Safe
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {knowledge.biologicalControl.map((bio, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {lang === 'or' ? bio.titleOr : bio.titleEn}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {bio.safetyRating}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Target: {bio.targetStage}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {lang === 'or' ? bio.descriptionOr : bio.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CULTURAL & MECHANICAL CONTROL */}
      {activeTab === 'cultural' && !isBeneficialOrHealthy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              <span>{lang === 'or' ? 'ଚାଷ ପଦ୍ଧତି ଓ ଯାନ୍ତ୍ରିକ ନିୟନ୍ତ୍ରଣ' : 'Cultural, Agronomic & Mechanical Management'}</span>
            </h2>
            <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Zero Chemical Cost
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {knowledge.culturalControl.map((cult, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-amber-300 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {lang === 'or' ? cult.titleOr : cult.titleEn}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                    {cult.actionTiming}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lang === 'or' ? cult.descriptionOr : cult.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REGULATED CHEMICAL CONTROL (STRICT CIBRC STANDARDS) */}
      {activeTab === 'chemical' && !isBeneficialOrHealthy && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-rose-600" />
              <span>{lang === 'or' ? 'ଅନୁମୋଦିତ ରାସାୟନିକ ଉପଚାର (CIBRC / ICAR-NRRI)' : 'Registered Chemical Control (CIBRC Approved)'}</span>
            </h2>
            <span className="text-xs text-rose-800 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Strict Safety Required
            </span>
          </div>

          {/* ETL Threshold Condition */}
          <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900 block">
                {lang === 'or' ? 'ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (Economic Threshold Level - ETL):' : 'Economic Threshold Level (ETL) Condition:'}
              </span>
              <p className="mt-0.5">
                {lang === 'or' ? knowledge.economicThresholdLevelOr : knowledge.economicThresholdLevelEn}
              </p>
              <p className="mt-1 font-bold text-rose-900">
                {lang === 'or' 
                  ? 'ପୋକ ସଂଖ୍ୟା ଏହି ସୀମା ଟପିଲେ ହିଁ ତଳେ ଥିବା କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ।'
                  : 'Apply chemical insecticides strictly after ETL is reached to prevent pesticide resistance and unnecessary costs.'}
              </p>
            </div>
          </div>

          {/* Molecule Cards */}
          <div className="grid grid-cols-1 gap-4">
            {knowledge.chemicalControl.map((chem, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {chem.activeIngredient}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Common Registered Trade Names: <strong>{chem.tradeNames.join(', ')}</strong>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                      {chem.toxicityClass}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-agri-100 text-agri-900 text-[10px] font-bold">
                      CIBRC Validated
                    </span>
                  </div>
                </div>

                {/* Dosage & PHI Specs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center space-x-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'or' ? 'ସୁପାରିଶ ମାତ୍ରା' : 'Dosage Per Acre'}</span>
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm mt-1 block">
                      {chem.dosagePerAcre}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center space-x-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'or' ? 'ପାଣି ପରିମାଣ' : 'Water Volume'}</span>
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm mt-1 block">
                      {chem.waterVolumePerAcre}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px] font-medium flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'or' ? 'ଅମଳ ଅପେକ୍ଷା ସମୟ (PHI)' : 'Waiting Period (PHI)'}</span>
                    </span>
                    <span className="text-slate-900 font-extrabold text-sm mt-1 block">
                      {chem.phiDays} {lang === 'or' ? 'ଦିନ' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Safety & Spray Directions */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs space-y-2">
                  <span className="font-bold text-amber-900 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>{lang === 'or' ? 'ସୁରକ୍ଷା ସତର୍କତା ଓ ନିୟମ:' : 'Personal Safety Precautions & PPE:'}</span>
                  </span>
                  <p className="text-amber-950 leading-relaxed">
                    {lang === 'or' ? chem.safetyPrecautionsOr : chem.safetyPrecautionsEn}
                  </p>
                  <p className="text-slate-600 pt-1 font-medium">
                    <strong>{lang === 'or' ? 'ସ୍ପ୍ରେ ପଦ୍ଧତି:' : 'Nozzle & Spray Method: '}</strong>
                    {chem.waterSprayInstructions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When to Consult Agricultural Expert */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center space-x-2 text-agri-900 font-bold text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3>{lang === 'or' ? 'କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ପରାମର୍ଶ କେବେ ଜରୁରୀ?' : 'When Must an Agricultural Expert Be Consulted?'}</h3>
        </div>
        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
          {(lang === 'or' ? knowledge.expertConsultationCriteriaOr : knowledge.expertConsultationCriteriaEn).map((crit, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 flex-shrink-0"></span>
              <span>{crit}</span>
            </li>
          ))}
        </ul>

        <div className="pt-3 flex flex-wrap gap-3">
          <button
            onClick={onFollowUpSchedule}
            className="px-4 py-2.5 rounded-xl bg-agri-800 text-lime-300 font-bold text-xs sm:text-sm flex items-center space-x-2"
          >
            <span>{lang === 'or' ? 'ପରବର୍ତ୍ତୀ ଯାଞ୍ଚ (Follow-up) ଧାର୍ଯ୍ୟ କରନ୍ତୁ' : 'Schedule Day-7 Follow-up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateAssistant}
            className="px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-agri-950 font-bold text-xs sm:text-sm flex items-center space-x-2"
          >
            <span>{lang === 'or' ? 'ଓଡ଼ିଆ AI ସାଥୀଙ୍କୁ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ' : 'Ask AI Saathi Questions'}</span>
            <ArrowRight className="w-4 h-4 text-agri-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
