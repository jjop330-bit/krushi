import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Bot, 
  User, 
  Sparkles, 
  HelpCircle,
  RefreshCw,
  Sprout,
  AlertCircle
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { voiceService, AudioPlaybackState } from '../services/voiceService';

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
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>('idle');
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePest = activeReport ? PEST_KNOWLEDGE_BASE[activeReport.identification.pestId] : null;

  // Cleanup voice engine when component unmounts
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

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
      if (playbackState === 'playing') {
        voiceService.pause();
        setPlaybackState('paused');
        return;
      } else if (playbackState === 'paused') {
        voiceService.resume();
        setPlaybackState('playing');
        return;
      } else if (playbackState === 'loading') {
        voiceService.stopSpeaking();
        setSpeakingMsgId(null);
        setPlaybackState('idle');
        return;
      }
    }

    // Stop ongoing speech and initiate speech synthesis for the new message
    setSpeakingMsgId(msgId);
    setPlaybackState('loading');
    setPlaybackError(null);

    voiceService.speak(text, lang, {
      onStateChange: (state) => {
        setPlaybackState(state);
      },
      onEnd: () => {
        setSpeakingMsgId(null);
        setPlaybackState('idle');
        setPlaybackError(null);
      },
      onError: (errMsg) => {
        setSpeakingMsgId(msgId);
        setPlaybackState('error');
        setPlaybackError(errMsg);
      }
    });
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setSpeakingMsgId(null);
    setPlaybackState('idle');
    setPlaybackError(null);
  };

  const handleReplay = (msgId: string, text: string) => {
    if (speakingMsgId === msgId && (playbackState === 'playing' || playbackState === 'paused')) {
      voiceService.replay();
    } else {
      handleSpeechOutput(msgId, text);
    }
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
      replyOr = 'ବୁଢ଼ିଆଣୀ (Wolf Spider) ହେଉଛି ଚାଷୀ ଭାଇଙ୍କ ପରମ ବନ୍ଧୁ। ଗୋଟିଏ ବୁଢ଼ିଆଣୀ ଦିନକୁ ୫ରୁ ୧୫ଟି ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ଖାଇ ନଷ୍ଟ କରିଥାଏ। ଯଦି ଗଛ ପ୍ରତି ୨-୩ଟି ବୁଢ଼ିଆଣୀ ଦେଖାଯାଉଛନ୍ତି, ତେବେ କୌଣସି କୀଟନାଶକ ପକାନ୍ତୁ ନାହିଁ।';
      replyEn = 'Wolf spiders (Lycosa pseudoannulata) are vital beneficial natural predators. A single spider preys on 5 to 15 brown plant hoppers per day. Conserve them by strictly avoiding prophylactic broad-spectrum insecticide sprays.';
    }
    // Query 4: Chemical Dosage & CIBRC Approved Safe Usage
    else if (qLower.includes('କେତେ ମାତ୍ରା') || qLower.includes('dose') || qLower.includes('dosage') || qLower.includes('chemical') || qLower.includes('କୀଟନାଶକ')) {
      if (pest && pest.chemicalControl) {
        replyOr = `କେନ୍ଦ୍ରୀୟ କୀଟନାଶକ ବୋର୍ଡ଼ (CIBRC) ଅନୁମୋଦିତ ସୁପାରିଶ: ${pest.chemicalControl.moleculeOr} (ବ୍ୟାପାରିକ ନାମ: ${pest.chemicalControl.popularBrand})। ଏହାର ନିର୍ଦ୍ଦିଷ୍ଟ ମାତ୍ରା ଏକର ପ୍ରତି ${pest.chemicalControl.dosagePerAcreOr}। ସିଞ୍ଚନ ବେଳେ ମାସ୍କ ଓ ହାତମୋଜା ନିଶ୍ଚୟ ପିନ୍ଧନ୍ତୁ।`;
        replyEn = `CIBRC approved prescription for ${pest.commonNameEn}: ${pest.chemicalControl.moleculeEn} (${pest.chemicalControl.popularBrand}). Apply exactly ${pest.chemicalControl.dosagePerAcreEn} with proper PPE mask and gloves.`;
      } else {
        replyOr = 'କୌଣସି ବି କୀଟନାଶକ ପ୍ରୟୋଗ କରିବା ପୂର୍ବରୁ ଆର୍ଥିକ କ୍ଷତି ସୀମା (ETL) ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ କୃଷି ବିଶେଷଜ୍ଞ କିମ୍ବା ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।';
        replyEn = 'Before applying any chemical pesticide, always verify Economic Threshold Levels (ETL) and consult your local Assistant Agriculture Officer (AAO).';
      }
    }
    // Query 5: Weather & District Pest Risks (ପାଗ ଓ ଜିଲ୍ଲା)
    else if (qLower.includes('ବରଗଡ଼') || qLower.includes('ସମ୍ବଲପୁର') || qLower.includes('district') || qLower.includes('weather') || qLower.includes('ପାଗ')) {
      replyOr = 'ବରଗଡ଼ ଏବଂ ସମ୍ବଲପୁର ଜିଲ୍ଲାରେ ହୀରାକୁଦ କେନାଲ ଅଞ୍ଚଳରେ ଅଧିକ ଆର୍ଦ୍ରତା ହେତୁ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ (BPH) ଏବଂ କାଣ୍ଡବିନ୍ଧା ପୋକର ଆଶଙ୍କା ରହିଛି। ନିୟମିତ କ୍ଷେତ ଯାଞ୍ଚ କରନ୍ତୁ।';
      replyEn = 'Canal irrigated commands in Bargarh and Sambalpur are presently vulnerable to Brown Plant Hopper (BPH) and Yellow Stem Borer due to warm humid microclimates. Scout fields weekly.';
    }
    // Default fallback
    else {
      if (pest) {
        replyOr = `ଆପଣ ${pest.commonNameOr} ସମ୍ପର୍କରେ ପଚାରିଛନ୍ତି। ଏହାକୁ ଦମନ କରିବା ପାଇଁ ତୁରନ୍ତ ଏହି ପଦକ୍ଷେପ ନିଅନ୍ତୁ: ${pest.immediateNextStepsOr[0]} ଏବଂ ${pest.immediateNextStepsOr[1]}। ଅଧିକ ଜାଣିବାକୁ ଚାହୁଁଥିଲେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।`;
        replyEn = `Regarding ${pest.commonNameEn}: The first recommended course of action is: ${pest.immediateNextStepsEn[0]} followed by ${pest.immediateNextStepsEn[1]}. Feel free to ask more specific questions.`;
      } else {
        replyOr = 'ମୁଁ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ବୁଝିପାରିଲି। ଧାନ ଫସଲର ପୋକ, ଜୈବିକ ନିୟନ୍ତ୍ରଣ, ଔଷଧ ମାତ୍ରା କିମ୍ବା ପାଣି ପରିଚାଳନା ବିଷୟରେ ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।';
        replyEn = 'I understand your query. You can ask me about rice pest identification, organic remedies, approved chemical dosages, or weather-linked pest risks.';
      }
    }

    return {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      textEn: replyEn,
      textOr: replyOr,
      timestamp: Date.now(),
      suggestedActionPills: pest ? [
        'What is the safe chemical dosage?',
        'How to prevent in next season?'
      ] : undefined,
      suggestedActionPillsOr: pest ? [
        'ସୁରକ୍ଷିତ ଔଷଧ ମାତ୍ରା କେତେ?',
        'ପରବର୍ତ୍ତୀ ଫସଲରେ କିପରି ସୁରକ୍ଷା ପାଇବି?'
      ] : undefined
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header with Title & Voice Badge */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-800 to-agri-950 text-lime-300 flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                {lang === 'or' ? 'ଓଡ଼ିଆ AI କୃଷି ସାଥୀ' : 'Odia AI Agricultural Assistant'}
              </h1>
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[10px] font-bold">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span>{lang === 'or' ? 'Sarvam Bulbul v3 Odia TTS' : 'Bulbul v3 Voice Engine'}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'or' ? 'ପ୍ରକୃତ ଓଡ଼ିଆ କଥୋପକଥନ ଓ ଅଡିଓ ସୁବିଧା' : 'Natural Odia and English speech generation for Odisha farmers'}
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
              <div className={`max-w-[85%] sm:max-w-md rounded-2xl p-4 text-sm leading-relaxed ${
                isUser 
                  ? 'bg-agri-800 text-white rounded-tr-none' 
                  : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-tl-none shadow-sm'
              }`}>
                {/* Readable transcript */}
                <p className="font-sans leading-relaxed text-slate-800 whitespace-pre-line">{displayText}</p>

                {/* Assistant Audio Readout Controls */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      {isSpeaking ? (
                        <div className="flex items-center space-x-1.5">
                          {playbackState === 'loading' ? (
                            <button
                              disabled
                              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold bg-amber-100 text-amber-900 border border-amber-300"
                            >
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                              <span>{lang === 'or' ? 'ଅଡିଓ ପ୍ରସ୍ତୁତ ହେଉଛି...' : 'Generating audio...'}</span>
                            </button>
                          ) : playbackState === 'error' ? (
                            <button
                              onClick={() => handleSpeechOutput(msg.id, displayText)}
                              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{lang === 'or' ? 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ' : 'Retry Audio'}</span>
                            </button>
                          ) : (
                            <>
                              {/* Play / Pause toggle */}
                              <button
                                onClick={() => handleSpeechOutput(msg.id, displayText)}
                                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold bg-agri-700 hover:bg-agri-800 text-white shadow-sm transition-colors"
                                title={playbackState === 'playing' ? 'Pause' : 'Resume'}
                              >
                                {playbackState === 'playing' ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5" />
                                    <span>{lang === 'or' ? 'ରଖନ୍ତୁ' : 'Pause'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    <span>{lang === 'or' ? 'ଚଲାନ୍ତୁ' : 'Resume'}</span>
                                  </>
                                )}
                              </button>

                              {/* Replay button */}
                              <button
                                onClick={() => handleReplay(msg.id, displayText)}
                                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                                title={lang === 'or' ? 'ପୁନର୍ବାର ଶୁଣନ୍ତୁ' : 'Replay'}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Stop button */}
                              <button
                                onClick={handleStopSpeaking}
                                className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors"
                                title={lang === 'or' ? 'ଅଡିଓ ବନ୍ଦ କରନ୍ତୁ' : 'Stop'}
                              >
                                <VolumeX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSpeechOutput(msg.id, displayText)}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold bg-slate-200/80 hover:bg-slate-200 text-slate-800 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-agri-800" />
                          <span>{lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' : 'Read Aloud'}</span>
                        </button>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Error message pill */}
                    {isSpeaking && playbackState === 'error' && playbackError && (
                      <div className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{playbackError}</span>
                      </div>
                    )}
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
      <div className="bg-white rounded-3xl p-3 shadow-md border border-slate-200 space-y-2">
        {/* Active Speech Recognition Banner */}
        {isListening && (
          <div className="px-3 py-2 rounded-xl bg-lime-50 border border-lime-300 flex items-center justify-between text-xs text-agri-950 font-bold">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 items-center">
                <span className="w-1.5 h-3 bg-lime-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-4 bg-lime-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-3 bg-lime-600 rounded-full animate-bounce"></span>
              </div>
              <span>{lang === 'or' ? 'ଆପଣ କହନ୍ତୁ, ମୁଁ ଶୁଣୁଛି...' : 'Listening to your voice in Odia or English...'}</span>
            </div>
            <button 
              type="button" 
              onClick={handleVoiceInput}
              className="text-[10px] bg-rose-500 hover:bg-rose-600 text-white px-2 py-0.5 rounded-md"
            >
              {lang === 'or' ? 'ରୋକନ୍ତୁ' : 'Stop'}
            </button>
          </div>
        )}

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
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-lime-500 hover:bg-lime-400 text-agri-950'
            }`}
            title={lang === 'or' ? 'ଓଡ଼ିଆରେ କହିବା ପାଇଁ ମାଇକ୍ ଦବାନ୍ତୁ' : 'Click to speak in Odia / English'}
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
