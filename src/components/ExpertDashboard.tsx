import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Clock, CheckCircle2, XCircle, AlertTriangle, MessageSquare, 
  PhoneCall, Calendar, FileText, Send, Sparkles, Building2, Search, Filter
} from 'lucide-react';
import { SupportRequest, ExpertProfile } from '../types/expert';
import { ExpertService } from '../services/expertService';
import { ExpertChat } from './ExpertChat';

interface ExpertDashboardProps {
  lang: 'or' | 'en';
  expertId?: string;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({
  lang,
  expertId = 'expert-dr-patnaik'
}) => {
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [chattingRequest, setChattingRequest] = useState<SupportRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedbackNote, setFeedbackNote] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [expertId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await ExpertService.getExpert(expertId);
      setProfile(p);

      const reqs = await ExpertService.listSupportRequests('expert', expertId);
      setRequests(reqs);
      if (reqs.length > 0 && !selectedRequest) {
        setSelectedRequest(reqs[0]);
      }
    } catch (e) {
      console.error('Failed to load expert dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reqId: string, newStatus: string, reason?: string) => {
    try {
      const updated = await ExpertService.updateRequestStatus(
        reqId,
        newStatus,
        expertId,
        'expert',
        reason || `Status updated to ${newStatus}`,
        feedbackNote || undefined
      );
      setRequests(requests.map(r => r.id === reqId ? updated : r));
      setSelectedRequest(updated);
      setFeedbackNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const pendingCount = requests.filter(r => r.status === 'ASSIGNED' || r.status === 'SUBMITTED').length;
  const inProgressCount = requests.filter(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS').length;
  const resolvedCount = requests.filter(r => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'or' ? 'ବିଶେଷଜ୍ଞ ପୋର୍ଟାଲ' : 'Agricultural Scientist Portal'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 text-xs font-extrabold flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-lime-700" />
              <span>{profile?.institution || 'OUAT Bhubaneswar'}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {profile?.full_name || 'Dr. Subrat Kumar Patnaik'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialization: <span className="font-semibold text-slate-700">{profile?.specialization}</span> | {profile?.qualification}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending Triage</span>
            <span className="text-lg font-black text-amber-600">{pendingCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Cases</span>
            <span className="text-lg font-black text-agri-800">{inProgressCount}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Resolved</span>
            <span className="text-lg font-black text-emerald-600">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Case Queue, Right Active Case Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Requests Queue */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3 flex flex-col max-h-[680px]">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Queue ({filteredRequests.length})
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2 py-1 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="all">All States</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                <p className="text-xs">No cases match selection.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-agri-700 bg-agri-50 shadow-sm ring-1 ring-agri-700'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-900">#{req.reference_number}</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        req.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span className="font-semibold">{req.farmer_name} ({req.farmer_district})</span>
                      <span className="uppercase text-[10px] font-bold text-slate-400">{req.contact_method}</span>
                    </div>

                    <p className="text-slate-500 line-clamp-1 text-[11px]">{req.description}</p>

                    {req.ai_diagnosis_summary && (
                      <div className="flex items-center space-x-1 text-[10px] text-lime-900 font-bold bg-lime-100/80 px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3 text-lime-700" />
                        <span>AI: {req.ai_diagnosis_summary.pest_name} ({req.ai_diagnosis_summary.confidence}%)</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Active Case Inspector & Resolution */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedRequest ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm text-slate-400">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">Select a support case from the queue to inspect details and provide recommendations.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-5 animate-fadeIn">
              {/* Case Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Case Reference:</span>
                    <span className="text-sm font-black text-slate-900">#{selectedRequest.reference_number}</span>
                    <span className="px-2 py-0.5 rounded-full bg-agri-100 text-agri-800 text-[10px] font-bold">
                      {selectedRequest.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {selectedRequest.problem_category.replace('_', ' ').toUpperCase()} on {selectedRequest.crop_id?.toUpperCase() || 'CROP'}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setChattingRequest(selectedRequest)}
                    className="px-4 py-2 bg-agri-800 hover:bg-agri-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Live Chat</span>
                  </button>
                </div>
              </div>

              {/* Farmer Profile Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Farmer Name</span>
                  <span className="font-bold text-slate-900">{selectedRequest.farmer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Contact</span>
                  <span className="font-bold text-slate-900">{selectedRequest.farmer_phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">District / Block</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedRequest.farmer_district}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Channel</span>
                  <span className="font-extrabold text-agri-800 uppercase">{selectedRequest.contact_method}</span>
                </div>
              </div>

              {/* Description & Field Condition */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Reported Field Symptoms:
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {selectedRequest.description}
                </div>
              </div>

              {/* AI Diagnostic Evidence Card */}
              {selectedRequest.ai_diagnosis_summary && (
                <div className="p-4 bg-lime-50 border border-lime-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-lime-700" />
                      <span className="font-extrabold text-lime-950">
                        AI Multimodal Vision Diagnosis Findings
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-lime-200 font-bold text-lime-900 text-[10px]">
                      {selectedRequest.ai_diagnosis_summary.confidence}% Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Identified Pest:</span>
                      <span className="font-bold text-slate-900 ml-1">{selectedRequest.ai_diagnosis_summary.pest_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Severity Assessment:</span>
                      <span className="font-bold text-slate-900 ml-1">{selectedRequest.ai_diagnosis_summary.severity || 'Moderate'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scientific Advisory & Case Resolution Form */}
              <div className="border-t border-slate-200 pt-4 space-y-3 text-xs">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Official Advisory Recommendation / Case Actions:
                </span>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Record formal agronomist advice, recommended biocontrol, chemical PHI instructions, or callback summary..."
                  className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedRequest.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'ACCEPTED', 'Scientist accepted case assignment')}
                      className="px-4 py-2 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-sm"
                    >
                      Accept Case Assignment
                    </button>
                  )}

                  {selectedRequest.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'RESOLVED', 'Consultation resolved with expert advice')}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm"
                    >
                      Record Advisory & Resolve Case
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'ESCALATED', 'Escalated to senior state entomologist panel')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Escalate to State Panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Chat Modal */}
      {chattingRequest && (
        <ExpertChat
          request={chattingRequest}
          lang={lang}
          currentUserId={expertId}
          currentUserRole="expert"
          onClose={() => setChattingRequest(null)}
          onStatusUpdated={() => loadData()}
        />
      )}
    </div>
  );
};
