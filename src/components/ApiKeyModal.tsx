import React, { useState } from 'react';
import { Key, X, CheckCircle2, AlertCircle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { StorageService, AppSettings } from '../services/storageService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'or' | 'en';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [apiKey, setApiKey] = useState(StorageService.getApiKey());
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    StorageService.saveApiKey(apiKey);
    StorageService.saveSettings(settings);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMsg(lang === 'or' ? 'ଦୟାକରି Gemini API କି ପ୍ରବେଶ କରନ୍ତୁ।' : 'Please enter a Gemini API Key first.');
      return;
    }

    setTestStatus('testing');
    try {
      const activeModel = settings.selectedModel || 'gemini-1.5-flash';
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the word OK if you receive this.' }] }]
        })
      });

      if (!resp.ok) {
        throw new Error(`API responded with status ${resp.status}`);
      }

      setTestStatus('success');
      setTestMsg(lang === 'or' ? 'ସଂଯୋଗ ସଫଳ ହେଲା! Gemini Vision ସକ୍ରିୟ ଅଛି।' : 'Connection Verified! Gemini Vision API is operational.');
    } catch (err: any) {
      setTestStatus('error');
      setTestMsg(err.message || 'Connection test failed. Check key validity and permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-agri-100 text-agri-900 flex items-center justify-center">
              <Key className="w-5 h-5 text-agri-800" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">
                {lang === 'or' ? 'AI ମଡେଲ ସେଟିଂସ ଓ କନଫିଗୁରେସନ' : 'AI Engine & Gemini API Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure live multimodal vision or offline expert baseline
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live vs Baseline Toggle */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">
              {lang === 'or' ? 'ଲାଇଭ୍ Gemini Vision ବ୍ୟବହାର କରନ୍ତୁ' : 'Enable Live Multimodal Gemini API'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.useLiveGemini}
                onChange={(e) => setSettings({ ...settings, useLiveGemini: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agri-700"></div>
            </label>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {settings.useLiveGemini
              ? (lang === 'or' ? 'ଲାଇଭ୍ Gemini Vision ଅନ-ଡିମାଣ୍ଡ ବିଶ୍ଳେଷଣ କରିବ।' : 'Live Gemini Vision API will analyze user photographs in real time.')
              : (lang === 'or' ? 'ଅଫଲାଇନ୍ ମୋଡ୍ ସକ୍ରିୟ: ICAR-NRRI ଓ OUAT ର ପରୀକ୍ଷିତ ତଥ୍ୟ ବ୍ୟବହାର ହେବ (ନୂତନ ଫଟୋ ଚିହ୍ନଟ ପାଇଁ API କି ଆବଶ୍ୟକ)।' : 'Operating in Deterministic Knowledge-Base Mode using authentic ICAR-NRRI & OUAT data (Live AI vision requires configured API key or backend server).')}
          </p>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Gemini API Key</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-agri-700 hover:underline flex items-center space-x-1"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-50 p-3 rounded-2xl text-xs sm:text-sm border border-slate-300 font-mono focus:outline-none focus:border-agri-700"
          />
        </div>

        {/* Model Selector */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs text-slate-700">
            {lang === 'or' ? 'Gemini ମଡେଲ ଚୟନ' : 'Multimodal Vision Model'}
          </label>
          <select
            value={settings.selectedModel || 'gemini-3.5-flash'}
            onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value as any })}
            className="w-full bg-slate-50 p-3 rounded-2xl text-xs sm:text-sm border border-slate-300 font-medium focus:outline-none focus:border-agri-700"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Active Developer API Production Model)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High-Speed Multimodal)</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy Model)</option>
          </select>
        </div>

        {/* Security Warning Callout */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>{lang === 'or' ? 'ସୁରକ୍ଷା ସୂଚନା' : 'Security Architecture Notice'}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            {lang === 'or' 
              ? 'ବ୍ରାଉଜରରେ ରଖାଯାଇଥିବା API କି କ୍ଲାଏଣ୍ଟ-ସାଇଡରେ ଥାଏ। ଉତ୍ପାଦନ (Production) ପାଇଁ backend/.env ରେ GEMINI_API_KEY ରଖିବା ସୁରକ୍ଷିତ।'
              : 'Keys entered here run in Client BYOK Mode (stored in browser localStorage). For production security, configure GEMINI_API_KEY on the Python backend server (backend/.env) to prevent client key exposure.'}
          </p>
        </div>

        {/* Test Connection Button & Status */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>

          {testStatus === 'success' && (
            <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Connected</span>
            </span>
          )}

          {testStatus === 'error' && (
            <span className="text-xs font-bold text-rose-700 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Failed</span>
            </span>
          )}
        </div>

        {testMsg && (
          <p className={`text-xs p-3 rounded-xl ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
            {testMsg}
          </p>
        )}

        {/* Save & Close */}
        <div className="pt-3 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-agri-800 hover:bg-agri-900 text-lime-300 font-extrabold text-xs sm:text-sm transition-all shadow-md"
          >
            {lang === 'or' ? 'ସେଟିଂସ ସଂରକ୍ଷଣ କରନ୍ତୁ' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
