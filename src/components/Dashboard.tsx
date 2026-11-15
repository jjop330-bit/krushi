import React from 'react';
import { 
  Scan, 
  Mic, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Bug, 
  Activity, 
  CalendarCheck,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { ODIA_TRANSLATIONS } from '../data/odiaTranslations';
import { SAMPLE_PEST_IMAGES, SamplePestImage } from '../data/sampleImages';
import { DISTRICT_WEATHER_TELEMETRY } from '../data/districtsData';
import { ScanReport, PestId } from '../types/pest';

interface DashboardProps {
  lang: 'or' | 'en';
  onNavigate: (tab: string) => void;
  onSelectSample: (sample: SamplePestImage) => void;
  activeReport: ScanReport | null;
  reportsHistory: ScanReport[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  lang,
  onNavigate,
  onSelectSample,
  activeReport,
  reportsHistory
}) => {
  const t = ODIA_TRANSLATIONS[lang];
  const weather = DISTRICT_WEATHER_TELEMETRY['bargarh'];

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3822] via-[#14532D] to-[#166534] text-white p-6 sm:p-10 shadow-xl border border-agri-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-agri-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lime-300 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>{lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି AI ହ୍ୟାକାଥନ୍ ୨୦୨୬' : 'Odisha AI Hackathon 2026 Innovation'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans leading-tight sm:leading-tight">
            {lang === 'or' ? (
              <>
                କୃଷି ମିତ୍ର AI <br />
                <span className="text-lime-300 font-odia text-2xl sm:text-4xl font-bold">
                  ଶୀଘ୍ର ଚିହ୍ନଟ କରନ୍ତୁ। କ୍ଷତି ବୁଝନ୍ତୁ। ଫସଲ ରକ୍ଷା କରନ୍ତୁ।
                </span>
              </>
            ) : (
              <>
                Krushi Mitra AI <br />
                <span className="text-lime-300">
                  Detect Early. Understand the Damage. Save the Harvest.
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-agri-100 text-base sm:text-lg max-w-2xl leading-relaxed">
            {lang === 'or' 
              ? 'ଓଡ଼ିଶାର ଚାଷୀ ଭାଇ ଓ ଭଉଣୀଙ୍କ ପାଇଁ ଏକ ସ୍ୱତନ୍ତ୍ର AI ସହାୟକ। ଧାନ ଗଛରେ ଲାଗୁଥିବା କ୍ଷତିକାରକ କୀଟ ଚିହ୍ନଟ କରନ୍ତୁ, ଓଡ଼ିଆ ଭାଷାରେ ବୁଝନ୍ତୁ ଏବଂ ପରିବେଶ ଅନୁକୂଳ ଜୈବିକ ଓ ସଠିକ ଉପଚାର ପାଆନ୍ତୁ।'
              : 'AI-powered pest intelligence engineered specifically for paddy farmers in Odisha. Real-time vision detection, Odia voice interaction, and 3-tier responsible treatment recommendations.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => onNavigate('scanner')}
              className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-agri-950 font-extrabold text-base flex items-center space-x-2.5 shadow-lg shadow-lime-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Scan className="w-5 h-5 text-agri-950" />
              <span>{t.ctaScanNow}</span>
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Mic className="w-5 h-5 text-lime-300" />
              <span>{t.ctaVoiceAsk}</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className="px-4 py-3.5 rounded-2xl bg-agri-900/60 hover:bg-agri-900 text-agri-200 text-sm font-semibold flex items-center space-x-1.5 transition-all"
            >
              <MapPin className="w-4 h-4 text-lime-400" />
              <span>{lang === 'or' ? 'ଓଡ଼ିଶା କୀଟ ମାନଚିତ୍ର' : 'Odisha Pest Map'}</span>
            </button>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>{lang === 'or' ? '୫ ପ୍ରମୁଖ ଧାନ କୀଟ' : '5 Major Rice Pests'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଓଡ଼ିଆ ଭଏସ୍ ବାର୍ତ୍ତାଳାପ' : 'Odia Voice Assistant'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଜୈବିକ ଓ ପରିବେଶ ସୁରକ୍ଷା' : 'Biological Control 1st'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>{lang === 'or' ? 'ଅସ୍ପଷ୍ଟ ଫଟୋ ସତର୍କତା' : 'Explainable Confidence'}</span>
          </div>
        </div>
      </section>

      {/* Live Demonstration Quick-Test Gallery (Judges 1-Click Evaluation) */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ପରୀକ୍ଷାମୂଳକ ନମୁନା' : 'Live Test Gallery'}
              </span>
              <span className="text-xs text-slate-500">
                {lang === 'or' ? '୧-କ୍ଲିକ୍ ମୂଲ୍ୟାଙ୍କନ' : '1-Click Judge Evaluation'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {lang === 'or' ? 'ଓଡ଼ିଶାର ପରୀକ୍ଷିତ କୀଟ ନମୁନା ପରୀକ୍ଷା କରନ୍ତୁ' : 'Test Verified Odisha Field Specimens'}
            </h2>
            <p className="text-sm text-slate-600">
              {lang === 'or' 
                ? 'ଯେକୌଣସି ନମୁନା ଉପରେ କ୍ଲିକ୍ କରି ତୁରନ୍ତ AI ନିର୍ଣ୍ଣୟ, ଲକ୍ଷଣ ଓ ୩-ସ୍ତରୀୟ ଉପଚାର ଦେଖନ୍ତୁ।'
                : 'Click any specimen to run instant multimodal diagnostic analysis, explainable confidence, and 3-tier IPM recommendations.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('scanner')}
            className="text-sm font-bold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
          >
            <span>{lang === 'or' ? 'ନିଜ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ' : 'Upload Custom Image'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Specimen Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SAMPLE_PEST_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className="group cursor-pointer rounded-2xl border border-slate-200 overflow-hidden hover:border-agri-500 hover:shadow-md transition-all bg-slate-50 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 relative">
                <img 
                  src={sample.imageUri} 
                  alt={sample.labelEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {sample.isBlurryOrUncertain && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                    Test Blur
                  </span>
                )}
                {sample.pestId === 'beneficial_spider' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                    Beneficial
                  </span>
                )}
                {sample.pestId === 'healthy_paddy' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-green-600 text-white text-[10px] font-bold">
                    Healthy
                  </span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-agri-800 line-clamp-1">
                    {lang === 'or' ? sample.labelOr : sample.labelEn}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {lang === 'or' ? sample.descriptionOr : sample.descriptionEn}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-agri-700 font-semibold">
                  <span>{lang === 'or' ? 'ବିଶ୍ଳେଷଣ କରନ୍ତୁ' : 'Analyze Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Layout: Weather Intelligence & Active Scan / Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weather Agro-Met Risk Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  {lang === 'or' ? 'ପାଣିପାଗ ଓ କୀଟ ସମ୍ଭାବ୍ୟତା' : 'Agro-Met Risk Intelligence'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {lang === 'or' ? `${weather.districtNameOr} ଜିଲ୍ଲା କ୍ଷେତ୍ରୀୟ ପାଣିପାଗ ସତର୍କତା` : `${weather.districtName} District Field Telemetry`}
              </h3>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {weather.recordedAt}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/80 border border-amber-200/70 p-3.5 rounded-2xl mb-5">
            <strong>{lang === 'or' ? 'କୀଟ ସଙ୍କେତ:' : 'Entomological Risk:'} </strong>
            {lang === 'or' ? weather.riskRationaleOr : weather.riskRationaleEn}
          </p>

          {/* Meteorological Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{lang === 'or' ? 'ତାପମାତ୍ରା' : 'Temperature'}</span>
              <span className="text-lg font-extrabold text-slate-900">{weather.temperatureC}°C</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Optimal for hoppers</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{lang === 'or' ? 'ବାୟୁ ଆର୍ଦ୍ରତା' : 'Humidity'}</span>
              <span className="text-lg font-extrabold text-slate-900">{weather.humidityPercent}%</span>
              <span className="text-[10px] text-rose-600 font-bold block mt-0.5">High (&gt;80%)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{lang === 'or' ? 'ବର୍ଷା (୨୪ ଘଣ୍ଟା)' : '24h Rainfall'}</span>
              <span className="text-lg font-extrabold text-slate-900">{weather.rainfallMm24h} mm</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Scattered</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">{lang === 'or' ? 'BPH ଆଶଙ୍କା' : 'BPH Risk Score'}</span>
              <span className="text-lg font-extrabold text-rose-600">{weather.bphRiskLevel}</span>
              <span className="text-[10px] text-rose-600 font-bold block mt-0.5">Hopperburn Risk</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-600">
            <span>{lang === 'or' ? 'ଡାଟା ଉତ୍ସ: ICAR-NRRI କୃଷି ପାଣିପାଗ କେନ୍ଦ୍ର' : 'Data Reference: Agro-Met Advisory Bulletin'}</span>
            <button 
              onClick={() => onNavigate('map')}
              className="text-agri-700 font-bold hover:underline flex items-center space-x-1 mt-1 sm:mt-0"
            >
              <span>{lang === 'or' ? 'ସମସ୍ତ ୩୦ ଜିଲ୍ଲା ତଥ୍ୟ ଦେଖନ୍ତୁ' : 'Explore All 30 Odisha Districts'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Active Report or Recent History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                {lang === 'or' ? 'ନିକଟ ଅନୁସନ୍ଧାନ' : 'Recent Scan Session'}
              </h3>
              {activeReport && (
                <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-900 text-[11px] font-bold">
                  Active
                </span>
              )}
            </div>

            {activeReport ? (
              <div className="space-y-3">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={activeReport.imageUri} 
                    alt="Active scan" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {lang === 'or' ? activeReport.identification.commonNameOr : activeReport.identification.commonNameEn}
                    </h4>
                    <span className="text-xs font-extrabold text-agri-700">
                      {activeReport.identification.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    {activeReport.identification.scientificName}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onNavigate('report')}
                    className="flex-1 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold transition-colors"
                  >
                    {lang === 'or' ? 'ରିପୋର୍ଟ ଦେଖନ୍ତୁ' : 'View Report'}
                  </button>
                  <button
                    onClick={() => onNavigate('treatment')}
                    className="flex-1 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-agri-950 text-xs font-bold transition-colors"
                  >
                    {lang === 'or' ? 'ଉପଚାର ପରାମର୍ଶ' : 'Treatments'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Scan className="w-6 h-6" />
                </div>
                <p className="text-xs">
                  {lang === 'or' 
                    ? 'କୌଣସି ଫଟୋ ସ୍କାନ୍ ହୋଇନାହିଁ। ତଳେ ଥିବା ବଟନ୍ ଦବାଇ ପ୍ରଥମ ଫଟୋ ନିଅନ୍ତୁ।' 
                    : 'No crop scanned in this session yet. Take a photograph or select a sample above.'}
                </p>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="px-4 py-2 rounded-xl bg-agri-700 text-white text-xs font-bold"
                >
                  {t.ctaScanNow}
                </button>
              </div>
            )}
          </div>

          {/* Quick Helpline Box */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {lang === 'or' ? 'କୃଷି ବିଜ୍ଞାନୀଙ୍କ ସହାୟତା' : 'Scientific Escalation'}
            </span>
            <p className="text-xs text-slate-700 mt-1 font-medium">
              {lang === 'or' 
                ? 'କୌଣସି କୀଟ ବିଷୟରେ ସନ୍ଦେହ ଥିଲେ KVK ବୈଜ୍ଞାନିକଙ୍କ ମତାମତ ମାଗନ୍ତୁ।' 
                : 'Need second opinion? Escalate cases directly to KVK & OUAT scientists.'}
            </p>
            <button
              onClick={() => onNavigate('expert')}
              className="mt-2 text-xs font-bold text-agri-700 hover:underline flex items-center space-x-1"
            >
              <span>{lang === 'or' ? 'ବିଶେଷଜ୍ଞ ପୋର୍ଟାଲ୍ ଖୋଲନ୍ତୁ' : 'Open Expert Review Queue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
