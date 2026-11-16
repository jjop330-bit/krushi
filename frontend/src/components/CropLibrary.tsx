import React, { useState, useMemo } from 'react';
import { 
  Wheat, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Filter,
  Layers,
  Bug,
  Activity,
  Award
} from 'lucide-react';
import { SUPPORTED_CROPS, CROP_CATEGORIES, CropInfo } from '../data/cropKnowledge';

interface CropLibraryProps {
  lang: 'or' | 'en';
  onSelectCrop?: (cropId: string) => void;
}

export const CropLibrary: React.FC<CropLibraryProps> = ({
  lang,
  onSelectCrop
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCrops = useMemo(() => {
    return SUPPORTED_CROPS.filter(crop => {
      const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch = 
        crop.commonNameEn.toLowerCase().includes(q) ||
        crop.commonNameOr.toLowerCase().includes(q) ||
        crop.scientificName.toLowerCase().includes(q) ||
        crop.majorInsectPests.some(p => p.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ଓଡ଼ିଶା ଫସଲ ସୂଚୀ (୩୨ ଫସଲ)' : 'Odisha Crop Architecture (32 Crops)'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Universal Agro-Ecological Register
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ଫସଲ ଓ କୀଟ ପରିଚାଳନା କୋଷ' : 'Odisha Major Crops & Entomology Knowledge Registry'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ଧାନ, ମକା, ଡାଲି, ତୈଳବୀଜ, ପନିପରିବା ଓ ଫଳ ଚାଷ ପାଇଁ ବୈଜ୍ଞାନିକ ତଥ୍ୟ, କୀଟ ଲକ୍ଷଣ ଓ ନିରୀକ୍ଷଣ ପଦ୍ଧତି।'
                : 'Comprehensive structured knowledge for 32 major crops in 5 agro-climatic categories across Odisha.'}
            </p>
          </div>
        </div>

        {/* Scientific Claim Integrity Disclaimer */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">
              {lang === 'or' ? 'ନୈତିକ କୃଷି AI ପ୍ରତିବଦ୍ଧତା (Ethical AI Mandate):' : 'Ethical Model Deployment Principle:'}
            </span>
            <p className="mt-0.5 leading-relaxed">
              {lang === 'or'
                ? 'ପ୍ରତିଟି ଫସଲର ତଥ୍ୟ OUAT, ICAR-NRRI, IIHR, IIPR ଓ ଓଡ଼ିଶା କୃଷି ବିଭାଗ ଦ୍ୱାରା ପ୍ରମାଣିତ। କୌଣସି ଅଣ-ପ୍ରମାଣିତ କୀଟନାଶକ ଡୋଜ୍ ବା ଔଷଧ ସୁପାରିଶ କରାଯାଏ ନାହିଁ।'
                : 'All crop entomological data is sourced from OUAT, ICAR-NRRI, IIHR, IIPR, and CIBRC label claims. Krushi Mitra AI enforces fail-closed chemical gating.'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'or' ? 'ଫସଲ ନାମ, ବୈଜ୍ଞାନିକ ନାମ ବା ପୋକ ଖୋଜନ୍ତୁ...' : 'Search crop, scientific name, or pest...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-agri-800 text-white border-agri-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {lang === 'or' ? 'ସମସ୍ତ (୩୨)' : 'All Crops (32)'}
            </button>
            {CROP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-agri-800 text-white border-agri-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === 'or' ? cat.nameOr.split(' ')[0] : cat.nameEn.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop) => {
          const isValidated = crop.status === 'FULL_VALIDATED';
          return (
            <div
              key={crop.id}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                isValidated 
                  ? 'border-agri-300 shadow-sm hover:shadow-md' 
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-100 flex items-center justify-center">
                      {crop.icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {lang === 'or' ? crop.commonNameOr : crop.commonNameEn}
                      </h3>
                      <p className="text-[11px] text-slate-500 italic truncate max-w-[180px]">{crop.scientificName}</p>
                    </div>
                  </div>

                  {isValidated ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold flex items-center space-x-1 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{lang === 'or' ? 'ପ୍ରମାଣିତ' : 'Validated'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center space-x-1 flex-shrink-0">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>{lang === 'or' ? 'କ୍ଷେତ୍ର ପରୀକ୍ଷଣ' : 'Field Pilot'}</span>
                    </span>
                  )}
                </div>

                {/* Major Insect Pests */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === 'or' ? 'ପ୍ରମୁଖ କୀଟ:' : 'Major Insect Pests:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {crop.majorInsectPests.slice(0, 4).map((pest, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {pest.split('(')[0].trim()}
                      </span>
                    ))}
                    {crop.majorInsectPests.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[10px]">
                        +{crop.majorInsectPests.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Scouting Protocol Preview */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">
                    {lang === 'or' ? 'ନିରୀକ୍ଷଣ ପଦ୍ଧତି:' : 'Scouting Method:'}
                  </span>
                  <p className="line-clamp-2 leading-relaxed">{crop.scoutingMethod}</p>
                </div>

                {/* Source Institution */}
                <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <Award className="w-3 h-3 text-agri-700 flex-shrink-0" />
                  <span className="truncate">{crop.sourceInstitution}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                {onSelectCrop ? (
                  <button
                    type="button"
                    onClick={() => onSelectCrop(crop.id)}
                    className="min-h-[44px] text-agri-700 hover:text-agri-900 font-extrabold flex items-center space-x-1"
                  >
                    <span>{lang === 'or' ? 'ଏହି ଫସଲ ସ୍କାନ୍ କରନ୍ତୁ' : 'Scan this crop'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-agri-800 font-bold text-[11px]">
                    {isValidated ? '✓ Model Ready' : 'Pilot Supervised'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
