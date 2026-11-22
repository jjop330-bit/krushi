import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Paperclip, CheckCheck, User, UserCheck, ShieldCheck, 
  Sparkles, Clock, AlertCircle, FileText
} from 'lucide-react';
import { SupportRequest, SupportMessage } from '../types/expert';
import { ExpertService } from '../services/expertService';

interface ExpertChatProps {
  request: SupportRequest;
  lang: 'or' | 'en';
  currentUserId: string;
  currentUserRole: 'farmer' | 'expert' | 'admin';
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const ExpertChat: React.FC<ExpertChatProps> = ({
  request,
  lang,
  currentUserId,
  currentUserRole,
  onClose,
  onStatusUpdated
}) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for persistent real-time chat updates
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [request.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const msgs = await ExpertService.getMessages(request.id, currentUserId);
      setMessages(msgs);
    } catch (e) {
      console.error('Failed to poll messages:', e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const senderName = currentUserRole === 'expert' 
        ? (request.assigned_expert_name || 'Agricultural Scientist')
        : request.farmer_name;

      const sent = await ExpertService.sendMessage(
        request.id,
        text,
        currentUserId,
        currentUserRole === 'expert' ? 'expert' : 'farmer',
        senderName
      );
      setMessages(prev => [...prev, sent]);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCloseSession = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please provide advisory resolution notes before closing the consultation.');
      return;
    }
    try {
      await ExpertService.updateRequestStatus(
        request.id,
        'RESOLVED',
        currentUserId,
        currentUserRole,
        'Consultation completed and advisory given',
        resolutionNotes
      );
      setIsClosingModalOpen(false);
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to close consultation');
    }
  };

  const quickChips = lang === 'or' ? [
    'ନିମ୍ବ ତେଲ (10,000 PPM) ୫ ମିଲି/ଲିଟର ସିଞ୍ଚନ କରନ୍ତୁ।',
    'କିଆରୀରୁ ତୁରନ୍ତ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ।',
    'ଆକ୍ରାନ୍ତ ଗଛର ଆଉ ଗୋଟିଏ ସ୍ପଷ୍ଟ ଫଟୋ ପଠାନ୍ତୁ।'
  ] : [
    'Drain stagnant field water immediately.',
    'Apply Azadirachtin 10,000 PPM @ 5ml/L.',
    'Please send a clearer close-up photograph of the leaf.'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-[#0F3822] to-[#1B5E39] text-white p-4 sm:p-5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold">
              {currentUserRole === 'expert' ? <User className="w-5 h-5" /> : <UserCheck className="w-5 h-5 text-lime-400" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                  {currentUserRole === 'expert' ? request.farmer_name : (request.assigned_expert_name || 'KVK Agronomist')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-lime-400 text-agri-950 text-[10px] font-extrabold">
                  #{request.reference_number}
                </span>
              </div>
              <p className="text-[11px] text-agri-200">
                {request.crop_id?.toUpperCase()} | {request.problem_category.toUpperCase()} | District: {request.farmer_district.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentUserRole === 'expert' && request.status !== 'RESOLVED' && (
              <button
                onClick={() => setIsClosingModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Resolve Case
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Diagnosis Context Card if attached */}
        {request.ai_diagnosis_summary && (
          <div className="bg-lime-50 border-b border-lime-200 p-3 px-4 text-xs text-lime-950 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2 truncate">
              <Sparkles className="w-4 h-4 text-lime-700 flex-shrink-0" />
              <span className="truncate">
                <span className="font-bold">Attached AI Scan:</span> {request.ai_diagnosis_summary.pest_name} ({request.ai_diagnosis_summary.confidence}% Confidence)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-lime-200 font-bold uppercase flex-shrink-0">
              Verified Case
            </span>
          </div>
        )}

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FBFBF7]">
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isSystem = msg.sender_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-medium max-w-md">
                    {msg.message_text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                  {msg.sender_name}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-agri-800 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.message_text}</p>
                </div>
                <div className="flex items-center space-x-1 mt-0.5 px-1 text-[10px] text-slate-400">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-agri-600" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips for Expert / Farmer */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">Quick:</span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-all border border-slate-200"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center space-x-2 flex-shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={lang === 'or' ? 'ଏଠାରେ ମେସେଜ୍ ଲେଖନ୍ତୁ...' : 'Type message here...'}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-agri-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-agri-800 hover:bg-agri-900 disabled:bg-slate-200 text-white rounded-2xl shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Resolution Notes Modal */}
        {isClosingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-3 shadow-2xl text-xs">
              <h3 className="text-base font-bold text-slate-900">Close Consultation & Record Advisory</h3>
              <p className="text-slate-500">Provide official recommendation notes for the farmer:</p>
              <textarea
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Advised spraying of Azadirachtin 10,000 PPM and water draining. Issue resolved."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={handleCloseSession}
                  className="flex-1 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Mark Case Resolved
                </button>
                <button
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
