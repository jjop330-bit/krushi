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
  Sparkles,
  Lock,
  Unlock
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
  const [cropStage, setCropStage] = useState<'vegetative' | 'reproductive'>('vegetative');
  const [pestCountInput, setPestCountInput] = useState<string>('');
  const t = ODIA_TRANSLATIONS[lang];
  const pestId = report.identification.pestId;
  const knowledge = PEST_KNOWLEDGE_BASE[pestId] || PEST_KNOWLEDGE_BASE.uncertain;

  const isBeneficialOrHealthy = pestId === 'beneficial_spider' || pestId === 'healthy_paddy';
  const isTreatmentAllowed = Boolean(report.treatmentAllowed);

  const getEtlThreshold = () => {
    switch (pestId) {
      case 'bph':
        return {
          threshold: cropStage === 'vegetative' ? 5.0 : 15.0,
          unitLabel: lang === 'or' ? 'ଗୁଚ୍ଛ ପ୍ରତି ପୋକ (Hoppers/hill)' : 'Hoppers per hill',
          sampleGuidance: lang === 'or' ? 'କ୍ଷେତର ୧୦ଟି ସ୍ଥାନରୁ ଗଛ ମୂଳ ପରୀକ୍ଷା କରି ହାରାହାରି ପୋକ ସଂଖ୍ୟା ଲେଖନ୍ତୁ।' : 'Sample 10 random hills by gently shaking stem bases and counting hoppers.',
          standardText: cropStage === 'vegetative' ? '5 hoppers/hill (vegetative)' : '15 hoppers/hill (reproductive)'
        };
      case 'stem_borer':
        return {
          threshold: cropStage === 'vegetative' ? 5.0 : 1.0,
          unitLabel: cropStage === 'vegetative' 
            ? (lang === 'or' ? '% ମଜା ମରିବା (% Dead Hearts)' : '% Dead Hearts') 
            : (lang === 'or' ? '% ଧଳା ଶିଁଷା (% Whiteheads)' : '% Whiteheads'),
          sampleGuidance: cropStage === 'vegetative' 
            ? (lang === 'or' ? '୧୦୦ଟି ଗୁଚ୍ଛରୁ ମଜା ମରିଥିବା ଗଛର ପ୍ରତିଶତ ବାହାର କରନ୍ତୁ।' : 'Count dead heart tillers per 100 tillers sampled randomly.') 
            : (lang === 'or' ? '୧୦୦ଟି ଶିଁଷାରୁ ଧଳା ଶିଁଷାର ପ୍ରତିଶତ ବାହାର କରନ୍ତୁ।' : 'Count dry whiteheads per 100 panicles at heading stage.'),
          standardText: cropStage === 'vegetative' ? '5% dead hearts or 1 egg mass/m²' : '1% whiteheads'
        };
      case 'leaf_folder':
        return {
          threshold: cropStage === 'vegetative' ? 2.0 : 1.0,
          unitLabel: cropStage === 'vegetative' 
            ? (lang === 'or' ? 'କ୍ଷତିଗ୍ରସ୍ତ ପତ୍ର/ଗୁଚ୍ଛ (Damaged leaves/hill)' : 'Damaged leaves per hill') 
            : (lang === 'or' ? 'କ୍ଷତିଗ୍ରସ୍ତ ଧ୍ୱଜା ପତ୍ର/ଗୁଚ୍ଛ (Flag leaves/hill)' : 'Flag leaves per hill'),
          sampleGuidance: lang === 'or' ? '୧୦ଟି ଗୁଚ୍ଛରୁ ସକ୍ରିୟ ପୋକ ଥିବା ମୋଡ଼ା ପତ୍ର ଗଣନା କରନ୍ତୁ।' : 'Inspect 10 random hills and count folded leaves with live feeding larvae.',
          standardText: cropStage === 'vegetative' ? '2 damaged leaves/hill (tillering)' : '1 damaged flag leaf/hill (heading)'
        };
      case 'rice_hispa':
        return {
          threshold: 2.0,
          unitLabel: lang === 'or' ? 'ବୟସ୍କ ପୋକ/ଗୁଚ୍ଛ (Adults/hill)' : 'Adults per hill',
          sampleGuidance: lang === 'or' ? '୧୦ଟି ଗୁଚ୍ଛରୁ କଳା କଣ୍ଟକିତ ହିସ୍ପା ପୋକ ଗଣନା କରନ୍ତୁ କିମ୍ବା ୫% କ୍ଷତିଗ୍ରସ୍ତ ପତ୍ର ଦେଖନ୍ତୁ।' : 'Count spiny black adults per hill or check for >5% white blistered leaves.',
          standardText: '1-2 adults/hill or >5% damaged leaves'
        };
      case 'armyworm':
        return {
          threshold: cropStage === 'vegetative' ? 1.0 : 0.5,
          unitLabel: lang === 'or' ? 'ଲାର୍ଭା ପୋକ/ଗୁଚ୍ଛ (Larvae/hill)' : 'Larvae per hill',
          sampleGuidance: lang === 'or' ? 'ସନ୍ଧ୍ୟା ବେଳେ ବା ସକାଳେ ଗଛ ମୂଳ ଓ ମାଟିରେ ଲୁଚିଥିବା ଲାର୍ଭା ଗଣନା କରନ୍ତୁ।' : 'Inspect plant base, leaf sheaths, and soil crevices during dawn/dusk for nocturnal larvae.',
          standardText: cropStage === 'vegetative' ? '1 larva/hill (tillering)' : '1 larva/2 hills (0.5/hill) or 1 clipped panicle/m²'
        };
      default:
        return {
          threshold: 999.0,
          unitLabel: 'per hill',
          sampleGuidance: '',
          standardText: 'N/A'
        };
    }
  };

  const etl = getEtlThreshold();
  const parsedCount = pestCountInput.trim() === '' ? null : parseFloat(pestCountInput);
  const isInputValid = parsedCount !== null && !isNaN(parsedCount) && parsedCount >= 0;
  const isEtlBreached = isInputValid && parsedCount >= etl.threshold;

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
              {isTreatmentAllowed 
                ? (lang === 'or' 
                    ? `${knowledge.commonNameOr} ପାଇଁ ପରିବେଶ-ଉପଯୋଗୀ ଜୈବିକ, ଚାଷ ପଦ୍ଧତି ଓ ସୁରକ୍ଷିତ ରାସାୟନିକ ଉପଚାର।`
                    : `Actionable, scientifically verified management protocols for ${knowledge.commonNameEn} in Odisha rice ecosystems.`)
                : (lang === 'or'
                    ? 'କୀଟ ନିର୍ଣ୍ଣୟ ଅନିଶ୍ଚିତ ବା ଅଣ-କ୍ଷତିକାରକ ଥିବାରୁ କୀଟନାଶକ ପରାମର୍ଶ ସୁରକ୍ଷା ଦୃଷ୍ଟିରୁ ସ୍ଥଗିତ ରଖାଯାଇଛି।'
                    : 'Treatment protocols withheld: Species identification is uncertain, unconfirmed, or non-pest.')}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">{lang === 'or' ? 'ଲକ୍ଷ୍ୟ କୀଟ:' : 'Target Subject:'}</span>
            <span className="text-sm font-extrabold text-agri-900">
              {isTreatmentAllowed ? (lang === 'or' ? knowledge.commonNameOr : knowledge.commonNameEn) : 'Intervention Locked'}
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

        {/* 3-Tier Navigation Tabs (Enabled ONLY when treatment is allowed) */}
        {isTreatmentAllowed && (
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
        )}
      </div>

      {/* SAFETY REJECTION GATE WHEN TREATMENT IS NOT ALLOWED */}
      {!isTreatmentAllowed && (
        <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-300 text-slate-900 space-y-4">
          <div className="flex items-center space-x-3 text-slate-900 font-extrabold text-lg sm:text-xl">
            <ShieldAlert className="w-7 h-7 text-amber-600 flex-shrink-0" />
            <span>{lang === 'or' ? 'କୀଟନାଶକ ଉପଚାର ସ୍ଥଗିତ (ସୁରକ୍ଷା ନିୟମାବଳୀ)' : 'Treatment Protocols Strictly Withheld (Safety Mandate)'}</span>
          </div>

          <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
            <p>
              {lang === 'or'
                ? 'କୃଷି ମିତ୍ର AI ର ବୈଜ୍ଞାନିକ ସୁରକ୍ଷା ନିୟମ ଅନୁସାରେ, ଏହି ସ୍କାନ୍ ପାଇଁ ରାସାୟନିକ କିମ୍ବା ବ୍ୟାବସାୟିକ କୀଟନାଶକ ପରାମର୍ଶ ପ୍ରଦର୍ଶନ ନିଷେଧ କରାଯାଇଛି କାରଣ:'
                : 'Under Krushi Mitra AI safety protocols, pesticide and commercial input recommendations are strictly locked for this scan because:'}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-slate-600 font-medium">
              <li>{lang === 'or' ? 'ପୋକର ପ୍ରଜାତି ସଠିକ ଭାବେ ନିଶ୍ଚିତ ହୋଇନାହିଁ କିମ୍ବା ଫଟୋଟି ଅସ୍ପଷ୍ଟ ଅଟେ।' : 'Pest species identification is unconfirmed, ambiguous, or photograph is low-contrast/blurry.'}</li>
              <li>{lang === 'or' ? 'ଫଟୋରେ ଥିବା କୀଟ ଚାଷୀର ବନ୍ଧୁ (ଯେପରିକି ବୁଢ଼ିଆଣୀ) କିମ୍ବା ଧାନ ଫସଲ ପାଇଁ ଅଣ-କ୍ଷତିକାରକ।' : 'The detected organism is a beneficial natural enemy (Lycosa wolf spider) or non-target arthropod.'}</li>
              <li>{lang === 'or' ? 'ଧାନ ଫସଲ ସୁସ୍ଥ ଅଛି କିମ୍ବା କ୍ଷତିର ଚିହ୍ନ ଥିଲେ ମଧ୍ୟ କୌଣସି ଜୀବନ୍ତ ପୋକ ଦୃଶ୍ୟମାନ ନୁହେଁ।' : 'The rice crop is healthy, or foliar lesions are visible without a confirmed pest body.'}</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">{lang === 'or' ? 'ବିନା ଚିହ୍ନଟରେ କୀଟନାଶକ ସିଞ୍ଚନର ବିପଦ:' : 'Why Indiscriminate Pesticide Spraying is Dangerous:'}</span>
            <p>
              {lang === 'or'
                ? 'ଭୁଲ୍ ବା ଅସମୟରେ ବିଷ ସିଞ୍ଚନ କଲେ ଚାଷୀଙ୍କ ଟଙ୍କା ନଷ୍ଟ ହୁଏ, କ୍ଷେତରେ ଥିବା ବନ୍ଧୁ ପୋକ ମରିଯାଆନ୍ତି ଏବଂ ମାଟିଆ ଗୁଣ୍ଡି ପୋକର ପ୍ରାଦୁର୍ଭାବ (resurgence) ବୃଦ୍ଧି ପାଏ।'
                : 'Spraying without confirmed Economic Threshold Levels (ETL) eradication triggers secondary pest resurgence (especially BPH), kills aquatic life in canals, and causes unnecessary debt for smallholder farmers.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onNavigateAssistant}
              className="py-3 px-6 rounded-2xl bg-agri-800 hover:bg-agri-900 text-lime-300 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{lang === 'or' ? 'ଓଡ଼ିଆ AI ସହାୟକଙ୍କୁ ପଚାରନ୍ତୁ' : 'Ask Voice Assistant for Guidance'}</span>
            </button>
            <button
              onClick={onFollowUpSchedule}
              className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm shadow-sm"
            >
              <span>{lang === 'or' ? 'କ୍ଷେତ ଯାଞ୍ଚ ସମୟସାରଣୀ ସ୍ଥିର କରନ୍ତୁ' : 'Schedule Crop Inspection Reminder'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: BIOLOGICAL CONTROL */}
      {activeTab === 'biological' && isTreatmentAllowed && (
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
      {activeTab === 'cultural' && isTreatmentAllowed && (
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
      {activeTab === 'chemical' && isTreatmentAllowed && (
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

          {/* Field Scouting & ETL Validation Gate */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-agri-700" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {lang === 'or' ? 'କ୍ଷେତ ନିରୀକ୍ଷଣ ଓ ETL ଯାଞ୍ଚ (Field Scouting Gate)' : 'Field Scouting & ETL Safety Gate'}
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Mandatory Safety Protocol
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'or'
                ? 'ICAR-NRRI ଏବଂ OUAT ନିର୍ଦ୍ଦେଶାବଳୀ ଅନୁଯାୟୀ କୀଟନାଶକ ପ୍ରୟୋଗ ପୂର୍ବରୁ କ୍ଷେତ ନିରୀକ୍ଷଣ କରି ପୋକ ସଂଖ୍ୟା ଯାଞ୍ଚ କରିବା ବାଧ୍ୟତାମୂଳକ।'
                : 'ICAR-NRRI Cuttack and OUAT protocols legally mandate empirical field sampling prior to unlocking chemical insecticide recommendations.'}
            </p>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === 'or' ? '୧. ଫସଲର ବର୍ତ୍ତମାନର ପର୍ଯ୍ୟାୟ ଚୟନ କରନ୍ତୁ:' : '1. Select Current Crop Growth Stage:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCropStage('vegetative')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    cropStage === 'vegetative'
                      ? 'bg-agri-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'or' ? 'ଗଛ ବୃଦ୍ଧି / କୁଶି ଅବସ୍ଥା (Vegetative)' : 'Vegetative / Tillering Stage'}
                </button>
                <button
                  type="button"
                  onClick={() => setCropStage('reproductive')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    cropStage === 'reproductive'
                      ? 'bg-agri-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang === 'or' ? 'ଶିଁଷା ବାହାରିବା / ଫୁଲ ଅବସ୍ଥା (Heading)' : 'Panicle / Heading Stage'}
                </button>
              </div>
            </div>

            {/* Scouting Count Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>
                  {lang === 'or' ? `୨. କ୍ଷେତ ନିରୀକ୍ଷଣ ପରିମାଣ (${etl.unitLabel}):` : `2. Field Scouting Observation (${etl.unitLabel}):`}
                </span>
                <span className="text-[11px] font-semibold text-rose-700">
                  ETL Threshold: {etl.standardText}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={pestCountInput}
                  onChange={(e) => setPestCountInput(e.target.value)}
                  placeholder={lang === 'or' ? `ସଂଖ୍ୟା ଲେଖନ୍ତୁ (ଉଦାହରଣ: ${etl.threshold})` : `Enter count (e.g. ${etl.threshold})`}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-agri-600"
                />
                <button
                  type="button"
                  onClick={() => setPestCountInput(String(Math.max(0, etl.threshold - 2)))}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap"
                  title="Test below ETL"
                >
                  {lang === 'or' ? 'ସୀମା ତଳେ' : 'Below ETL'}
                </button>
                <button
                  type="button"
                  onClick={() => setPestCountInput(String(etl.threshold + 3))}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap"
                  title="Test above ETL"
                >
                  {lang === 'or' ? 'ସୀମା ଉପରେ' : 'Above ETL'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                {etl.sampleGuidance}
              </p>
            </div>
          </div>

          {/* ETL Verification Status Gate Banner */}
          {!isInputValid && (
            <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl text-xs text-amber-950 flex items-start space-x-3.5 shadow-sm">
              <Lock className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-amber-900 text-sm block">
                  {lang === 'or' ? 'ରାସାୟନିକ ପରାମର୍ଶ ସ୍ଥଗିତ: କ୍ଷେତ ନିରୀକ୍ଷଣ ତଥ୍ୟ ଆବଶ୍ୟକ' : 'Chemical Advice Locked: Field Scouting Data Required'}
                </span>
                <p>
                  {lang === 'or'
                    ? 'କୀଟନାଶକ ଔଷଧ ଦେଖିବା ପୂର୍ବରୁ ଉପରେ ନିଜ କ୍ଷେତର ପୋକ ସଂଖ୍ୟା ଲେଖନ୍ତୁ। ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (ETL) ନିଶ୍ଚିତ ନ କରି ବିଷ ସିଞ୍ଚନ କରିବା ଆଇନଗତ ଓ ବୈଜ୍ଞାନିକ ଭାବେ ନିଷେଧ।'
                    : 'Chemical molecule recommendations are locked. Enter your 10-hill field scouting observation above to verify whether pest density has crossed the Economic Threshold Level (ETL). Indiscriminate chemical spraying without field data triggers secondary pest resurgence and destroys beneficial Lycosa wolf spiders.'}
                </p>
              </div>
            </div>
          )}

          {isInputValid && !isEtlBreached && (
            <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-3xl text-xs text-rose-950 flex items-start space-x-3.5 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-rose-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px] uppercase">
                    Safety Gate Locked
                  </span>
                  <span className="font-extrabold text-rose-900 text-sm">
                    {lang === 'or' ? 'ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (ETL) ଠାରୁ କମ୍ — ରାସାୟନିକ ସିଞ୍ଚନ ନିଷେଧ' : 'Below Economic Threshold Level — Chemical Spray Prohibited'}
                  </span>
                </div>
                <p>
                  {lang === 'or'
                    ? `ଆପଣଙ୍କ କ୍ଷେତରେ ପୋକ ସଂଖ୍ୟା (${parsedCount} ${etl.unitLabel}) ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (${etl.threshold}) ଠାରୁ କମ୍ ଅଛି। ଏହି ସମୟରେ ବିଷ ସିଞ୍ଚନ କଲେ ଚାଷୀଙ୍କ ଟଙ୍କା ଅଯଥା ଖର୍ଚ୍ଚ ହୁଏ ଏବଂ କ୍ଷେତରେ ଥିବା ବନ୍ଧୁ ବୁଢ଼ିଆଣୀ ମରିଯାଆନ୍ତି। ଦୟାକରି କେବଳ ଜୈବିକ (Tab 1) ଓ ଚାଷ ପଦ୍ଧତି (Tab 2) ଆପଣାନ୍ତୁ।`
                    : `Your observed pest count (${parsedCount} ${etl.unitLabel}) is BELOW the Economic Threshold Level (${etl.threshold}). Applying chemical insecticides at sub-threshold levels causes unnecessary expenditure, eliminates natural biological predators (Lycosa spiders), and accelerates insecticide resistance. Continue biological conservation and cultural practices.`}
                </p>
              </div>
            </div>
          )}

          {isInputValid && isEtlBreached && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-3xl text-xs text-emerald-950 flex items-start space-x-3.5 shadow-sm animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase">
                    Authorized By IPM Protocol
                  </span>
                  <span className="font-extrabold text-emerald-900 text-sm">
                    {lang === 'or' ? 'ETL ସୀମା ଅତିକ୍ରମ କରିଛି — ଅନୁମୋଦିତ ରାସାୟନିକ ଉପଚାର ଅନୁମତିପ୍ରାପ୍ତ' : 'ETL Breached — Chemical Treatment Authorized (CIBRC Approved)'}
                  </span>
                </div>
                <p>
                  {lang === 'or'
                    ? `କ୍ଷେତରେ ପୋକ ସଂଖ୍ୟା (${parsedCount} ${etl.unitLabel}) ଅର୍ଥନୈତିକ କ୍ଷତି ସୀମା (${etl.threshold}) ଅତିକ୍ରମ କରିଛି। ତଳେ ଥିବା କେନ୍ଦ୍ରୀୟ କୀଟନାଶକ ବୋର୍ଡ (CIBRC) ଅନୁମୋଦିତ ଔଷଧ ସଠିକ ମାତ୍ରା, ପାଣି ପରିମାଣ ଓ ସୁରକ୍ଷା ନିୟମ ମାନି ସିଞ୍ଚନ କରନ୍ତୁ।`
                    : `Field observation (${parsedCount} ${etl.unitLabel}) meets or exceeds the Economic Threshold Level (${etl.threshold}). Controlled chemical intervention is authorized. Apply strictly using the CIBRC-registered molecules, dosages, water volumes, and Pre-Harvest Intervals (PHI) detailed below.`}
                </p>
              </div>
            </div>
          )}

          {/* Molecule Cards — Displayed ONLY when ETL is Breached */}
          {isEtlBreached && (
            <div className="grid grid-cols-1 gap-4 pt-2">
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
          )}
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
