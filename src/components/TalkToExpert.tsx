import React, { useState, useEffect } from 'react';
import { 
  UserCheck, PhoneCall, MessageSquare, Calendar, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, FileText, Send, Mic, ChevronRight, X, Sparkles, Building2
} from 'lucide-react';
import { ExpertProfile, SupportRequest, ProblemCategory, ContactMethod } from '../types/expert';
import { ExpertService } from '../services/expertService';
import { ScanReport } from '../types/pest';
import { ExpertChat } from './ExpertChat';

interface TalkToExpertProps {
  lang: 'or' | 'en';
  activeReport?: ScanReport | null;
  onOpenReport?: (reportId: string) => void;
  farmerId?: string;
}

export const TalkToExpert: React.FC<TalkToExpertProps> = ({
  lang,
  activeReport,
  onOpenReport,
  farmerId = 'farmer-local'
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'directory' | 'my_requests'>('create');
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExpertForChat, setSelectedExpertForChat] = useState<SupportRequest | null>(null);

  // Request form state
  const [farmerName, setFarmerName] = useState<string>('Upendra Sahu');
  const [farmerPhone, setFarmerPhone] = useState<string>('9438000000');
  const [farmerDistrict, setFarmerDistrict] = useState<string>('bargarh');
  const [cropId, setCropId] = useState<string>(activeReport?.cropId || 'paddy');
  const [problemCategory, setProblemCategory] = useState<ProblemCategory>('pest_insect');
  const [description, setDescription] = useState<string>('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('chat');
  const [preferredDate, setPreferredDate] = useState<string>('2026-11-24');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('10:00 AM - 10:30 AM');
  const [selectedExpertId, setSelectedExpertId] = useState<string>('');
  const [attachAiDiagnosis, setAttachAiDiagnosis] = useState<boolean>(!!activeReport);
  const [farmerConsent, setFarmerConsent] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<SupportRequest | null>(null);

  // Expert registration modal
  const [isExpertRegOpen, setIsExpertRegOpen] = useState<boolean>(false);
  const [regFullName, setRegFullName] = useState<string>('');
  const [regInstitution, setRegInstitution] = useState<string>('');
  const [regQualification, setRegQualification] = useState<string>('');
  const [regSpecialization, setRegSpecialization] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [farmerId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const expList = await ExpertService.listExperts();
      setExperts(expList);

      const reqs = await ExpertService.listSupportRequests('farmer', farmerId);
      setMyRequests(reqs);
    } catch (e) {
      console.error('Error loading experts data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachDiagnosisToggle = () => {
    if (!activeReport) {
      alert(lang === 'or' ? 'ପ୍ରଥମେ ଗୋଟିଏ ଫସଲ ସ୍କାନ୍ କରନ୍ତୁ।' : 'Please complete a crop scan first.');
      return;
    }
    const nextVal = !attachAiDiagnosis;
    setAttachAiDiagnosis(nextVal);
    if (nextVal && activeReport) {
      setCropId(activeReport.cropId || 'paddy');
      if (activeReport.identification?.commonNameEn) {
        setDescription(prev => prev || `AI Scan observed ${activeReport.identification?.commonNameEn} symptoms with ${activeReport.identification?.confidence || 85}% confidence. Please advise on treatment.`);
      }
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const diagnosisSummary = attachAiDiagnosis && activeReport && farmerConsent ? {
        scan_id: activeReport.id,
        pest_id: activeReport.identification?.pestId,
        pest_name: activeReport.identification?.commonNameEn,
        confidence: activeReport.identification?.confidence || 85,
        severity: (activeReport as any).severityAssessment || 'Moderate',
        observed_symptoms: (activeReport as any).observedVisualFeatures || []
      } : undefined;

      const created = await ExpertService.createSupportRequest({
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        farmer_district: farmerDistrict,
        crop_id: cropId,
        problem_category: problemCategory,
        description: description,
        preferred_language: lang,
        contact_method: contactMethod,
        preferred_date: contactMethod !== 'chat' ? preferredDate : undefined,
        preferred_time_slot: contactMethod !== 'chat' ? preferredTimeSlot : undefined,
        ai_scan_id: attachAiDiagnosis && activeReport ? activeReport.id : undefined,
        ai_diagnosis_summary: diagnosisSummary,
        image_attachments: activeReport?.imageUri ? [activeReport.imageUri] : [],
        priority: (activeReport as any)?.severityAssessment === 'Critical' ? 'HIGH' : 'NORMAL'
      }, farmerId);

      setSubmittedRequest(created);
      setMyRequests([created, ...myRequests]);
      // If chat method, can immediately open chat
      if (contactMethod === 'chat') {
        setSelectedExpertForChat(created);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit support request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpertRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const exp = await ExpertService.registerExpert({
        full_name: regFullName,
        phone_number: regPhone,
        institution: regInstitution,
        qualification: regQualification,
        specialization: regSpecialization,
        experience_years: 6,
        languages: ['Odia', 'English'],
        location_district: 'Bargarh',
        consultation_modes: ['chat', 'callback', 'schedule']
      });
      setRegSuccess(
        lang === 'or'
          ? `ଡକ୍ଟର ${exp.full_name}, ଆପଣଙ୍କ ପଞ୍ଜୀକରଣ ଗ୍ରହଣ କରାଯାଇଛି। ପ୍ରଶାସକଙ୍କ ସତ୍ୟାପନ ପରେ ଆପଣ ଚାଷୀ କେସ୍ ଗ୍ରହଣ କରିପାରିବେ।`
          : `Application submitted for Dr. ${exp.full_name}. Awaiting verification by the research desk.`
      );
      setTimeout(() => {
        setIsExpertRegOpen(false);
        setRegSuccess(null);
      }, 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const categoryOptions = [
    { id: 'pest_insect', labelEn: 'Pest & Insect Infestation', labelOr: 'କୀଟ ଓ ପୋକ ଆକ୍ରମଣ', icon: '🐛' },
    { id: 'crop_disease', labelEn: 'Crop Diseases & Blight', labelOr: 'ଫସଲ ରୋଗ ଓ ଶିଥ୍ ବ୍ଲାଇଟ୍', icon: '🍂' },
    { id: 'soil_health', labelEn: 'Soil Health & Deficiencies', labelOr: 'ମୃତ୍ତିକା ପୋଷକ ତତ୍ତ୍ୱ ଅଭାବ', icon: '🌱' },
    { id: 'fertilizer', labelEn: 'Fertilizer & Nutrition', labelOr: 'ସାର ପ୍ରୟୋଗ ଓ ମାତ୍ରା', icon: '⚖️' },
    { id: 'irrigation', labelEn: 'Water & Irrigation Issues', labelOr: 'ପାଣି ମଡ଼ା ଓ ଜଳସେଚନ', icon: '💧' },
    { id: 'weather', labelEn: 'Weather & Heat Shock', labelOr: 'ପାଣିପାଗ ଓ ତାତି ସମସ୍ୟା', icon: '☀️' },
    { id: 'harvesting', labelEn: 'Harvesting & Storage', labelOr: 'ଅମଳ ଓ ଶସ୍ୟ ସଂରକ୍ଷଣ', icon: '🌾' },
    { id: 'other', labelEn: 'General Agricultural Question', labelOr: 'ଅନ୍ୟାନ୍ୟ କୃଷି ପ୍ରଶ୍ନ', icon: '❓' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F3822] to-[#1B5E39] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 text-xs font-bold uppercase tracking-wider mb-2 border border-lime-400/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{lang === 'or' ? 'କୃଷି ବୈଜ୍ଞାନିକ ପରାମର୍ଶ ଡେସ୍କ' : 'Agricultural Scientist Consultation Desk'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'or' ? 'କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ' : 'Talk to an Agricultural Expert'}
          </h1>
          <p className="text-agri-100 text-sm sm:text-base mt-2">
            {lang === 'or'
              ? 'OUAT ଭୁବନେଶ୍ୱର, KVK ବରଗଡ଼ ଏବଂ ICAR-NRRI କଟକର ପ୍ରମାଣିତ ବୈଜ୍ଞାନିକଙ୍କ ସହିତ ଲାଇଭ୍ ଚାଟ୍, କଲ୍‌ବ୍ୟାକ୍ କିମ୍ବା ପରାମର୍ଶ ସମୟ ସ୍ଥିର କରନ୍ତୁ।'
              : 'Direct human consultation with verified agronomists, entomologists, and pathologists from OUAT Bhubaneswar, KVK Bargarh, and ICAR-NRRI.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeTab === 'create' ? 'bg-lime-500 text-agri-950' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {lang === 'or' ? 'ନୂଆ ପରାମର୍ଶ ଅନୁରୋଧ' : 'Raise Support Request'}
            </button>

            <button
              onClick={() => setActiveTab('my_requests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeTab === 'my_requests' ? 'bg-lime-500 text-agri-950' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {lang === 'or' ? 'ମୋର ପରାମର୍ଶ' : 'My Requests'} ({myRequests.length})
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                activeTab === 'directory' ? 'bg-lime-500 text-agri-950' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {lang === 'or' ? 'ବିଶେଷଜ୍ଞ ତାଲିକା' : 'Verified Scientists'} ({experts.length})
            </button>

            <button
              onClick={() => setIsExpertRegOpen(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm ml-auto shadow-md"
            >
              {lang === 'or' ? 'ବିଶେଷଜ୍ଞ ଭାବେ ଯୋଗଦିଅନ୍ତୁ' : 'Join as Expert'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: The Support Request Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {lang === 'or' ? 'କୃଷି ସମସ୍ୟା ବିବରଣୀ ଦାଖଲ କରନ୍ତୁ' : 'Describe Your Agricultural Problem'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'or'
                  ? 'ଆପଣଙ୍କ ଫସଲର ସମସ୍ୟା ବର୍ଣ୍ଣନା କରନ୍ତୁ। ଆମର ବୈଜ୍ଞାନିକ ଟିମ୍ ଆପଣଙ୍କୁ ତୁରନ୍ତ ସଠିକ୍ ଉପଚାର ଜଣାଇବେ।'
                  : 'Submit details of your field condition. You may attach recent AI scan results and select preferred consultation mode.'}
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              {/* Problem Category Buttons */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-2 uppercase tracking-wider text-[11px]">
                  {lang === 'or' ? '୧. ସମସ୍ୟାର ପ୍ରକାର (Category):' : '1. Select Problem Category:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categoryOptions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setProblemCategory(c.id as ProblemCategory)}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        problemCategory === c.id
                          ? 'border-agri-700 bg-agri-50 text-agri-950 font-bold shadow-sm ring-1 ring-agri-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg mb-1">{c.icon}</span>
                      <span className="text-[11px] leading-tight">
                        {lang === 'or' ? c.labelOr : c.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation Method Tabs */}
              <div>
                <label className="font-extrabold text-slate-700 block mb-2 uppercase tracking-wider text-[11px]">
                  {lang === 'or' ? '୨. ପରାମର୍ଶ ମାଧ୍ୟମ (Contact Method):' : '2. Preferred Consultation Method:'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactMethod('chat')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                      contactMethod === 'chat'
                        ? 'border-agri-700 bg-agri-50 text-agri-950 font-bold shadow-sm ring-1 ring-agri-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 text-agri-800" />
                    <span className="text-xs font-bold">{lang === 'or' ? 'ଲାଇଭ୍ ଚାଟ୍' : 'Live Chat'}</span>
                    <span className="text-[10px] text-slate-400">Instant messaging</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('callback')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                      contactMethod === 'callback'
                        ? 'border-agri-700 bg-agri-50 text-agri-950 font-bold shadow-sm ring-1 ring-agri-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PhoneCall className="w-5 h-5 text-agri-800" />
                    <span className="text-xs font-bold">{lang === 'or' ? 'କଲ୍‌ବ୍ୟାକ୍' : 'Callback Request'}</span>
                    <span className="text-[10px] text-slate-400">Scientist calls you</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('schedule')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                      contactMethod === 'schedule'
                        ? 'border-agri-700 bg-agri-50 text-agri-950 font-bold shadow-sm ring-1 ring-agri-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-agri-800" />
                    <span className="text-xs font-bold">{lang === 'or' ? 'ନିର୍ଦ୍ଧାରିତ ସମୟ' : 'Scheduled Call'}</span>
                    <span className="text-[10px] text-slate-400">Pick date & slot</span>
                  </button>
                </div>
              </div>

              {/* Callback / Schedule Slot Picker */}
              {contactMethod !== 'chat' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Morning)</option>
                      <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM (Morning)</option>
                      <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM (Afternoon)</option>
                      <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Crop & District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Affected Crop</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="paddy">Paddy / Rice (ଧାନ)</option>
                    <option value="maize">Maize (ମକା)</option>
                    <option value="pulses">Pulses (ମୁଗ / ବିରି)</option>
                    <option value="tomato">Tomato (ବିଲାତି ବାଇଗଣ)</option>
                    <option value="brinjal">Brinjal (ବାଇଗଣ)</option>
                    <option value="chilli">Chilli (ଲଙ୍କା)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farmer District</label>
                  <select
                    value={farmerDistrict}
                    onChange={(e) => setFarmerDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="bargarh">Bargarh (ବରଗଡ଼)</option>
                    <option value="sambalpur">Sambalpur (ସମ୍ବଲପୁର)</option>
                    <option value="bolangir">Bolangir (ବଲାଙ୍ଗୀର)</option>
                    <option value="cuttack">Cuttack (କଟକ)</option>
                  </select>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">
                    {lang === 'or' ? 'ସମସ୍ୟାର ବିସ୍ତୃତ ବର୍ଣ୍ଣନା:' : 'Problem Description:'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'or' ? 'ଓଡ଼ିଆ କିମ୍ବା ଇଂରାଜୀରେ ଲେଖନ୍ତୁ' : 'Type in Odia or English'}
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'or' ? 'ପତ୍ରର ରଙ୍ଗ ବଦଳିବା, କାଣ୍ଡ ଶୁଖିବା କିମ୍ବା ପୋକ ଦେଖାଯିବା ସମସ୍ୟା ଲେଖନ୍ତୁ...' : 'Describe visible symptoms, crop stage, severity, and any applied treatments...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Farmer Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farmer Full Name</label>
                  <input
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              {/* Cross-Module AI Diagnosis Integration Section */}
              <div className="p-4 bg-lime-50 border border-lime-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-lime-700" />
                    <span className="font-extrabold text-lime-950 text-xs">
                      {lang === 'or' ? 'AI ରୋଗ ନିରୀକ୍ଷଣ ରିପୋର୍ଟ ସଂଲଗ୍ନ କରନ୍ତୁ' : 'Attach Recent AI Diagnostic Report'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAttachDiagnosisToggle}
                    className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                      attachAiDiagnosis ? 'bg-lime-700 text-white' : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    {attachAiDiagnosis ? 'Attached ✓' : 'Attach Report'}
                  </button>
                </div>

                {attachAiDiagnosis && activeReport && (
                  <div className="bg-white/80 p-3 rounded-xl border border-lime-300 text-[11px] space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Pest Diagnosed: {activeReport.identification?.commonNameEn}</span>
                      <span className="text-agri-800">Confidence: {activeReport.identification?.confidence || 85}%</span>
                    </div>
                    <p className="text-slate-600">Scan ID: {activeReport.id}</p>
                    <label className="flex items-center space-x-2 pt-1 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={farmerConsent}
                        onChange={(e) => setFarmerConsent(e.target.checked)}
                        className="rounded text-agri-700"
                      />
                      <span>I consent to share this diagnostic image and AI findings with assigned agricultural scientists.</span>
                    </label>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-agri-800 hover:bg-agri-900 disabled:bg-slate-300 text-white font-extrabold rounded-2xl shadow-md text-sm transition-all"
              >
                {submitting ? 'Submitting to Scientist Desk...' : (lang === 'or' ? 'ପରାମର୍ଶ ଅନୁରୋଧ ଦାଖଲ କରନ୍ତୁ' : 'Submit Consultation Request')}
              </button>
            </form>
          </div>

          {/* Right Col: Verified Experts Highlights & KVK Desk Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-agri-800" />
                <span>{lang === 'or' ? 'ଅନୁମୋଦିତ ଅନୁଷ୍ଠାନ ପ୍ୟାନେଲ୍' : 'Odisha Expert Network'}</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consultations are handled by certified scientists from:
              </p>
              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                  <span>OUAT College of Agriculture, Bhubaneswar</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                  <span>Krishi Vigyan Kendra (KVK) Bargarh</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                  <span>ICAR-National Rice Research Institute (NRRI)</span>
                </li>
              </ul>
            </div>

            {/* Quick Expert Cards */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Featured Scientists On-Duty
              </span>
              <div className="space-y-2.5">
                {experts.slice(0, 3).map((e) => (
                  <div key={e.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3 text-xs">
                    <img
                      src={e.avatar_url}
                      alt={e.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{e.full_name}</h4>
                      <span className="text-[10px] text-slate-500 block truncate">{e.specialization}</span>
                      <span className="text-[10px] text-amber-600 font-bold">★ {e.rating.toFixed(1)} ({e.total_consultations}+ cases)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {experts.map((e) => (
            <div key={e.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={e.avatar_url}
                    alt={e.full_name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                  />
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{e.full_name}</h3>
                    <span className="text-xs text-agri-800 font-semibold block">{e.institution}</span>
                    <span className="text-[11px] text-slate-500">{e.qualification}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Specialization</span>
                    <span className="font-bold text-slate-800">{e.specialization}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">{e.experience_years} Years Experience</span>
                    <span className="text-amber-500 font-bold">★ {e.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  {e.languages.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedExpertId(e.id);
                  setActiveTab('create');
                }}
                className="w-full py-2 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                {lang === 'or' ? 'ଏହି ବିଶେଷଜ୍ଞଙ୍କୁ ଅନୁରୋଧ କରନ୍ତୁ' : 'Request Consultation'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my_requests' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            {lang === 'or' ? 'ମୋର ପରାମର୍ଶ ଅନୁରୋଧ ସ୍ଥିତି' : 'My Raised Support Requests'}
          </h3>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">You have no active support requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedExpertForChat(req)}
                  className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 text-sm">#{req.reference_number}</span>
                      <span className="px-2 py-0.5 rounded-full bg-agri-100 text-agri-800 font-bold text-[10px] uppercase">
                        {req.problem_category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 font-bold text-[10px]">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{req.description}</p>
                    <span className="text-[11px] text-slate-400 block">
                      Assigned to: <span className="font-semibold text-slate-700">{req.assigned_expert_name || 'KVK Review Panel'}</span> | Method: {req.contact_method.toUpperCase()}
                    </span>
                  </div>

                  <button className="px-4 py-2 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1 flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{lang === 'or' ? 'ଚାଟ୍ ଖୋଲନ୍ତୁ' : 'Open Chat'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Chat Modal Component */}
      {selectedExpertForChat && (
        <ExpertChat
          request={selectedExpertForChat}
          lang={lang}
          currentUserId={farmerId}
          currentUserRole="farmer"
          onClose={() => setSelectedExpertForChat(null)}
          onStatusUpdated={() => loadData()}
        />
      )}

      {/* Expert Registration Modal */}
      {isExpertRegOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {lang === 'or' ? 'କୃଷି ବିଶେଷଜ୍ଞ ପଞ୍ଜୀକରଣ' : 'Agricultural Expert Onboarding'}
              </h3>
              <button onClick={() => setIsExpertRegOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            {regSuccess ? (
              <div className="p-6 bg-lime-50 border border-lime-200 rounded-2xl text-center text-xs text-lime-900 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-700 mx-auto" />
                <p className="font-bold">{regSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleExpertRegisterSubmit} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scientist / Expert Full Name</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Dr. Subrat Kumar Patnaik"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institution / University / KVK</label>
                  <input
                    type="text"
                    required
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="OUAT Bhubaneswar / KVK Bargarh / ICAR-NRRI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                    <input
                      type="text"
                      required
                      value={regQualification}
                      onChange={(e) => setRegQualification(e.target.value)}
                      placeholder="Ph.D. in Entomology"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specialization Focus</label>
                  <input
                    type="text"
                    required
                    value={regSpecialization}
                    onChange={(e) => setRegSpecialization(e.target.value)}
                    placeholder="e.g. Rice Pests & Brown Planthopper Ecology"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                >
                  Submit Expert Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
