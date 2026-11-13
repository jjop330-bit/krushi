import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle,
  RefreshCw,
  Sprout
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { voiceService } from '../services/voiceService';

interface VoiceAssistantProps {
  lang: 'or' | 'en';
  activeReport: ScanReport | null;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  lang,
  activeReport
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePest = activeReport ? PEST_KNOWLEDGE_BASE[activeReport.identification.pestId] : null;

  // Initial welcome message tailored to whether a scan is active
  useEffect(() => {
    let welcomeEn = "Namaste! I am Krushi Mitra AI, your personal agricultural voice assistant for Odisha. You can ask me questions by typing or speaking in Odia or English.";
    let welcomeOr = "ନମସ୍କାର! ମୁଁ କୃଷି ମିତ୍ର AI, ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ କୃଷି ସାଥୀ। ଆପଣ ଟାଇପ୍ କରି କିମ୍ବା ମାଇକ୍ ବଟନ୍ ଦବାଇ ଓଡ଼ିଆରେ ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।";

    if (activePest) {
      welcomeEn += ` Currently inspecting your scan of ${activePest.commonNameEn}. How can I assist you with this pest?`;
      welcomeOr += ` ବର୍ତ୍ତମାନ ଆପଣଙ୍କ କ୍ଷେତର ${activePest.commonNameOr} ବିଷୟରେ ଯାଞ୍ଚ ଚାଲିଛି। ଏହି ପୋକ ବିଷୟରେ କଣ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?`;
    }

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        textEn: welcomeEn,
        textOr: welcomeOr,
        timestamp: Date.now(),
        suggestedActionPills: [
          'Why did this pest attack my paddy?',
          'How can I control it without chemicals?',
          'What is the correct chemical dosage?'
        ],
        suggestedActionPillsOr: [
          'ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?',
          'ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?',
          'ଏହି ପୋକ କିପରି ଦୂର କରିବି?'
        ]
      }
    ]);
  }, [activeReport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    voiceService.startListening(
      (transcript) => {
        setIsListening(false);
        setInputText(transcript);
        handleSendQuery(transcript);
      },
      (error) => {
        setIsListening(false);
        console.warn('Speech recognition error', error);
      },
      lang
    );
  };

  const handleSpeechOutput = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msgId);
    voiceService.speak(text, lang, () => {
      setSpeakingMsgId(null);
    });
  };

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textEn: query,
      textOr: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent contextual response
    setTimeout(() => {
      const response = generateAssistantResponse(query, activePest, lang);
      setMessages(prev => [...prev, response]);

      // Automatically speak assistant response if user used voice
      if (isListening) {
        handleSpeechOutput(response.id, lang === 'or' ? response.textOr : response.textEn);
      }
    }, 600);
  };

  const generateAssistantResponse = (query: string, pest: any, language: 'or' | 'en'): ChatMessage => {
    const qLower = query.toLowerCase();
    let replyEn = '';
    let replyOr = '';

    // Query 1: Why did pest attack? (କାହିଁକି ଲାଗିଛି?)
    if (qLower.includes('କାହିଁକି') || qLower.includes('why') || qLower.includes('cause') || qLower.includes('reason')) {
      if (pest) {
        replyOr = `${pest.commonNameOr} କ୍ଷେତରେ ଲାଗିବାର ମୁଖ୍ୟ କାରଣ ହେଉଛି: ${pest.conditionsFavoringOr[0]} ଏବଂ ${pest.conditionsFavoringOr[1] || 'କ୍ଷେତରେ ଲଗାତାର ପାଣି ବାନ୍ଧି ରଖିବା ଓ ଅଧିକ ୟୁରିଆ ସାର ପକାଇବା'}।`;
        replyEn = `The primary factors behind the outbreak of ${pest.commonNameEn} are: ${pest.conditionsFavoringEn[0]} along with dense spacing and unbalanced nitrogen fertilizer application.`;
      } else {
        replyOr = 'ଧାନ ଫସଲରେ ପୋକ ଲାଗିବାର ପ୍ରଧାନ କାରଣ ହେଉଛି ଅତ୍ୟଧିକ ଆର୍ଦ୍ରତା, ମେଘୁଆ ପାଗ, ଘଞ୍ଚ ରୋପଣ ଏବଂ ମାତ୍ରାଧିକ ୟୁରିଆ (ଯବକ୍ଷାରଜାନ) ସାରର ଅଣ-ନିୟନ୍ତ୍ରିତ ବ୍ୟବହାର।';
        replyEn = 'Pest infestations in rice are primarily driven by sustained humidity above 80%, cloudy skies, narrow planting spacing, and excessive application of chemical urea.';
      }
    } 
    // Query 2: Non-chemical / biological control (ଔଷଧ ନ ପକାଇ)
    else if (qLower.includes('ଔଷଧ ନ ପକାଇ') || qLower.includes('without chemical') || qLower.includes('organic') || qLower.includes('ଜୈବିକ')) {
      if (pest) {
        replyOr = `ଔଷଧ ନ ପକାଇ ଆପଣ ଏହି ୩ଟି ପଦ୍ଧତି ଆପଣାଇପାରିବେ: ୧) ${pest.immediateNextStepsOr[0]} ୨) ${pest.immediateNextStepsOr[1]} ୩) ନିମ୍ବ ତେଲ (୧୫୦୦ ପିପିଏମ୍) ଲିଟର ପ୍ରତି ୪ ମିଲି ହିସାବରେ ସିଞ୍ଚନ କରନ୍ତୁ।`;
        replyEn = `To manage ${pest.commonNameEn} without synthetic chemicals: 1) ${pest.immediateNextStepsEn[0]} 2) ${pest.immediateNextStepsEn[1]} 3) Spray botanical Neem oil (Azadirachtin 1500 ppm) @ 3-5 ml/Litre.`;
      } else {
        replyOr = 'ବିନା ଔଷଧରେ କୀଟ ନିୟନ୍ତ୍ରଣ ପାଇଁ: ୧) କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ ୨) ପ୍ରତି ୨ ମିଟରରେ ୩୦ ସେମି ବାଟ ଛାଡ଼ନ୍ତୁ ୩) ଲିଙ୍ଗାକର୍ଷୀ ଫାନ୍ଦ (ଫେରୋମୋନ୍ ଟ୍ରାପ୍) ଲଗାନ୍ତୁ ୪) ବନ୍ଧୁ ବୁଢ଼ିଆଣୀଙ୍କୁ ସୁରକ୍ଷା ଦିଅନ୍ତୁ।';
        replyEn = 'Non-chemical IPM methods include: Alternate Wetting and Drying (AWD), creating 30cm alleyways every 2m, installing pheromone traps, and conserving predatory spiders.';
      }
    }
    // Query 3: Wolf Spiders / Beneficial insects (ବୁଢ଼ିଆଣୀ)
    else if (qLower.includes('ବୁଢ଼ିଆଣୀ') || qLower.includes('spider') || qLower.includes('predator') || qLower.includes('ବନ୍ଧୁ ପୋକ')) {
      replyOr = 'ବୁଢ଼ିଆଣୀ (ଲାଇକୋସା ବୁଢ଼ିଆଣୀ) ହେଉଛି ଚାଷୀଙ୍କର ବନ୍ଧୁ କୀଟ! ଗୋଟିଏ ବୁଢ଼ିଆଣୀ ଦିନକୁ ୧୫-୨୫ଟି ଗୁଣ୍ଡି ପୋକ ଖାଇ ଫସଲ ରକ୍ଷା କରେ। କ୍ଷେତରେ ବୁଢ଼ିଆଣୀ ଥିଲେ କୌଣସି ବିଷାକ୍ତ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।';
      replyEn = 'The Wolf Spider (Lycosa pseudoannulata) is a highly beneficial natural enemy! A single spider preys on 15 to 25 planthoppers per day. Never spray broad-spectrum insecticides if spiders are actively hunting in your field.';
    }
    // Query 4: District risk / Bargarh (ବରଗଡ଼ / ଜିଲ୍ଲା)
    else if (qLower.includes('ବରଗଡ଼') || qLower.includes('bargarh') || qLower.includes('ସମ୍ବଲପୁର') || qLower.includes('ଜିଲ୍ଲା') || qLower.includes('district')) {
      replyOr = 'ବରଗଡ଼ ଏବଂ ସମ୍ବଲପୁର କେନାଲ ଅଞ୍ଚଳରେ ଏବେ ୮୮% ଆର୍ଦ୍ରତା ଓ ୩୦°C ତାପମାତ୍ରା ଥିବାରୁ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ (BPH) ହପରବର୍ନର ଉଚ୍ଚ ଆଶଙ୍କା ରହିଛି। ଚାଷୀମାନେ ନିୟମିତ ଗଛ ମୂଳ ଯାଞ୍ଚ କରିବା ଉଚିତ।';
      replyEn = 'Agro-meteorological records in Bargarh & Sambalpur show 88% humidity and 30°C temperature, creating a high risk of Brown Planthopper (BPH) hopperburn in dense irrigated tillers. Immediate scouting is advised.';
    }
    // Default contextual answer
    else {
      if (pest) {
        replyOr = `${pest.commonNameOr} ନିୟନ୍ତ୍ରଣ ପାଇଁ ସର୍ବପ୍ରଥମେ କ୍ଷେତରୁ ପାଣି କାଢ଼ି ୩-୪ ଦିନ ଶୁଖାନ୍ତୁ। ଯଦି ପୋକ ସଂଖ୍ୟା ଗଛ ପ୍ରତି ୧୫ରୁ ବେଶୀ ହୁଏ, ତେବେ ପେକ୍ସାଲୋନ୍ (୯୪ ମିଲି) କିମ୍ବା ଚେସ୍ (୧୨୦ ଗ୍ରାମ) ୨୦୦ ଲିଟର ପାଣିରେ ମିଶାଇ ଗଛ ମୂଳକୁ ସିଞ୍ଚନ କରନ୍ତୁ।`;
        replyEn = `For ${pest.commonNameEn}, immediately drain field water for 3-4 days (AWD). If hopper population exceeds ETL (15 hoppers/hill), apply registered Triflumezopyrim 10% SC @ 94 ml/acre or Pymetrozine 50% WG @ 120 g/acre in 200 Litres water directed at the stem base.`;
      } else {
        replyOr = 'ଧାନ କ୍ଷେତରେ ଯେକୌଣସି ପୋକ ଚିହ୍ନଟ କରିବା ପାଇଁ ଉପରେ ଥିବା "ସ୍କାନର" ବଟନ୍ ଦବାଇ ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ। ମୁଁ ଆପଣଙ୍କୁ ସଠିକ ଉପଚାର ବତାଇବି।';
        replyEn = 'To identify any specific rice pest in your field, tap the "AI Pest Scanner" above and upload a photo. I will provide verified diagnosis and 3-tier treatment instructions.';
      }
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      textEn: replyEn,
      textOr: replyOr,
      timestamp: Date.now(),
      suggestedActionPills: ['Tell me about biological control', 'When should I call KVK?'],
      suggestedActionPillsOr: ['ଜୈବିକ ନିୟନ୍ତ୍ରଣ ବିଷୟରେ କୁହନ୍ତୁ', 'KVK ବୈଜ୍ଞାନିକଙ୍କୁ କେବେ ଡାକିବି?']
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-800 to-agri-950 text-lime-300 flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                {lang === 'or' ? 'ଓଡ଼ିଆ AI କୃଷି ସାଥୀ' : 'Odia AI Agricultural Assistant'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300">
                Voice Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'or' ? 'ଓଡ଼ିଆ ଓ ଇଂରାଜୀରେ ମୁକ୍ତ ଭାବେ କଥା ହୁଅନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ' : 'Converse freely via text or voice in Odia and English'}
            </p>
          </div>
        </div>

        {activePest && (
          <div className="bg-agri-50 border border-agri-200 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 text-agri-900 font-semibold">
            <Sprout className="w-4 h-4 text-agri-700" />
            <span>{lang === 'or' ? `ସକ୍ରିୟ: ${activePest.commonNameOr}` : `Context: ${activePest.commonNameEn}`}</span>
          </div>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMsgId === msg.id;
          const displayText = lang === 'or' ? msg.textOr : msg.textEn;

          return (
            <div 
              key={msg.id} 
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isUser 
                  ? 'bg-agri-800 text-white' 
                  : 'bg-lime-400 text-agri-950 shadow-sm'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[82%] sm:max-w-md rounded-2xl p-4 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-agri-800 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-none shadow-sm'
              }`}>
                <p>{displayText}</p>

                {/* Assistant Audio Readout Button */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleSpeechOutput(msg.id, displayText)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-colors font-bold ${
                        isSpeaking 
                          ? 'bg-rose-500 text-white animate-pulse' 
                          : 'bg-slate-200/70 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-agri-800" />}
                      <span>{isSpeaking ? (lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Stop') : (lang === 'or' ? 'ଶୁଣନ୍ତୁ' : 'Read Aloud')}</span>
                    </button>

                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Suggested Action Quick Pills */}
                {msg.suggestedActionPills && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(lang === 'or' ? msg.suggestedActionPillsOr : msg.suggestedActionPills)?.map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendQuery(pill)}
                        className="px-2.5 py-1 rounded-full bg-agri-100 hover:bg-agri-200 text-agri-900 text-xs font-semibold border border-agri-200 transition-colors"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Voice & Send */}
      <div className="bg-white rounded-3xl p-3 shadow-md border border-slate-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
          className="flex items-center space-x-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl transition-all shadow-sm ${
              isListening 
                ? 'bg-rose-600 text-white animate-bounce' 
                : 'bg-lime-500 hover:bg-lime-400 text-agri-950'
            }`}
            title="Click to speak in Odia / English"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening 
                ? (lang === 'or' ? 'ଆପଣ କହନ୍ତୁ, ମୁଁ ଶୁଣୁଛି...' : 'Listening to your voice...') 
                : (lang === 'or' ? 'ଓଡ଼ିଆରେ ନିଜ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ କିମ୍ବା ମାଇକ୍ ବଟନ୍ ଦବାନ୍ତୁ...' : 'Ask question in Odia or English...')
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-agri-800 hover:bg-agri-900 disabled:bg-slate-200 disabled:text-slate-400 text-lime-300 font-bold transition-all shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Preset Farmer Quick Questions Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 text-xs">
        <span className="font-bold text-slate-500 whitespace-nowrap pl-1">
          {lang === 'or' ? 'ପ୍ରଶ୍ନ ନମୁନା:' : 'Quick Questions:'}
        </span>
        {[
          { or: 'ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?', en: 'Why did this pest attack my paddy?' },
          { or: 'ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?', en: 'What organic methods can I use?' },
          { or: 'ବୁଢ଼ିଆଣୀ ଥିଲେ ଔଷଧ ପକାଇବା ଉଚିତ କି?', en: 'Should I spray if spiders are in the field?' },
          { or: 'ବରଗଡ଼ରେ ଏବେ କେଉଁ ପୋକର ବିପଦ ଅଛି?', en: 'What pest risk is active in Bargarh?' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(lang === 'or' ? item.or : item.en)}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap border border-slate-200 transition-colors"
          >
            {lang === 'or' ? item.or : item.en}
          </button>
        ))}
      </div>
    </div>
  );
};
