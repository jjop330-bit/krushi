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
  CheckCircle2,
  Volume2
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
    <div className="space-y-6 sm:space-y-8 pb-12 animate-fadeIn w-full overflow-hidden">
      {/* Hero Section — Responsive 2-Column Desktop Redesign */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3822] via-[#14532D] to-[#166534] text-white p-5 sm:p-8 lg:p-10 shadow-xl border border-agri-800 w-full">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-lime-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-agri-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left Column: Headlines, Description & Primary Action CTAs */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lime-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-lime-400 flex-shrink-0" />
              <span>{lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି AI ହ୍ୟାକାଥନ୍ ୨୦୨୬' : 'Odisha AI Hackathon 2026 Innovation'}</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans leading-tight">
              {lang === 'or' ? (
                <>
                  କୃଷି ମିତ୍ର AI <br />
                  <span className="text-lime-300 font-odia text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold">
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

            <p className="text-agri-100 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
              {lang === 'or' 
                ? 'ଓଡ଼ିଶାର ଚାଷୀ ଭାଇ ଓ ଭଉଣୀଙ୍କ ପାଇଁ ଏକ ସ୍ୱତନ୍ତ୍ର AI ସହାୟକ। ଧାନ ଓ ପ୍ରମୁଖ ଫସଲରେ ଲାଗୁଥିବା କ୍ଷତିକାରକ କୀଟ ଚିହ୍ନଟ କରନ୍ତୁ, ଓଡ଼ିଆ ଭାଷାରେ ବୁଝନ୍ତୁ ଏବଂ ପରିବେଶ ଅନୁକୂଳ ଜୈବିକ ଓ ସଠିକ ଉପଚାର ପାଆନ୍ତୁ।'
                : 'AI-powered pest intelligence engineered specifically for farmers in Odisha. Real-time vision detection, Odia voice interaction, universal 32-crop support, and 3-tier responsible treatment recommendations.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 items-center">
              <button
                onClick={() => onNavigate('scanner')}
                className="min-h-[48px] px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-agri-950 font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg shadow-lime-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 sm:flex-initial"
              >
                <Scan className="w-5 h-5 text-agri-950 flex-shrink-0" />
                <span>{t.ctaScanNow}</span>
              </button>

              <button
                onClick={() => onNavigate('assistant')}
                className="min-h-[48px] px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-md border border-white/20 flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 sm:flex-initial"
              >
                <Mic className="w-5 h-5 text-lime-300 flex-shrink-0" />
                <span>{t.ctaVoiceAsk}</span>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="min-h-[48px] px-4 py-3.5 rounded-2xl bg-agri-900/60 hover:bg-agri-900 text-agri-200 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all w-full sm:w-auto"
              >
                <MapPin className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span>{lang === 'or' ? 'ଓଡ଼ିଶା କୀଟ ମାନଚିତ୍ର' : 'Odisha Pest Map'}</span>
              </button>
            </div>

            {/* Feature Badges Grid */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span>{lang === 'or' ? '୩୨ ଓଡ଼ିଶା ଫସଲ' : '32 Odisha Crops'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span>{lang === 'or' ? 'ସାର୍ଭମ୍ ଓଡ଼ିଆ ଭଏସ୍' : 'Sarvam Odia Voice'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span>{lang === 'or' ? 'ଜୈବିକ ଉପଚାର ପ୍ରାଥମିକତା' : 'Biological Control 1st'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                <span>{lang === 'or' ? 'ଶୂନ୍ୟ ଭୁଲ୍ ଚିହ୍ନଟ ସୁରକ୍ଷା' : 'Zero False Positive'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Desktop Preview Visual Card (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></span>
                  <span className="font-bold text-lime-300">
                    {lang === 'or' ? 'ପରୀକ୍ଷିତ କ୍ଷେତ୍ରୀୟ ନମୁନା ବିଶ୍ଳେଷଣ' : 'Live Field Specimen Telemetry'}
                  </span>
                </div>
                <span className="text-[11px] text-agri-200">
                  {lang === 'or' ? 'ବରଗଡ଼ ଜିଲ୍ଲା' : 'Bargarh Command'}
                </span>
              </div>

              {/* Real Field Specimen Image */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-900 border border-white/15 shadow-inner">
                <img 
                  src={SAMPLE_PEST_IMAGES[0].imageUri} 
                  alt="Brown Planthopper Specimen"
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-agri-950/80 backdrop-blur-md text-lime-300 text-[10px] font-bold border border-lime-400/30">
                  {lang === 'or' ? 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ (BPH)' : 'Brown Planthopper'}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold">
                  94% Confidence
                </div>
              </div>

              {/* Specimen Telemetry Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-agri-100">
                  <span className="text-agri-200">{lang === 'or' ? 'ବୈଜ୍ଞାନିକ ନାମ:' : 'Scientific Name:'}</span>
                  <span className="font-mono italic text-lime-300">Nilaparvata lugens</span>
                </div>
                <div className="flex justify-between items-center text-agri-100">
                  <span className="text-agri-200">{lang === 'or' ? 'ଆର୍ଥିକ କ୍ଷତି ସୀମା (ETL):' : 'ETL Threshold:'}</span>
                  <span className="font-semibold text-amber-300">{lang === 'or' ? '୫-୧୦ ପୋକ / ଗୁଛା' : '5-10 insects/hill'}</span>
                </div>
              </div>

              {/* Voice Guidance Pill */}
              <div className="p-2.5 rounded-xl bg-agri-900/80 border border-agri-700/80 flex items-center justify-between text-xs text-agri-200">
                <div className="flex items-center space-x-2 min-w-0">
                  <Volume2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
                  <span className="truncate">
                    {lang === 'or' ? 'ସାର୍ଭମ୍ ବୁଲବୁଲ୍ v3 ଓଡ଼ିଆ ଭଏସ୍ ଉପଲବ୍ଧ' : 'Sarvam Bulbul v3 Odia TTS Ready'}
                  </span>
                </div>
                <button
                  onClick={() => onSelectSample(SAMPLE_PEST_IMAGES[0])}
                  className="px-2.5 py-1 rounded-lg bg-lime-400 text-agri-950 font-bold text-[11px] hover:bg-lime-300 transition-colors flex-shrink-0"
                >
                  {lang === 'or' ? 'ପରୀକ୍ଷା' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demonstration Quick-Test Gallery (1-Click Evaluation) */}
      <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 w-full">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ପରୀକ୍ଷାମୂଳକ ନମୁନା' : 'Live Test Gallery'}
              </span>
              <span className="text-xs text-slate-500">
                {lang === 'or' ? '୧-କ୍ଲିକ୍ ମୂଲ୍ୟାଙ୍କନ' : '1-Click Evaluation'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {lang === 'or' ? 'ଓଡ଼ିଶାର ପରୀକ୍ଷିତ କୀଟ ନମୁନା ପରୀକ୍ଷା କରନ୍ତୁ' : 'Test Verified Odisha Field Specimens'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {lang === 'or' 
                ? 'ଯେକୌଣସି ନମୁନା ଉପରେ କ୍ଲିକ୍ କରି ତୁରନ୍ତ AI ନିର୍ଣ୍ଣୟ, ଲକ୍ଷଣ ଓ ୩-ସ୍ତରୀୟ ଉପଚାର ଦେଖନ୍ତୁ।'
                : 'Click any specimen to run instant multimodal diagnostic analysis, explainable confidence, and 3-tier IPM recommendations.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('scanner')}
            className="min-h-[44px] text-xs sm:text-sm font-bold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
          >
            <span>{lang === 'or' ? 'ନିଜ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ' : 'Upload Custom Image'}</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>

        {/* Specimen Cards Grid — 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
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
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-agri-700 font-semibold min-h-[30px]">
                  <span>{lang === 'or' ? 'ବିଶ୍ଳେଷଣ କରନ୍ତୁ' : 'Analyze Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two Column Layout: Weather Intelligence & Active Scan / Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Weather Agro-Met Risk Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 w-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  {lang === 'or' ? 'ପାଣିପାଗ ଓ କୀଟ ସମ୍ଭାବ୍ୟତା' : 'Agro-Met Risk Intelligence'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {lang === 'or' ? `${weather.districtNameOr} ଜିଲ୍ଲା କ୍ଷେତ୍ରୀୟ ପାଣିପାଗ ସତର୍କତା` : `${weather.districtName} District Field Telemetry`}
              </h3>
            </div>

            <button
              onClick={() => onNavigate('map')}
              className="min-h-[44px] text-xs font-bold text-agri-700 hover:text-agri-800 flex items-center space-x-1"
            >
              <span>{lang === 'or' ? 'ସମସ୍ତ ୩୦ ଜିଲ୍ଲା ଦେଖନ୍ତୁ' : 'View All 30 Districts'}</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">{lang === 'or' ? 'ତାପମାତ୍ରା' : 'Temperature'}</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{weather.temperatureC}°C</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">{lang === 'or' ? 'ଆର୍ଦ୍ରତା' : 'Humidity'}</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{weather.humidityPercent}%</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">{lang === 'or' ? 'ବର୍ଷା ସମ୍ଭାବନା' : 'Rainfall'}</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{weather.rainfallMm24h} mm</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">{lang === 'or' ? 'ସତର୍କତା ସ୍ତର' : 'Alert Level'}</span>
              <p className="text-base sm:text-lg font-bold text-amber-600 mt-0.5">
                {lang === 'or' ? 'ମଧ୍ୟମ-ଉଚ୍ଚ' : 'Medium-High'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              {lang === 'or' ? weather.riskRationaleOr : weather.riskRationaleEn}
            </p>
          </div>
        </div>

        {/* Right 1 Col: Active Scan Report Quick Summary */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-agri-700 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {lang === 'or' ? 'ସର୍ବଶେଷ ସ୍କାନ୍ ରିପୋର୍ଟ' : 'Active Scan Summary'}
                </h3>
              </div>
              {activeReport && (
                <span className="px-2 py-0.5 rounded-md bg-agri-100 text-agri-800 text-[10px] font-bold">
                  {activeReport.status}
                </span>
              )}
            </div>

            {activeReport ? (
              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={activeReport.imageUri} 
                    alt="Active Specimen" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {lang === 'or' ? activeReport.identification.commonNameOr : activeReport.identification.commonNameEn}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono italic">
                    {activeReport.identification.scientificName}
                  </p>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">
                    {lang === 'or' ? 'କ୍ଷତିର ଆକଳନ:' : 'Impact:'}
                  </span>{' '}
                  {activeReport.potentialYieldLossRange}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                <Bug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{lang === 'or' ? 'କୌଣସି ସକ୍ରିୟ ସ୍କାନ୍ ନାହିଁ। ଉପରେ ସ୍କାନ୍ କରନ୍ତୁ।' : 'No active scans recorded. Tap Scan Now to start.'}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 mt-4">
            <button
              onClick={() => onNavigate(activeReport ? 'report' : 'scanner')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-agri-800 hover:bg-agri-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>{activeReport ? (lang === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ରିପୋର୍ଟ ଦେଖନ୍ତୁ' : 'Open Diagnostic Report') : t.ctaScanNow}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
