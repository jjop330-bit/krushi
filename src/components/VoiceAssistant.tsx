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
  AlertCircle,
  Square
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { ScanReport } from '../types/pest';
import { PEST_KNOWLEDGE_BASE } from '../data/pestsData';
import { StorageService } from '../services/storageService';
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
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
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
  }, [messages, isGeneratingAnswer]);

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
        handleSendQuery(transcript, true);
      },
      (error) => {
        setIsListening(false);
        console.warn('Speech recognition error', error);
      },
      lang
    );
  };

  const handleSpeechOutput = (msgId: string, text: string, speechLang: 'or' | 'en' = 'or') => {
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

    voiceService.speak(text, speechLang, {
      speaker: 'shubh',
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

  const handleReplay = (msgId: string, text: string, speechLang: 'or' | 'en' = 'or') => {
    if (speakingMsgId === msgId && (playbackState === 'playing' || playbackState === 'paused')) {
      voiceService.replay();
    } else {
      handleSpeechOutput(msgId, text, speechLang);
    }
  };

  // Format treatment steps cleanly without double periods or malformed mid-sentence casing
  const formatTreatmentStepsEn = (steps: string[]): string => {
    if (!steps || steps.length === 0) return '';
    const cleanStep0 = steps[0].trim().replace(/\.+$/, '');
    if (steps.length === 1) return `${cleanStep0}.`;
    let cleanStep1 = steps[1].trim().replace(/\.+$/, '');
    if (cleanStep1) {
      cleanStep1 = cleanStep1.charAt(0).toLowerCase() + cleanStep1.slice(1);
    }
    return `${cleanStep0}, followed by ${cleanStep1}.`;
  };

  const formatTreatmentStepsOr = (steps: string[]): string => {
    if (!steps || steps.length === 0) return '';
    const cleanStep0 = steps[0].trim().replace(/[।\.]*$/, '');
    if (steps.length === 1) return `${cleanStep0}।`;
    const cleanStep1 = steps[1].trim().replace(/[।\.]*$/, '');
    return `${cleanStep0} ଏବଂ ${cleanStep1}।`;
  };

  // Intent handling for greetings and small talk
  const checkGreetingOrSmallTalk = (q: string, pest: any) => {
    const qClean = q.trim().toLowerCase();
    const qNormalized = qClean.replace(/[!?.,;:।]+$/, '').trim();

    const greetings = [
      'hi', 'hii', 'hiii', 'hello', 'hey', 'namaste', 'namaskar', 'namaskara',
      'good morning', 'good afternoon', 'good evening', 'greetings',
      'how are you', 'who are you', 'how r u', 'kemiti achhanti', 'kemiti achha',
      'ନମସ୍କାର', 'ନମସ୍କାର୍', 'ଜୁହାର', 'ନମସ୍ତେ', 'ହେଲୋ', 'ହାଏ', 'କେମିତି ଅଛନ୍ତି', 'କେମିତି ଅଛ', 'ଆପଣ କିଏ'
    ];

    const thanks = [
      'thanks', 'thank you', 'thank u', 'thx', 'dhanyabad', 'dhanyavad', 'dhanyawad',
      'ଧନ୍ୟବାଦ', 'ଧନ୍ୟବାଦ୍'
    ];

    const isGreeting = greetings.includes(qNormalized) || 
      greetings.some(g => qNormalized.startsWith(g + ' ')) || 
      /^(h+i+|h+e+y+|h+e+l+o+|namaste|namaskar|ନମସ୍କାର|ଜୁହାର)\b/i.test(qNormalized);

    const isThanks = thanks.includes(qNormalized) || 
      thanks.some(t => qNormalized.startsWith(t + ' '));

    const defaultPillsEn = [
      'Why did this pest attack my paddy?',
      'How can I control it without chemicals?',
      'What is the correct chemical dosage?'
    ];
    const defaultPillsOr = [
      'ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?',
      'ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?',
      'ଏହି ପୋକ କିପରି ଦୂର କରିବି?'
    ];

    if (isGreeting) {
      return {
        replyEn: pest 
          ? `Namaste! How can I help you with your ${pest.commonNameEn} problem?`
          : 'Namaste! How can I help you with your crop today?',
        replyOr: pest 
          ? `ନମସ୍କାର! ଆପଣଙ୍କ ${pest.commonNameOr} ସମସ୍ୟାରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?`
          : 'ନମସ୍କାର! ଆଜି ଆପଣଙ୍କ ଫସଲ ସମ୍ପର୍କରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    if (isThanks) {
      return {
        replyEn: pest 
          ? `You're welcome! Let me know if you need more help with ${pest.commonNameEn}.`
          : "You're welcome! Feel free to ask if you have more questions about your crops.",
        replyOr: pest 
          ? `ସ୍ୱାଗତମ୍! ${pest.commonNameOr} ସମ୍ପର୍କରେ ଆଉ କିଛି ସହାୟତା ଆବଶ୍ୟକ ହେଲେ ପଚାରନ୍ତୁ।`
          : 'ସ୍ୱାଗତମ୍! ଆପଣଙ୍କ ଫସଲ ସମ୍ପର୍କରେ ଆଉ କିଛି ପ୍ରଶ୍ନ ଥିଲେ ପଚାରନ୍ତୁ।',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    return null;
  };

  // Suggestion chips canned answers matching
  const checkSuggestionChips = (q: string, pest: any) => {
    const qLower = q.trim().toLowerCase();
    const defaultPillsEn = [
      'Why did this pest attack my paddy?',
      'How can I control it without chemicals?',
      'What is the correct chemical dosage?'
    ];
    const defaultPillsOr = [
      'ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?',
      'ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?',
      'ଏହି ପୋକ କିପରି ଦୂର କରିବି?'
    ];

    // Chip 1: Why did pest attack?
    const isChipWhy = 
      qLower.includes('why did this pest attack') ||
      qLower.includes('why did pest attack') ||
      qLower.includes('ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି') ||
      qLower.includes('ପୋକ କାହିଁକି ଲାଗିଛି') ||
      (qLower.includes('why') && (qLower.includes('attack') || qLower.includes('pest'))) ||
      (qLower.includes('କାହିଁକି') && (qLower.includes('ପୋକ') || qLower.includes('ଧାନ')));

    if (isChipWhy) {
      if (pest) {
        return {
          replyOr: `${pest.commonNameOr} କ୍ଷେତରେ ଲାଗିବାର ମୁଖ୍ୟ କାରଣ ହେଉଛି: ${pest.conditionsFavoringOr[0]} ଏବଂ ${pest.conditionsFavoringOr[1] || 'କ୍ଷେତରେ ଲଗାତାର ପାଣି ବାନ୍ଧି ରଖିବା ଓ ଅଧିକ ୟୁରିଆ ସାର ପକାଇବା'}।`,
          replyEn: `The primary factors behind the outbreak of ${pest.commonNameEn} are: ${pest.conditionsFavoringEn[0]} along with dense spacing and unbalanced nitrogen fertilizer application.`,
          pillsEn: defaultPillsEn,
          pillsOr: defaultPillsOr
        };
      }
      return {
        replyOr: 'ଧାନ ଫସଲରେ ପୋକ ଲାଗିବାର ପ୍ରଧାନ କାରଣ ହେଉଛି ଅତ୍ୟଧିକ ଆର୍ଦ୍ରତା, ମେଘୁଆ ପାଗ, ଘଞ୍ଚ ରୋପଣ ଏବଂ ମାତ୍ରାଧିକ ୟୁରିଆ (ଯବକ୍ଷାରଜାନ) ସାରର ଅଣ-ନିୟନ୍ତ୍ରିତ ବ୍ୟବହାର।',
        replyEn: 'Pest infestations in rice are primarily driven by sustained humidity above 80%, cloudy skies, narrow planting spacing, and excessive application of chemical urea.',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    // Chip 2: Control without chemicals
    const isChipNonChemical = 
      qLower.includes('control without chemicals') ||
      qLower.includes('without chemicals') ||
      qLower.includes('without chemical') ||
      qLower.includes('ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି') ||
      qLower.includes('ଔଷଧ ନ ପକାଇ') ||
      qLower.includes('ବିନା ଔଷଧ') ||
      qLower.includes('organic control') ||
      qLower.includes('biological control') ||
      qLower.includes('ଜୈବିକ');

    if (isChipNonChemical) {
      if (pest && pest.immediateNextStepsOr) {
        return {
          replyOr: `ଔଷଧ ନ ପକାଇ ଆପଣ ଏହି ୩ଟି ପଦ୍ଧତି ଆପଣାଇପାରିବେ: ୧) ${pest.immediateNextStepsOr[0]} ୨) ${pest.immediateNextStepsOr[1]} ୩) ନିମ୍ବ ତେଲ (୧୫୦୦ ପିପିଏମ୍) ଲିଟର ପ୍ରତି ୪ ମିଲି ହିସାବରେ ସିଞ୍ଚନ କରନ୍ତୁ।`,
          replyEn: `To manage ${pest.commonNameEn} without synthetic chemicals: 1) ${pest.immediateNextStepsEn[0]} 2) ${pest.immediateNextStepsEn[1]} 3) Spray botanical Neem oil (Azadirachtin 1500 ppm) @ 3-5 ml/Litre.`,
          pillsEn: defaultPillsEn,
          pillsOr: defaultPillsOr
        };
      }
      return {
        replyOr: 'ବିନା ଔଷଧରେ କୀଟ ନିୟନ୍ତ୍ରଣ ପାଇଁ: ୧) କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ ୨) ପ୍ରତି ୨ ମିଟରରେ ୩୦ ସେମି ବାଟ ଛାଡ଼ନ୍ତୁ ୩) ଲିଙ୍ଗାକର୍ଷୀ ଫାନ୍ଦ (ଫେରୋମୋନ୍ ଟ୍ରାପ୍) ଲଗାନ୍ତୁ ୪) ବନ୍ଧୁ ବୁଢ଼ିଆଣୀଙ୍କୁ ସୁରକ୍ଷା ଦିଅନ୍ତୁ।',
        replyEn: 'Non-chemical IPM methods include: Alternate Wetting and Drying (AWD), creating 30cm alleyways every 2m, installing pheromone traps, and conserving predatory spiders.',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    // Chip 3: Correct chemical dosage
    const isChipDosage = 
      qLower.includes('correct chemical dosage') ||
      qLower.includes('chemical dosage') ||
      qLower.includes('what is the correct chemical dosage') ||
      qLower.includes('ଏହି ପୋକ କିପରି ଦୂର କରିବି') ||
      qLower.includes('କେତେ ମାତ୍ରା') ||
      ((qLower.includes('dosage') || qLower.includes('dose')) && (qLower.includes('chemical') || qLower.includes('pesticide')));

    if (isChipDosage) {
      if (pest && pest.chemicalControl) {
        return {
          replyOr: `କେନ୍ଦ୍ରୀୟ କୀଟନାଶକ ବୋର୍ଡ଼ (CIBRC) ଅନୁମୋଦିତ ସୁପାରିଶ: ${pest.chemicalControl.moleculeOr} (ବ୍ୟାପାରିକ ନାମ: ${pest.chemicalControl.popularBrand})। ଏହାର ନିର୍ଦ୍ଦିଷ୍ଟ ମାତ୍ରା ଏକର ପ୍ରତି ${pest.chemicalControl.dosagePerAcreOr}। ସିଞ୍ଚନ ବେଳେ ମାସ୍କ ଓ ହାତମୋଜା ନିଶ୍ଚୟ ପିନ୍ଧନ୍ତୁ।`,
          replyEn: `CIBRC approved prescription for ${pest.commonNameEn}: ${pest.chemicalControl.moleculeEn} (${pest.chemicalControl.popularBrand}). Apply exactly ${pest.chemicalControl.dosagePerAcreEn} with proper PPE mask and gloves.`,
          pillsEn: defaultPillsEn,
          pillsOr: defaultPillsOr
        };
      }
      return {
        replyOr: 'କୌଣସି ବି କୀଟନାଶକ ପ୍ରୟୋଗ କରିବା ପୂର୍ବରୁ ଆର୍ଥିକ କ୍ଷତି ସୀମା (ETL) ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ କୃଷି ବିଶେଷଜ୍ଞ କିମ୍ବା ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
        replyEn: 'Before applying any chemical pesticide, always verify Economic Threshold Levels (ETL) and consult your local Assistant Agriculture Officer (AAO).',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    // Beneficial Spiders
    if (qLower.includes('ବୁଢ଼ିଆଣୀ') || qLower.includes('spider') || qLower.includes('predator') || qLower.includes('ବନ୍ଧୁ ପୋକ')) {
      return {
        replyOr: 'ବୁଢ଼ିଆଣୀ (Wolf Spider) ହେଉଛି ଚାଷୀ ଭାଇଙ୍କ ପରମ ବନ୍ଧୁ। ଗୋଟିଏ ବୁଢ଼ିଆଣୀ ଦିନକୁ ୫ରୁ ୧୫ଟି ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ଖାଇ ନଷ୍ଟ କରିଥାଏ। ଯଦି ଗଛ ପ୍ରତି ୨-୩ଟି ବୁଢ଼ିଆଣୀ ଦେଖାଯାଉଛନ୍ତି, ତେବେ କୌଣସି କୀଟନାଶକ ପକାନ୍ତୁ ନାହିଁ।',
        replyEn: 'Wolf spiders (Lycosa pseudoannulata) are vital beneficial natural predators. A single spider preys on 5 to 15 brown plant hoppers per day. Conserve them by strictly avoiding prophylactic broad-spectrum insecticide sprays.',
        pillsEn: defaultPillsEn,
        pillsOr: defaultPillsOr
      };
    }

    return null;
  };

  // Direct client Gemini call if backend is offline
  const callDirectGeminiChat = async (query: string, pest: any, apiKey: string): Promise<{ replyEn: string; replyOr: string } | null> => {
    try {
      const pestDesc = pest 
        ? `Active Pest: ${pest.commonNameEn} (${pest.commonNameOr}), Symptoms: ${pest.keySymptomsEn?.join(', ')}, Non-chemical: ${pest.immediateNextStepsEn?.join(', ')}`
        : '';
      const prompt = `You are Krushi Mitra AI, an agricultural expert for farmers in Odisha, India.
District: Bargarh
${pestDesc}
Farmer Query: ${query}

Respond ONLY in valid JSON matching:
{
  "reply_or": "Natural Odia advice in Odia script",
  "reply_en": "Clear English summary of advice"
}`;

      const activeModel = StorageService.getSettings().selectedModel || 'gemini-3.5-flash-lite';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15, response_mime_type: 'application/json' }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.reply_or && parsed.reply_en) {
            return { replyEn: parsed.reply_en, replyOr: parsed.reply_or };
          }
        }
      }
    } catch (err) {
      console.warn('Direct client Gemini assistant call failed:', err);
    }
    return null;
  };

  const handleSendQuery = async (textToSend?: string, wasSpoken: boolean = false) => {
    const query = (textToSend || inputText).trim();
    if (!query || isGeneratingAnswer) return;

    // Detect input language: Odia script -> 'or', Latin letters -> 'en'
    const isOdiaInput = /[\u0B00-\u0B7F]/.test(query);
    const inputLang: 'or' | 'en' = isOdiaInput ? 'or' : (/[a-zA-Z]/.test(query) ? 'en' : lang);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      textEn: query,
      textOr: query,
      timestamp: Date.now(),
      detectedLanguage: inputLang
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsGeneratingAnswer(true);

    // 1. Intent Handling for Greetings and Small Talk
    const greetingMatch = checkGreetingOrSmallTalk(query, activePest);
    if (greetingMatch) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          textEn: greetingMatch.replyEn,
          textOr: greetingMatch.replyOr,
          timestamp: Date.now(),
          detectedLanguage: inputLang,
          suggestedActionPills: greetingMatch.pillsEn,
          suggestedActionPillsOr: greetingMatch.pillsOr
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsGeneratingAnswer(false);

        if (wasSpoken) {
          handleSpeechOutput(assistantMsg.id, assistantMsg.textOr, 'or');
        }
      }, 250);
      return;
    }

    // 2. Canned answers ONLY for the three suggestion chips
    const chipMatch = checkSuggestionChips(query, activePest);
    if (chipMatch) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          textEn: chipMatch.replyEn,
          textOr: chipMatch.replyOr,
          timestamp: Date.now(),
          detectedLanguage: inputLang,
          suggestedActionPills: chipMatch.pillsEn,
          suggestedActionPillsOr: chipMatch.pillsOr
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsGeneratingAnswer(false);

        if (wasSpoken) {
          handleSpeechOutput(assistantMsg.id, assistantMsg.textOr, 'or');
        }
      }, 300);
      return;
    }

    // 3. Free-Form Questions: Send to Gemini model with active pest context
    const settings = StorageService.getSettings();
    const backendUrl = settings.backendUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
      ? import.meta.env.VITE_API_URL 
      : 'http://localhost:8000/api/v1');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(`${backendUrl}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          pest_context: activeReport?.identification?.pestId || undefined,
          farmer_district: 'bargarh',
          language: inputLang
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const assistantMsg: ChatMessage = {
          id: data.id || `msg-${Date.now()}`,
          sender: 'assistant',
          textEn: data.reply_en || query,
          textOr: data.reply_or || query,
          timestamp: Date.now(),
          detectedLanguage: inputLang,
          suggestedActionPills: data.suggested_action_pills_en || [
            'Why did this pest attack my paddy?',
            'How can I control it without chemicals?',
            'What is the correct chemical dosage?'
          ],
          suggestedActionPillsOr: data.suggested_action_pills_or || [
            'ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?',
            'ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?',
            'ଏହି ପୋକ କିପରି ଦୂର କରିବି?'
          ]
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsGeneratingAnswer(false);

        if (wasSpoken) {
          handleSpeechOutput(assistantMsg.id, assistantMsg.textOr, 'or');
        }
        return;
      }
    } catch (apiErr) {
      console.warn('Backend Assistant unavailable, checking direct Gemini client:', apiErr);
    }

    // Try Direct Client-side Gemini if backend is unavailable and user has configured API key
    const directApiKey = StorageService.getApiKey();
    if (directApiKey) {
      const directResult = await callDirectGeminiChat(query, activePest, directApiKey);
      if (directResult) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          textEn: directResult.replyEn,
          textOr: directResult.replyOr,
          timestamp: Date.now(),
          detectedLanguage: inputLang,
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
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsGeneratingAnswer(false);

        if (wasSpoken) {
          handleSpeechOutput(assistantMsg.id, assistantMsg.textOr, 'or');
        }
        return;
      }
    }

    // Graceful notification when AI model is temporarily unreachable - do NOT dump static pest treatment steps!
    setTimeout(() => {
      let replyEn = `I received your question "${query}", but the AI model is temporarily unreachable. Please ensure the backend server is running or configure a Gemini API key in settings.`;
      let replyOr = `ଆପଣଙ୍କ ପ୍ରଶ୍ନ "${query}" ର ଉତ୍ତର ପାଇଁ AI ସହିତ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ସର୍ଭର ଚାଲୁ ଥିବା ନିଶ୍ଚିତ କରନ୍ତୁ କିମ୍ବା Gemini API Key ସେଟିଙ୍ଗରେ ଦିଅନ୍ତୁ।`;

      if (activePest) {
        replyEn = `Regarding your question "${query}" on ${activePest.commonNameEn}: The AI model is temporarily unreachable. Please ensure the backend server is running or check your network connection.`;
        replyOr = `ଆପଣଙ୍କ ${activePest.commonNameOr} ସମ୍ପର୍କିତ ପ୍ରଶ୍ନ "${query}" ପାଇଁ AI ସହିତ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ସର୍ଭର ଚାଲୁ କରନ୍ତୁ କିମ୍ବା ଇଣ୍ଟରନେଟ୍ ଯାଞ୍ଚ କରନ୍ତୁ।`;
      }

      const response: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn: replyEn,
        textOr: replyOr,
        timestamp: Date.now(),
        detectedLanguage: inputLang,
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
      };

      setMessages(prev => [...prev, response]);
      setIsGeneratingAnswer(false);

      if (wasSpoken) {
        handleSpeechOutput(response.id, response.textOr, 'or');
      }
    }, 400);
  };

  const generateLocalAssistantResponse = (query: string, pest: any, language: 'or' | 'en'): ChatMessage => {
    // 1. Check greetings
    const greetingMatch = checkGreetingOrSmallTalk(query, pest);
    if (greetingMatch) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn: greetingMatch.replyEn,
        textOr: greetingMatch.replyOr,
        timestamp: Date.now(),
        suggestedActionPills: greetingMatch.pillsEn,
        suggestedActionPillsOr: greetingMatch.pillsOr
      };
    }

    // 2. Check suggestion chips
    const chipMatch = checkSuggestionChips(query, pest);
    if (chipMatch) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        textEn: chipMatch.replyEn,
        textOr: chipMatch.replyOr,
        timestamp: Date.now(),
        suggestedActionPills: chipMatch.pillsEn,
        suggestedActionPillsOr: chipMatch.pillsOr
      };
    }

    // 3. Fallback answer formatting with clean join (no double period, lowercase mid-sentence "flood", proper "followed by")
    let replyEn = '';
    let replyOr = '';

    if (pest) {
      const stepsEnFormatted = formatTreatmentStepsEn(pest.immediateNextStepsEn);
      const stepsOrFormatted = formatTreatmentStepsOr(pest.immediateNextStepsOr);
      replyOr = `ଆପଣ ${pest.commonNameOr} ସମ୍ପର୍କରେ ପଚାରିଛନ୍ତି। ଏହାକୁ ଦମନ କରିବା ପାଇଁ ତୁରନ୍ତ ଏହି ପଦକ୍ଷେପ ନିଅନ୍ତୁ: ${stepsOrFormatted}ଅଧିକ ଜାଣିବାକୁ ଚାହୁଁଥିଲେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।`;
      replyEn = `Regarding ${pest.commonNameEn}: The first recommended course of action is: ${stepsEnFormatted} Feel free to ask more specific questions.`;
    } else {
      replyOr = 'ନମସ୍କାର! ଧାନ କ୍ଷେତରେ ପୋକ କିମ୍ବା ରୋଗ ଚିହ୍ନଟ ପାଇଁ ଫଟୋ ସ୍କାନ୍ କରନ୍ତୁ କିମ୍ବା ପୋକ ବିଷୟରେ କିଛି ବି ପଚାରନ୍ତୁ। ମୁଁ ଆପଣଙ୍କୁ ଓଡ଼ିଆରେ ସଠିକ ପରାମର୍ଶ ଦେବି।';
      replyEn = 'Namaste! Scan a crop photograph to identify pests or diseases, or ask any question to receive practical agricultural advice.';
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      textEn: replyEn,
      textOr: replyOr,
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
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn pb-16 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 rounded-2xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between border border-agri-700">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-lime-400 text-agri-950 flex items-center justify-center font-bold shadow flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                {lang === 'or' ? 'ଓଡ଼ିଆ କୃଷି AI ଭଏସ୍ ସହାୟକ' : 'Odia Agricultural AI Assistant'}
              </h2>
              <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse flex-shrink-0"></span>
            </div>
            <p className="text-xs text-agri-200 truncate">
              {lang === 'or' 
                ? 'Gemini 3.5 AI ଓ Sarvam Bulbul v3 ଦ୍ୱାରା ପରିଚାଳିତ' 
                : 'Powered by Multimodal Gemini & Sarvam AI Bulbul v3 Odia TTS'}
            </p>
          </div>
        </div>

        {activePest && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-lime-300 flex-shrink-0">
            <Sprout className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{lang === 'or' ? activePest.commonNameOr : activePest.commonNameEn}</span>
          </div>
        )}
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[560px] sm:h-[600px] w-full">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeakingThis = speakingMsgId === msg.id;

            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 shadow-sm ${
                    isUser ? 'bg-agri-700 text-white' : 'bg-lime-400 text-agri-950'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-agri-800 text-white rounded-tr-none' 
                      : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'
                  }`}>
                    {(() => {
                      const displayLang = msg.detectedLanguage || lang;
                      const isOdiaDisplay = displayLang === 'or';
                      const textToShow = isOdiaDisplay ? (msg.textOr || msg.textEn) : (msg.textEn || msg.textOr);
                      return (
                        <p className={isOdiaDisplay ? 'font-odia text-[15px]' : ''}>
                          {textToShow}
                        </p>
                      );
                    })()}

                    {/* Voice Controls & Feedback */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                        {/* Audio Status Pill */}
                        <div className="flex items-center space-x-1.5 text-xs">
                          {isSpeakingThis && playbackState === 'loading' && (
                            <span className="inline-flex items-center text-amber-600 font-semibold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              {lang === 'or' ? 'ଓଡ଼ିଆ ଭଏସ୍ ପ୍ରସ୍ତୁତ ହେଉଛି...' : 'Preparing Odia voice...'}
                            </span>
                          )}
                          {isSpeakingThis && playbackState === 'playing' && (
                            <span className="inline-flex items-center text-agri-700 font-bold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-lime-500 mr-1.5"></span>
                              {lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣାଯାଉଛି...' : 'Playing voice...'}
                            </span>
                          )}
                          {isSpeakingThis && playbackState === 'paused' && (
                            <span className="inline-flex items-center text-slate-500 font-semibold">
                              <Pause className="w-3.5 h-3.5 mr-1" />
                              {lang === 'or' ? 'ଅଟକାଯାଇଛି' : 'Paused'}
                            </span>
                          )}
                          {isSpeakingThis && playbackState === 'error' && (
                            <span className="inline-flex items-center text-rose-600 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              {playbackError || (lang === 'or' ? 'ଭଏସ୍ ଅନୁପଲବ୍ଧ' : 'Voice unavailable')}
                            </span>
                          )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleSpeechOutput(msg.id, msg.textOr || msg.textEn, 'or')}
                            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                            title={isSpeakingThis && playbackState === 'playing' ? (lang === 'or' ? 'ଅଟକାନ୍ତୁ' : 'Pause') : (lang === 'or' ? 'ଶୁଣନ୍ତୁ' : 'Listen in Odia')}
                          >
                            {isSpeakingThis && playbackState === 'playing' ? (
                              <>
                                <Pause className="w-3.5 h-3.5 text-amber-600" />
                                <span>{lang === 'or' ? 'ଅଟକାନ୍ତୁ' : 'Pause'}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-agri-700" />
                                <span>{lang === 'or' ? 'ଶୁଣନ୍ତୁ' : 'Listen'}</span>
                              </>
                            )}
                          </button>

                          {isSpeakingThis && (
                            <>
                              <button
                                onClick={() => handleReplay(msg.id, msg.textOr || msg.textEn, 'or')}
                                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
                                title="Replay"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleStopSpeaking}
                                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 text-rose-600 flex items-center justify-center transition-colors shadow-sm"
                                title="Stop"
                              >
                                <Square className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggested Action Pills */}
                {!isUser && (
                  <div className="mt-2 ml-10 flex flex-wrap gap-1.5">
                    {(lang === 'or' ? msg.suggestedActionPillsOr : msg.suggestedActionPills)?.map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendQuery(pill)}
                        className="min-h-[44px] text-xs px-3 py-2 rounded-full bg-agri-50 border border-agri-200 text-agri-800 hover:bg-agri-100 transition-colors flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3 h-3 text-agri-600 flex-shrink-0" />
                        <span>{pill}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Answer Generation Loading Indicator */}
          {isGeneratingAnswer && (
            <div className="flex items-start space-x-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-lime-400 text-agri-950 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none p-4 bg-slate-50 border border-slate-200 text-slate-700 text-sm flex items-center space-x-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-agri-700 flex-shrink-0" />
                <span className="font-semibold text-agri-900">
                  {lang === 'or' ? 'କୃଷି ମିତ୍ର AI ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛି...' : 'Krushi Mitra AI is generating guidance...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 w-full">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
            className="flex items-center space-x-2 w-full"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`min-h-[48px] min-w-[48px] p-3 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse shadow-rose-200' 
                  : 'bg-agri-800 hover:bg-agri-700 text-lime-300'
              }`}
              title={isListening ? 'Stop listening' : 'Speak query in Odia or English'}
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
                  ? (lang === 'or' ? 'ଶୁଣୁଛି... କୁହନ୍ତୁ' : 'Listening... speak now') 
                  : (lang === 'or' ? 'ଓଡ଼ିଆରେ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ କିମ୍ବା ମାଇକ୍ ବଟନ୍ ଦବାନ୍ତୁ...' : 'Type in Odia/English or tap mic to speak...')
              }
              className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-agri-600 focus:border-transparent text-sm bg-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isGeneratingAnswer}
              className="min-h-[48px] min-w-[48px] p-3 rounded-2xl bg-lime-500 hover:bg-lime-400 disabled:opacity-50 disabled:cursor-not-allowed text-agri-950 font-bold flex items-center justify-center shadow-sm transition-colors"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Subtext info */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>
              {lang === 'or' 
                ? 'Sarvam Bulbul v3 Odia TTS • ଉତ୍ତର ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' 
                : 'Sarvam Bulbul v3 Odia TTS • Audio synthesized in od-IN'}
            </span>
            <span className="hidden sm:inline">
              {lang === 'or' ? 'ନିରାପଦ ଓ ପ୍ରାମାଣିକ କୃଷି ପରାମର୍ଶ' : 'Authentic Field Intelligence'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
