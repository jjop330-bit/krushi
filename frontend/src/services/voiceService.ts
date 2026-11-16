// Web Speech API Voice Engine with Odia & Indian English Speech Synthesis & Recognition

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
    }
  }

  public isVoiceSupported(): boolean {
    return !!this.synth;
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public speak(text: string, lang: 'or' | 'en' = 'or', onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Stop any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to locate an Indian English or Odia / Hindi compatible voice
    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (lang === 'or') {
      // Browsers often route Indic languages via hi-IN or en-IN voices
      selectedVoice = voices.find(v => v.lang.includes('or') || v.lang.includes('ory')) ||
                      voices.find(v => v.lang === 'hi-IN') ||
                      voices.find(v => v.lang === 'en-IN') ||
                      voices[0];
      utterance.lang = selectedVoice ? selectedVoice.lang : 'hi-IN';
      utterance.rate = 0.88; // Slightly measured rate for clear village comprehension
      utterance.pitch = 1.0;
    } else {
      selectedVoice = voices.find(v => v.lang === 'en-IN') ||
                      voices.find(v => v.lang.startsWith('en')) ||
                      voices[0];
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    lang: 'or' | 'en' = 'or'
  ): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    }

    this.recognition.lang = lang === 'or' ? 'or-IN' : 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Voice input error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Could not start microphone');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceService();
