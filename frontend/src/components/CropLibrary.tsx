import React from 'react';
import { Wheat, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { SUPPORTED_CROPS, CropInfo } from '../data/cropKnowledge';

interface CropLibraryProps {
  lang: 'or' | 'en';
  onSelectCrop?: (cropId: string) => void;
}

export const CropLibrary: React.FC<CropLibraryProps> = ({
  lang,
  onSelectCrop
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ଓଡ଼ିଶା ଫସଲ ତାଲିକା' : 'Odisha Crop Architecture'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Extensible Diagnostic Framework
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ସମର୍ଥିତ ଓ ବିକାଶାଧୀନ ଫସଲ ସମୂହ' : 'Crop Diagnostic Directory & Extension Roadmap'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ବର୍ତ୍ତମାନ ଧାନ ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ସକ୍ରିୟ। ଅନ୍ୟାନ୍ୟ ଫସଲଗୁଡ଼ିକ ଗବେଷଣାଗାରରେ ପରୀକ୍ଷଣ ପରେ ହିଁ ଉନ୍ମୋଚିତ ହେବ।'
                : 'Paddy is actively deployed with 5 validated entomological models. Other regional crops are staged in strict validation pipelines.'}
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
            <p className="mt-0.5">
              {lang === 'or'
                ? 'କୌଣସି ଫସଲକୁ ସକ୍ରିୟ ଘୋଷଣା କରାଯାଏ ନାହିଁ ଯେପର୍ଯ୍ୟନ୍ତ ଏହାର କୀଟ ଡାଟାବେସ୍ ଓ AI ମଡେଲ ସଠିକତା ୯୦% ରୁ ଅଧିକ ପ୍ରମାଣିତ ନ ହୋଇଛି।'
                : 'Krushi Mitra AI adheres to strict diagnostic safety: We never claim support for a crop until its regional pest knowledge and computer-vision accuracy exceed 90% benchmark in field validation trials.'}
            </p>
          </div>
        </div>
      </div>

      {/* Crops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPPORTED_CROPS.map((crop) => {
          const isActive = crop.status === 'active';
          return (
            <div
              key={crop.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                isActive 
                  ? 'border-agri-500 shadow-md ring-1 ring-agri-500/20' 
                  : 'border-slate-200 shadow-sm opacity-90'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-100 flex items-center justify-center">
                      {crop.icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">
                        {lang === 'or' ? crop.nameOr : crop.nameEn}
                      </h3>
                      <p className="text-xs text-slate-500 italic">{crop.scientificName}</p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{lang === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ ସକ୍ରିୟ' : 'Active & Validated'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{lang === 'or' ? 'ପରୀକ୍ଷଣ ଚାଲିଛି' : 'In Field Validation'}</span>
                    </span>
                  )}
                </div>

                {/* Key Pests Supported or Targeted */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {lang === 'or' ? 'ପ୍ରମୁଖ ପୋକ ତାଲିକା:' : 'Target Pest Species:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {crop.keyTargetPests.map((pest, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        {pest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Validation Notice if Pending */}
                {!isActive && crop.validationNoticeEn && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                    <strong>{lang === 'or' ? 'ଗବେଷଣା ସୂଚନା:' : 'Validation Status: '}</strong>
                    {lang === 'or' ? crop.validationNoticeOr : crop.validationNoticeEn}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                {isActive ? (
                  <span className="text-agri-700 font-extrabold flex items-center space-x-1">
                    <span>{lang === 'or' ? '୫ ପ୍ରମୁଖ କୀଟ ମଡେଲ ଉପଲବ୍ଧ' : '5 Entomological Models Ready'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    {lang === 'or' ? 'ପରବର୍ତ୍ତୀ ସଂସ୍କରଣରେ ଯୋଡ଼ାଯିବ' : 'Scheduled for future release'}
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
