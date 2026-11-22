import { StorageService, normalizeBackendUrl } from './storageService';

// Audio playback state machine
export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TTSPlaybackOptions {
  speaker?: 'shubh' | 'priya' | 'pooja' | 'neha' | 'aditya' | 'ritu' | 'kavya';
  pace?: number;
  onStateChange?: (state: AudioPlaybackState) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface SpeechRecognitionOptions {
  lang?: 'or' | 'en';
  continuous?: boolean;
  interimResults?: boolean;
  silenceTimeoutMs?: number;
  maxDurationMs?: number;
  onStart?: () => void;
  onTranscriptChange?: (interim: string, final: string, complete: string) => void;
  onFinalResult?: (completeTranscript: string) => void;
  onError?: (errorMessage: string, errorCode?: string) => void;
  onEnd?: () => void;
}

/**
 * Sanitizes and normalizes text before sending to Sarvam AI Bulbul v3 TTS.
 * Strips markdown, emojis, code fences, and clamps cleanly at sentence boundaries under 2500 chars.
 */
export const cleanTextForTTS = (rawText: string, maxChars: number = 2500): string => {
  if (!rawText) return '';
  const cleaned = rawText
    // Remove markdown links: [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove markdown bold / italic
    .replace(/(\*\*|\*|__|_)(.*?)\1/g, '$2')
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove heading markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points / blockquotes
    .replace(/^(\s*[-*+]\s+|\s*>\s+)/gm, '')
    // Remove emojis or special symbols while keeping Indic characters, standard Latin, numbers, punctuation
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Collapse multiple spaces/newlines
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  const truncated = cleaned.slice(0, maxChars);
  // Find last Odia Purna Virama (।), period, question mark, or exclamation
  const lastBoundary = Math.max(
    truncated.lastIndexOf('।'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('!')
  );

  if (lastBoundary > maxChars * 0.7) {
    return truncated.slice(0, lastBoundary + 1).trim();
  }
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.8) {
    return truncated.slice(0, lastSpace).trim() + '...';
  }
  return truncated.trim();
};

/**
 * Converts a base64 audio payload to a Blob URL for efficient audio playback and cleanup.
 */
const base64ToBlobUrl = (base64: string, mimeType: string = 'audio/wav'): { url: string; revoke: () => void } => {
  if (
    typeof window !== 'undefined' &&
    typeof window.atob === 'function' &&
    typeof Blob !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    try {
      const binaryStr = window.atob(base64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);
      return {
        url: objectUrl,
        revoke: () => {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore revoke errors
          }
        }
      };
    } catch {
      // Fallback to data URI on conversion failure
    }
  }
  return {
    url: `data:${mimeType};base64,${base64}`,
    revoke: () => {}
  };
};

export class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioRevoke: (() => void) | null = null;
  private currentAbortController: AbortController | null = null;
  private currentState: AudioPlaybackState = 'idle';
  private currentOptions: TTSPlaybackOptions = {};
  private currentText: string = '';
  private currentLang: 'or' | 'en' = 'or';

  // Speech-to-text continuous accumulation state
  private silenceTimer: any = null;
  private maxDurationTimer: any = null;
  private accumulatedFinalText: string = '';
  private currentInterimText: string = '';
  private intentionallyStopped: boolean = false;
  private restartCount: number = 0;
  private activeRecognitionOptions: SpeechRecognitionOptions | null = null;

  // In-memory audio payload cache to save network calls & prevent redundant billing
  private audioMemoryCache: Map<string, { audioBase64: string; mimeType: string }> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isVoiceSupported(): boolean {
    return true; // Supported via backend Sarvam AI Bulbul v3
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public getPlaybackState(): AudioPlaybackState {
    return this.currentState;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  private setState(state: AudioPlaybackState): void {
    this.currentState = state;
    if (this.currentOptions.onStateChange) {
      this.currentOptions.onStateChange(state);
    }
  }

  /**
   * Main speech synthesis entrypoint.
   * If lang === 'or', routes to Sarvam AI Bulbul v3 Odia TTS via backend.
   * If lang === 'en', uses browser Indian English voice or backend TTS.
   */
  public async speak(
    text: string, 
    lang: 'or' | 'en' = 'or', 
    optionsOrOnEnd?: TTSPlaybackOptions | (() => void)
  ): Promise<void> {
    const options: TTSPlaybackOptions = typeof optionsOrOnEnd === 'function' 
      ? { onEnd: optionsOrOnEnd } 
      : (optionsOrOnEnd || {});

    this.currentText = text;
    this.currentLang = lang;
    this.currentOptions = options;

    // Stop and clean up any ongoing speech
    this.stopSpeaking();

    if (!text || text.trim().length === 0) {
      this.setState('idle');
      if (options.onEnd) options.onEnd();
      return;
    }

    if (lang === 'or') {
      await this.playOdiaSpeech(text, options);
    } else {
      this.playEnglishSpeech(text, options);
    }
  }

  /**
   * Plays genuine Odia speech generated by Sarvam AI Bulbul v3.
   */
  private async playOdiaSpeech(text: string, options: TTSPlaybackOptions): Promise<void> {
    this.setState('loading');

    const cleanText = cleanTextForTTS(text, 2500);
    const speaker = options.speaker || 'shubh';
    const pace = options.pace || 1.0;
    const cacheKey = `${speaker}_${pace}_${cleanText}`;

    // 1. Check in-memory audio cache to prevent rapid repeated network requests
    const cached = this.audioMemoryCache.get(cacheKey);
    if (cached) {
      try {
        this.cleanupAudio();
        const { url: audioUrl, revoke } = base64ToBlobUrl(cached.audioBase64, cached.mimeType);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        this.currentAudioRevoke = revoke;

        audio.onplay = () => this.setState('playing');
        audio.onpause = () => {
          if (this.currentState === 'playing') this.setState('paused');
        };
        audio.onended = () => {
          this.setState('idle');
          this.cleanupAudio();
          if (options.onEnd) options.onEnd();
        };
        audio.onerror = () => {
          this.setState('error');
          this.cleanupAudio();
          if (options.onError) options.onError('ଅଡିଓ ଚଲାଇବାରେ ସମସ୍ୟା ହେଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।');
        };

        await audio.play();
        this.setState('playing');
        return;
      } catch (playErr) {
        console.warn('Playback of cached audio failed:', playErr);
      }
    }

    const settings = StorageService.getSettings();
    const backendUrl = normalizeBackendUrl(settings.backendUrl);

    // Cancel any prior in-flight request and ensure previous audio is stopped
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.cleanupAudio();

    const controller = new AbortController();
    this.currentAbortController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second safeguard timeout

    try {
      const response = await fetch(`${backendUrl}/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          language_code: 'od-IN',
          speaker,
          pace
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Voice server error: HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.audio_base64) {
        throw new Error('Received empty audio payload from voice service');
      }

      // Store in memory cache
      const mimeType = data.mime_type || 'audio/wav';
      this.audioMemoryCache.set(cacheKey, { audioBase64: data.audio_base64, mimeType });

      // Stop and clean up any audio before playing new payload to prevent duplicate playback
      this.cleanupAudio();

      // Construct playable audio element from Blob URL
      const { url: audioUrl, revoke } = base64ToBlobUrl(data.audio_base64, mimeType);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      this.currentAudioRevoke = revoke;

      audio.onplay = () => {
        this.setState('playing');
      };

      audio.onpause = () => {
        if (this.currentState === 'playing') {
          this.setState('paused');
        }
      };

      audio.onended = () => {
        this.setState('idle');
        this.cleanupAudio();
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        this.setState('error');
        this.cleanupAudio();
        const errNotice = 'ଅଡିଓ ଚଲାଇବାରେ ସମସ୍ୟା ହେଲା। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।';
        if (options.onError) options.onError(errNotice);
      };

      await audio.play();
      this.setState('playing');

    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        // Request was cancelled by user
        this.setState('idle');
        return;
      }

      console.warn('Odia TTS backend synthesis failed, checking genuine native Odia voice fallback:', err);

      // Check if browser has a GENUINE native Odia voice
      // Never switch silently to Hindi or English when Odia was requested!
      const nativeOdiaVoice = this.synth 
        ? this.synth.getVoices().find(v => {
            const langLower = (v.lang || '').toLowerCase();
            return langLower.startsWith('or') || langLower.startsWith('ory');
          }) 
        : null;

      if (nativeOdiaVoice && this.synth) {
        this.speakNative(cleanText, nativeOdiaVoice, options);
      } else {
        // Fail gracefully with an honest error state — NEVER report success or call onEnd() after failure
        this.setState('error');
        this.cleanupAudio();
        const fallbackNotice = 'ଓଡ଼ିଆ ଅଡିଓ ସାମୟିକ ଭାବେ ଅନୁପଲବ୍ଧ ଅଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।';
        if (options.onError) {
          options.onError(fallbackNotice);
        }
      }
    }
  }

  /**
   * Browser-native English speech synthesis with en-IN voice persona.
   */
  private playEnglishSpeech(text: string, options: TTSPlaybackOptions): void {
    if (!this.synth) {
      if (options.onEnd) options.onEnd();
      return;
    }

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;

    this.setState('playing');

    utterance.onend = () => {
      this.setState('idle');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.setState('error');
      if (options.onError) options.onError('Speech playback failed');
    };

    this.synth.speak(utterance);
  }

  private speakNative(text: string, voice: SpeechSynthesisVoice, options: TTSPlaybackOptions): void {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.90;

    this.setState('playing');

    utterance.onend = () => {
      this.setState('idle');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.setState('error');
      if (options.onError) options.onError('Odia audio playback error');
    };

    this.synth.speak(utterance);
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.setState('paused');
    } else if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.setState('paused');
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(console.error);
      this.setState('playing');
    } else if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.setState('playing');
    }
  }

  public replay(): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = 0;
      this.currentAudio.play().catch(console.error);
      this.setState('playing');
    } else if (this.currentText) {
      this.speak(this.currentText, this.currentLang, this.currentOptions);
    }
  }

  public stopSpeaking(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.cleanupAudio();
    }

    if (this.synth) {
      this.synth.cancel();
    }

    this.setState('idle');
  }

  private cleanupAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.onplay = null;
      this.currentAudio.onpause = null;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }
    if (this.currentAudioRevoke) {
      this.currentAudioRevoke();
      this.currentAudioRevoke = null;
    }
  }

  /**
   * Continuous Speech-to-Text Recognition for Odia and English.
   * Employs continuous listening, interim-to-final streaming accumulation,
   * natural silence detection timeout, and duplicate prevention.
   */
  public startListening(
    optionsOrOnResult: SpeechRecognitionOptions | ((transcript: string) => void),
    onErrorCallback?: (error: string) => void,
    langParam: 'or' | 'en' = 'or'
  ): void {
    const options: SpeechRecognitionOptions = typeof optionsOrOnResult === 'function'
      ? {
          onFinalResult: optionsOrOnResult,
          onError: onErrorCallback,
          lang: langParam,
          continuous: true,
          interimResults: true,
          silenceTimeoutMs: 2500
        }
      : {
          continuous: true,
          interimResults: true,
          silenceTimeoutMs: 2500,
          maxDurationMs: 45000,
          ...optionsOrOnResult
        };

    const targetLang = options.lang === 'en' ? 'en' : 'or';

    if (!this.isSpeechRecognitionSupported()) {
      const msg = targetLang === 'or'
        ? 'ଆପଣଙ୍କ ବ୍ରାଉଜରରେ ସ୍ୱର ଚିହ୍ନଟ (Speech Recognition) ସୁବିଧା ନାହିଁ। ଦୟାକରି ଟାଇପ୍ କରନ୍ତୁ।'
        : 'Speech recognition is not supported in this browser. Please type your query.';
      if (options.onError) {
        options.onError(msg, 'not-supported');
      }
      return;
    }

    // Clean up any existing listening session
    this.stopListening();

    this.accumulatedFinalText = '';
    this.currentInterimText = '';
    this.intentionallyStopped = false;
    this.restartCount = 0;
    this.activeRecognitionOptions = options;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recognition: any;
    try {
      recognition = new SpeechRecognition();
    } catch (e: any) {
      if (options.onError) {
        options.onError(e.message || 'Could not initialize speech recognition', 'init-error');
      }
      return;
    }

    this.recognition = recognition;
    recognition.continuous = options.continuous !== false;
    recognition.interimResults = options.interimResults !== false;
    recognition.maxAlternatives = 1;
    // Odia BCP-47 language tag
    recognition.lang = targetLang === 'or' ? 'or-IN' : 'en-IN';

    const resetSilenceTimer = () => {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
      }
      const silenceMs = options.silenceTimeoutMs || 2500;
      this.silenceTimer = setTimeout(() => {
        // Natural silence detected after speaking — finalize and stop listening
        this.stopListening();
      }, silenceMs);
    };

    const maxMs = options.maxDurationMs || 45000;
    this.maxDurationTimer = setTimeout(() => {
      this.stopListening();
    }, maxMs);

    recognition.onstart = () => {
      this.isListening = true;
      if (options.onStart) {
        options.onStart();
      }
      resetSilenceTimer();
    };

    recognition.onresult = (event: any) => {
      resetSilenceTimer();
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const piece = item && item[0] ? item[0].transcript : '';
        if (item.isFinal) {
          const trimmed = piece.trim();
          if (trimmed) {
            // Deduplicate: do not append identical final segment if already present
            if (!this.accumulatedFinalText.toLowerCase().endsWith(trimmed.toLowerCase())) {
              this.accumulatedFinalText = this.accumulatedFinalText
                ? `${this.accumulatedFinalText.trim()} ${trimmed}`
                : trimmed;
            }
          }
        } else {
          interim += piece;
        }
      }

      this.currentInterimText = interim;
      const combined = (this.accumulatedFinalText + (interim ? (this.accumulatedFinalText ? ' ' : '') + interim : '')).trim();

      if (options.onTranscriptChange) {
        options.onTranscriptChange(interim, this.accumulatedFinalText, combined);
      }
    };

    recognition.onerror = (event: any) => {
      const errCode = event.error || 'unknown';

      if (errCode === 'aborted') {
        return;
      }

      if (errCode === 'no-speech') {
        // If we already accumulated speech, user just paused; don't report as error
        if (this.accumulatedFinalText.trim()) {
          this.stopListening();
          return;
        }
        const msg = targetLang === 'or'
          ? 'କୌଣସି ସ୍ୱର ଶୁଣାଗଲା ନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ।'
          : 'No speech was detected. Please try speaking again.';
        if (options.onError) options.onError(msg, errCode);
        this.stopListening();
        return;
      }

      if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
        const msg = targetLang === 'or'
          ? 'ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ବ୍ରାଉଜର ସେଟିଂସରେ ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ଦିଅନ୍ତୁ।'
          : 'Microphone permission denied. Please allow microphone access in your browser settings.';
        if (options.onError) options.onError(msg, errCode);
        this.stopListening();
        return;
      }

      if (errCode === 'network') {
        const msg = targetLang === 'or'
          ? 'ନେଟୱାର୍କ ସମସ୍ୟା ଯୋଗୁଁ ସ୍ୱର ଚିହ୍ନଟ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ଇଣ୍ଟରନେଟ୍ ଯାଞ୍ଚ କରନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।'
          : 'Network error during speech recognition. Please check your internet connection or type your question.';
        if (options.onError) options.onError(msg, errCode);
        this.stopListening();
        return;
      }

      const msg = targetLang === 'or'
        ? `ସ୍ୱର ଚିହ୍ନଟରେ ସମସ୍ୟା ହେଲା (${errCode})। ଦୟାକରି ଟାଇପ୍ କରନ୍ତୁ।`
        : `Speech recognition error (${errCode}). Please type your question.`;
      if (options.onError) options.onError(msg, errCode);
      this.stopListening();
    };

    recognition.onend = () => {
      // Reconnection safeguard against premature browser termination
      if (!this.intentionallyStopped && this.isListening && this.restartCount < 3) {
        this.restartCount++;
        try {
          recognition.start();
          return;
        } catch {
          // If restart fails, proceed to finalize
        }
      }

      this.isListening = false;
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      if (this.maxDurationTimer) {
        clearTimeout(this.maxDurationTimer);
        this.maxDurationTimer = null;
      }

      const complete = (this.accumulatedFinalText + (this.currentInterimText ? (this.accumulatedFinalText ? ' ' : '') + this.currentInterimText : '')).trim();
      if (options.onFinalResult && complete) {
        options.onFinalResult(complete);
      }
      if (options.onEnd) {
        options.onEnd();
      }
    };

    try {
      recognition.start();
    } catch (e: any) {
      this.isListening = false;
      if (options.onError) {
        options.onError(e.message || 'Could not start microphone', 'start-failed');
      }
    }
  }

  public stopListening(): void {
    this.intentionallyStopped = true;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore errors on stopping already stopped recognition
      }
    }
    this.isListening = false;
  }
}

export const voiceService = new VoiceService();
