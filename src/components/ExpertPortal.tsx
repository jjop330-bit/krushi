import React, { useState } from 'react';
import { 
  UserCheck, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Send, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';

interface ExpertPortalProps {
  lang: 'or' | 'en';
  reports: ScanReport[];
}

export const ExpertPortal: React.FC<ExpertPortalProps> = ({
  lang,
  reports
}) => {
  const [queue, setQueue] = useState(StorageService.getExpertQueue());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(queue[0]?.reportId || null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const currentQueueItem = queue.find(q => q.reportId === selectedCaseId);
  const currentReport = reports.find(r => r.id === selectedCaseId);

  const handleReviewAction = (action: 'confirmed' | 'rejected') => {
    if (!selectedCaseId) return;
    StorageService.reviewExpertItem(
      selectedCaseId, 
      action, 
      feedbackNote || (action === 'confirmed' ? 'Verified as authentic BPH infestation by KVK Agronomist.' : 'Reclassified after review.')
    );
    setQueue(StorageService.getExpertQueue());
    setFeedbackNote('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'or' ? 'ବିଶେଷଜ୍ଞ ପରାମର୍ଶ ଡେସ୍କ' : 'KVK / OUAT Expert Review Desk'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Scientific Quality Assurance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {lang === 'or' ? 'ଅନିଶ୍ଚିତ କେସ୍ ପୁନଃନିରୀକ୍ଷଣ ଧାରା' : 'Agricultural Scientist Escalation Queue'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'or' 
                ? 'ଯେଉଁ କେସ୍‌ରେ AI ର ସଠିକତା ୭୦% ରୁ କମ୍ କିମ୍ବା ଚାଷୀ ସ୍ୱତନ୍ତ୍ର ସହାୟତା ଚାହାଁନ୍ତି, ତାହା କୃଷି ବିଜ୍ଞାନୀଙ୍କ ଦ୍ୱାରା ଯାଞ୍ଚ ହୁଏ।'
                : 'Escalation pipeline for low-confidence vision classifications (<70%) and farmer-referred field specimens for human scientific confirmation.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl text-xs">
            <span className="text-slate-500">Pending Review:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold">
              {queue.filter(q => q.status === 'pending_review').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Escalated Cases List */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 max-h-[580px] overflow-y-auto space-y-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            {lang === 'or' ? 'କେସ୍ ତାଲିକା' : 'Escalated Cases'} ({queue.length})
          </span>

          {queue.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">
                {lang === 'or' ? 'କୌଣସି ପେଣ୍ଡିଂ କେସ୍ ନାହିଁ।' : 'No pending cases requiring review.'}
              </p>
            </div>
          ) : (
            queue.map((item) => {
              const report = reports.find(r => r.id === item.reportId);
              const isSelected = item.reportId === selectedCaseId;
              return (
                <div
                  key={item.reportId}
                  onClick={() => setSelectedCaseId(item.reportId)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-agri-50 border-agri-600 shadow-sm' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {report?.identification.commonNameEn || 'Uncertain Pest Case'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        District: <strong>{item.farmerDistrict.toUpperCase()}</strong>
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'pending_review' ? 'Pending' : item.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-1 italic">
                    "{item.notes}"
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right 2 Cols: Detailed Inspection & Scientist Action Desk */}
        <div className="lg:col-span-2">
          {currentReport ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Case ID: {currentReport.id}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {lang === 'or' ? currentReport.identification.commonNameOr : currentReport.identification.commonNameEn}
                  </h3>
                  <p className="text-xs text-slate-500 italic">
                    {currentReport.identification.scientificName} • Confidence: <strong>{currentReport.identification.confidence}%</strong>
                  </p>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                  {currentQueueItem?.farmerDistrict.toUpperCase()} KVK Cluster
                </span>
              </div>

              {/* Case Photograph & Visual Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={currentReport.imageUri} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">Farmer Observation Log:</span>
                  <p><strong>Damage Category:</strong> {currentReport.severityAssessment}</p>
                  <p><strong>Yield Loss Estimate:</strong> {currentReport.potentialYieldLossRange}</p>
                  <p><strong>Observations:</strong> {currentReport.observedVisualFeatures.join(' ')}</p>
                  <p className="pt-2 text-slate-500">
                    Submission Time: {new Date(currentReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Scientist Advisory Note Input */}
              <div className="space-y-3 pt-2">
                <label className="font-bold text-xs text-slate-800 block">
                  {lang === 'or' ? 'କୃଷି ବିଜ୍ଞାନୀଙ୍କ ସ୍ୱତନ୍ତ୍ର ମତାମତ ଓ ନିର୍ଦ୍ଦେଶ:' : 'Official KVK Scientist Advisory & Prescription:'}
                </label>
                <textarea
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={lang === 'or' ? 'ଚାଷୀଙ୍କ ପାଇଁ ପ୍ରାମାଣିକ ପରାମର୍ଶ ଲେଖନ୍ତୁ...' : 'Enter verified diagnostic findings and prescription for the farmer...'}
                  rows={3}
                  className="w-full bg-slate-50 p-3.5 rounded-2xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:border-agri-600"
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleReviewAction('confirmed')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'or' ? 'ଚିହ୍ନଟ ନିଶ୍ଚିତ କରନ୍ତୁ' : 'Confirm Diagnosis'}</span>
                  </button>

                  <button
                    onClick={() => handleReviewAction('rejected')}
                    className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
                  >
                    {lang === 'or' ? 'ପୁନଃ-ନିର୍ଦ୍ଧାରଣ କରନ୍ତୁ' : 'Reclassify / Reject'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 space-y-2 border border-slate-200">
              <Building2 className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Select a case from the queue to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
