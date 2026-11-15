import React, { useState } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Building2, 
  PhoneCall, 
  Calendar, 
  Search, 
  Filter, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { ODISHA_DISTRICTS_DATA, DISTRICT_WEATHER_TELEMETRY } from '../data/districtsData';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { PestId } from '../types/pest';

interface DistrictMapProps {
  lang: 'or' | 'en';
  onSelectDistrict?: (districtId: string) => void;
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  lang,
  onSelectDistrict
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('bargarh');
  const [filterPest, setFilterPest] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentDistrict = ODISHA_DISTRICTS_DATA.find(d => d.districtId === selectedDistrictId) || ODISHA_DISTRICTS_DATA[0];
  const weather = DISTRICT_WEATHER_TELEMETRY[selectedDistrictId] || DISTRICT_WEATHER_TELEMETRY['bargarh'];
  const dominantPestKnowledge = currentDistrict.dominantPestId ? PEST_KNOWLEDGE_BASE[currentDistrict.dominantPestId as PestId] : null;

  // Filter districts
  const filteredDistricts = ODISHA_DISTRICTS_DATA.filter(dist => {
    const matchesSearch = 
      dist.districtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.districtNameOr.includes(searchQuery);
    const matchesPest = filterPest === 'all' || dist.dominantPestId === filterPest;
    return matchesSearch && matchesPest;
  });

  // Calculate totals
  const totalScans = ODISHA_DISTRICTS_DATA.reduce((acc, curr) => acc + curr.totalFarmerScans, 0);
  const totalAiSuspected = ODISHA_DISTRICTS_DATA.reduce((acc, curr) => acc + curr.aiSuspectedCases, 0);
  const totalExpertConfirmed = ODISHA_DISTRICTS_DATA.reduce((acc, curr) => acc + curr.expertConfirmedCases, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ଓଡ଼ିଶା କୀଟ ନିରୀକ୍ଷଣ ମାନଚିତ୍ର' : 'Odisha Local Pest Intelligence'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                District-by-District Outbreak Surveillance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ଜିଲ୍ଲାସ୍ତରୀୟ କୀଟ ସୂଚନା ଓ ବିଶ୍ଳେଷଣ' : 'District Pest Reports & Outbreak Intelligence'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ଓଡ଼ିଶାର ସମସ୍ତ ୩୦ ଜିଲ୍ଲାର କ୍ଷେତ୍ରୀୟ ରିପୋର୍ଟ। AI-ସନ୍ଦିଗ୍ଧ ମାମଲା ଏବଂ କୃଷି ବିଜ୍ଞାନୀଙ୍କ ଦ୍ୱାରା ନିଶ୍ଚିତ ମାମଲା ମଧ୍ୟରେ ସ୍ପଷ୍ଟ ପାର୍ଥକ୍ୟ।'
                : 'Real database records differentiating AI-suspected scans, farmer reports, and expert-confirmed outbreaks across Odisha.'}
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
            <div className="px-3 py-1 bg-white rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">{lang === 'or' ? 'ମୋଟ ସ୍କାନ୍' : 'Total Scans'}</span>
              <span className="font-extrabold text-slate-900">{totalScans}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">{lang === 'or' ? 'AI-ସନ୍ଦିଗ୍ଧ' : 'AI-Suspected'}</span>
              <span className="font-extrabold text-amber-700">{totalAiSuspected}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-xl shadow-xs">
              <span className="text-slate-500 block text-[10px]">{lang === 'or' ? 'ବିଜ୍ଞାନୀ ନିଶ୍ଚିତ' : 'Confirmed'}</span>
              <span className="font-extrabold text-emerald-700">{totalExpertConfirmed}</span>
            </div>
          </div>
        </div>

        {/* Search & Pest Filter Strip */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'or' ? 'ଜିଲ୍ଲା ଖୋଜନ୍ତୁ (ଯଥା: ବରଗଡ଼, କଟକ, ବାଲେଶ୍ୱର)...' : 'Search Odisha district...'}
              className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none focus:border-agri-600"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterPest}
              onChange={(e) => setFilterPest(e.target.value)}
              className="bg-slate-50 px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-none font-medium"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ କୀଟ ବର୍ଗ' : 'All Pest Categories'}</option>
              <option value="bph">Brown Planthopper (BPH)</option>
              <option value="stem_borer">Yellow Stem Borer</option>
              <option value="leaf_folder">Rice Leaf Folder</option>
              <option value="rice_hispa">Rice Hispa</option>
              <option value="armyworm">Rice Armyworm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Districts Browser + Selected District Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: District List (Interactive Map Selectors) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 max-h-[640px] overflow-y-auto space-y-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            {lang === 'or' ? 'ଜିଲ୍ଲା ତାଲିକା' : 'Odisha Districts Roster'} ({filteredDistricts.length})
          </span>

          {filteredDistricts.map((district) => {
            const isSelected = district.districtId === selectedDistrictId;
            return (
              <div
                key={district.districtId}
                onClick={() => setSelectedDistrictId(district.districtId)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-agri-50 border-agri-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-agri-950 font-extrabold' : 'text-slate-900'}`}>
                      {lang === 'or' ? district.districtNameOr : district.districtName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[190px]">
                      {district.zone}
                    </p>
                  </div>
                  {district.activeOutbreakAlert && (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold animate-pulse">
                      Alert Active
                    </span>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Scans: <strong>{district.totalFarmerScans}</strong></span>
                  <span>AI: <strong>{district.aiSuspectedCases}</strong></span>
                  <span className="text-emerald-700 font-bold">Confirmed: <strong>{district.expertConfirmedCases}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Detailed Selected District Intelligence */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detailed District Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-agri-700" />
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {lang === 'or' ? `${currentDistrict.districtNameOr} ଜିଲ୍ଲା` : `${currentDistrict.districtName} District`}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentDistrict.zone}</p>
              </div>

              {currentDistrict.activeOutbreakAlert ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-extrabold flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{lang === 'or' ? 'କୀଟ ଆକ୍ରମଣ ସତର୍କତା ଜାରି' : 'Official Outbreak Advisory'}</span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'or' ? 'ସ୍ୱାଭାବିକ ନିୟନ୍ତ୍ରଣ' : 'Normal Seasonal Surveillance'}</span>
                </div>
              )}
            </div>

            {/* Differentiated Metrics (AI vs Confirmed) */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">{lang === 'or' ? 'ଚାଷୀ ସ୍କାନ୍' : 'Farmer Submissions'}</span>
                <span className="text-xl font-extrabold text-slate-900">{currentDistrict.totalFarmerScans}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] text-amber-800 block">{lang === 'or' ? 'AI-ସନ୍ଦିଗ୍ଧ କେସ୍' : 'AI-Suspected Cases'}</span>
                <span className="text-xl font-extrabold text-amber-700">{currentDistrict.aiSuspectedCases}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block">{lang === 'or' ? 'ବିଜ୍ଞାନୀ ନିଶ୍ଚିତ' : 'Expert Confirmed'}</span>
                <span className="text-xl font-extrabold text-emerald-700">{currentDistrict.expertConfirmedCases}</span>
              </div>
            </div>

            {/* Dominant Pest Breakdown */}
            {dominantPestKnowledge && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  {lang === 'or' ? 'ଏହି ଜିଲ୍ଲାର ପ୍ରମୁଖ ଧାନ କୀଟ:' : 'Predominant Pest in this Agro-Ecosystem:'}
                </span>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {lang === 'or' ? dominantPestKnowledge.commonNameOr : dominantPestKnowledge.commonNameEn}
                    </h4>
                    <span className="text-xs text-slate-500 italic">{dominantPestKnowledge.scientificName}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-agri-100 text-agri-900">
                    {dominantPestKnowledge.localOdishaName}
                  </span>
                </div>
              </div>
            )}

            {/* Local KVK Contact Card */}
            <div className="p-4 rounded-2xl bg-agri-950 text-white space-y-2">
              <div className="flex items-center space-x-2 text-lime-400 font-bold text-xs uppercase tracking-wide">
                <Building2 className="w-4 h-4" />
                <span>{lang === 'or' ? 'ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK)' : 'Designated Krishi Vigyan Kendra'}</span>
              </div>
              <h3 className="font-extrabold text-base">{currentDistrict.kvkName}</h3>
              <div className="flex items-center space-x-2 text-xs text-agri-200 pt-1">
                <PhoneCall className="w-3.5 h-3.5 text-lime-400" />
                <span>KVK Direct Helpline: <strong>{currentDistrict.kvkPhone}</strong></span>
              </div>
            </div>
          </div>

          {/* Seasonal Pest Timeline for Odisha (Kharif & Rabi) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-agri-700" />
              <span>{lang === 'or' ? 'ଓଡ଼ିଶା ଧାନ ଚାଷ କୀଟ କ୍ୟାଲେଣ୍ଡର' : 'Seasonal Rice Pest Calendar in Odisha'}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">ଖରିଫ (ଜୁଲାଇ - ଅଗଷ୍ଟ):</strong>
                  <span className="text-slate-600 block">ତଳି ଓ ଗଛ ବୃଦ୍ଧି ପର୍ଯ୍ୟାୟ (Vegetative tillering)</span>
                </div>
                <span className="text-agri-800 font-bold">Stem Borer &amp; Rice Hispa</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">ଖରିଫ (ସେପ୍ଟେମ୍ବର - ଅକ୍ଟୋବର):</strong>
                  <span className="text-slate-600 block">ଥୋଡ଼ ଓ ଶିଁଷା ବାହାରିବା (Booting &amp; Panicle)</span>
                </div>
                <span className="text-rose-700 font-bold">Brown Planthopper &amp; Leaf Folder</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900">ଖରିଫ ଅମଳ ପୂର୍ବ (ନଭେମ୍ବର):</strong>
                  <span className="text-slate-600 block">ଧାନ ପାଚିବା ସମୟ (Ripening stage)</span>
                </div>
                <span className="text-amber-800 font-bold">Armyworm (Ear-Cutting)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
