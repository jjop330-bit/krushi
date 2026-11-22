import test from 'node:test';
import assert from 'node:assert/strict';

// Import services and utilities
import { 
  voiceService, 
  cleanTextForTTS 
} from './src/services/voiceService.ts';
import { 
  StorageService, 
  normalizeBackendUrl, 
  isPlaceholderBackendUrl, 
  PRODUCTION_BACKEND_URL 
} from './src/services/storageService.ts';

// -----------------------------------------------------------------------------
// SUITE 1: BACKEND URL RESOLUTION & PLACEHOLDER SANITIZATION
// -----------------------------------------------------------------------------

test('Backend URL Normalization: Rejects all placeholder domains and heals to production', () => {
  const placeholders = [
    'your-railway-domain',
    'your-railway-domain/api/v1',
    'https://your-railway-domain/api/v1',
    'http://your-railway-domain',
    'https://<your-railway-backend-url>/api/v1',
    'https://your-railway-backend-domain.up.railway.app/api/v1',
    'https://your-krushi-mitra-api.onrender.com/api/v1',
    'http://your-api.com/api/v1',
    'https://example.com/api/v1',
    'placeholder',
    'undefined',
    'null',
    '',
    '   '
  ];

  for (const placeholder of placeholders) {
    const isDetected = isPlaceholderBackendUrl(placeholder);
    assert.equal(isDetected, true, `Must detect placeholder: "${placeholder}"`);
    const normalized = normalizeBackendUrl(placeholder);
    assert.equal(normalized, PRODUCTION_BACKEND_URL, `Placeholder "${placeholder}" must normalize to PRODUCTION_BACKEND_URL`);
  }
});

test('Backend URL Normalization: Normalizes valid domains, protocols, and pathing', () => {
  // 1. Missing protocol should prepend https://
  const withoutProtocol = 'krushi-mitra-ai-production.up.railway.app';
  assert.equal(
    normalizeBackendUrl(withoutProtocol), 
    'https://krushi-mitra-ai-production.up.railway.app/api/v1'
  );

  // 2. Already fully qualified production URL
  assert.equal(
    normalizeBackendUrl('https://krushi-mitra-ai-production.up.railway.app/api/v1'),
    'https://krushi-mitra-ai-production.up.railway.app/api/v1'
  );

  // 3. Trailing slash and /api base
  assert.equal(
    normalizeBackendUrl('https://krushi-mitra-ai-production.up.railway.app/api/'),
    'https://krushi-mitra-ai-production.up.railway.app/api/v1'
  );

  // 4. Missing /api/v1 suffix
  assert.equal(
    normalizeBackendUrl('https://krushi-mitra-ai-production.up.railway.app/'),
    'https://krushi-mitra-ai-production.up.railway.app/api/v1'
  );
});

test('StorageService: Self-healing poisoned localStorage with placeholder URL', () => {
  // Mock localStorage
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };

  // Pre-seed localStorage with poisoned settings
  globalThis.localStorage.setItem('krushi_mitra_settings', JSON.stringify({
    language: 'or',
    backendUrl: 'your-railway-domain/api/v1'
  }));

  const settings = StorageService.getSettings();
  assert.equal(
    settings.backendUrl, 
    PRODUCTION_BACKEND_URL, 
    'Poisoned backendUrl must be healed to production'
  );

  // Verify that localStorage was rewritten with healed URL
  const storedJson = JSON.parse(globalThis.localStorage.getItem('krushi_mitra_settings'));
  assert.equal(
    storedJson.backendUrl, 
    PRODUCTION_BACKEND_URL, 
    'localStorage must be persisted with the healed URL'
  );
});

// -----------------------------------------------------------------------------
// SUITE 2: TEXT-TO-SPEECH (TTS) ODIA SYNTHESIS & UNICODE HANDLING
// -----------------------------------------------------------------------------

test('Text Cleaning for TTS: Strips markdown, emojis, code fences while preserving Odia Unicode & Latin binomials', () => {
  const complexText = `
### **ଚାଷୀ ଭାଇଙ୍କ ପାଇଁ ପରାମର୍ଶ** 🌾
ଧାନ ଫସଲରେ \`Scirpophaga incertulas\` (ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକ) ଦେଖାଦେଇଛି।
- *ପଦକ୍ଷେପ ୧:* ନିମ୍ବ ତେଲ [ନିର୍ଦ୍ଦେଶାବଳୀ](https://icar.gov.in) ଅନୁସାରେ ୪ ମିଲି ସିଞ୍ଚନ କରନ୍ତୁ।
- *ପଦକ୍ଷେପ ୨:* କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ।
`;

  const cleaned = cleanTextForTTS(complexText);
  assert.ok(!cleaned.includes('###'), 'Must strip markdown header');
  assert.ok(!cleaned.includes('**'), 'Must strip bold markdown');
  assert.ok(!cleaned.includes('*'), 'Must strip italic markdown');
  assert.ok(!cleaned.includes('`'), 'Must strip backticks');
  assert.ok(!cleaned.includes('🌾'), 'Must strip emojis');
  assert.ok(!cleaned.includes('https://icar.gov.in'), 'Must strip markdown URL');
  assert.ok(cleaned.includes('ନିର୍ଦ୍ଦେଶାବଳୀ'), 'Must preserve link text in Odia');
  assert.ok(cleaned.includes('Scirpophaga incertulas'), 'Must preserve scientific binomials');
  assert.ok(cleaned.includes('ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକ'), 'Must preserve Odia Unicode characters');
});

test('Text Cleaning for TTS: Clamps long Odia text (>2500 chars) cleanly at Purna Virama (।)', () => {
  const sentence = 'ଧାନ ଫସଲରେ କୀଟ ନିୟନ୍ତ୍ରଣ ପାଇଁ ପ୍ରାକୃତିକ ପଦ୍ଧତି ଆପଣାନ୍ତୁ। ';
  let longText = '';
  while (longText.length < 3000) {
    longText += sentence;
  }

  const cleaned = cleanTextForTTS(longText, 2500);
  assert.ok(cleaned.length <= 2500, `Cleaned text length (${cleaned.length}) must be <= 2500`);
  assert.ok(cleaned.endsWith('।'), 'Cleaned text must end cleanly at an Odia sentence boundary (।)');
});

test('Odia TTS Synthesis: Full lifecycle with Sarvam Bulbul v3 WAV audio payload', async () => {
  const originalFetch = globalThis.fetch;
  const originalAudio = globalThis.Audio;

  let requestUrl = '';
  let requestBody = null;
  let playTriggered = false;

  // Valid 16-bit mock WAV payload
  const mockWavBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

  globalThis.fetch = async (url, options) => {
    requestUrl = url.toString();
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        audio_base64: mockWavBase64,
        mime_type: 'audio/wav',
        language_code: 'od-IN',
        speaker: 'shubh',
        provider: 'sarvam-bulbul-v3',
        character_count: requestBody.text.length
      })
    };
  };

  globalThis.Audio = class MockAudio {
    paused = false;
    onplay = null;
    onpause = null;
    onended = null;
    onerror = null;
    constructor(src) {
      this.src = src;
    }
    async play() {
      playTriggered = true;
      this.paused = false;
      if (this.onplay) this.onplay();
    }
    pause() {
      this.paused = true;
      if (this.onpause) this.onpause();
    }
  };

  try {
    const odiaText = 'ନମସ୍କାର! ଆପଣଙ୍କ ଧାନ ଫସଲ ପାଇଁ କୃଷି ମିତ୍ର AI ପ୍ରସ୍ତୁତ ଅଛି।';
    let currentState = 'idle';

    await voiceService.speak(odiaText, 'or', {
      speaker: 'shubh',
      pace: 1.0,
      onStateChange: (st) => {
        currentState = st;
      }
    });

    assert.equal(requestUrl, `${PRODUCTION_BACKEND_URL}/voice/tts`, 'Must send POST to production /voice/tts');
    assert.equal(requestBody.language_code, 'od-IN', 'Language code must strictly be od-IN');
    assert.equal(requestBody.speaker, 'shubh', 'Speaker must be shubh');
    assert.equal(requestBody.text, odiaText, 'Odia text must match input');
    assert.equal(playTriggered, true, 'Audio.play() must be invoked');
    assert.equal(voiceService.getPlaybackState(), 'playing', 'Playback state must be playing');

    // Test Pause and Resume
    voiceService.pause();
    assert.equal(voiceService.getPlaybackState(), 'paused', 'Playback state must be paused');

    voiceService.resume();
    assert.equal(voiceService.getPlaybackState(), 'playing', 'Playback state must be playing');

    // Test Stop
    voiceService.stopSpeaking();
    assert.equal(voiceService.getPlaybackState(), 'idle', 'Playback state must be idle after stopping');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
    voiceService.stopSpeaking();
  }
});

test('Odia TTS Fallback: When backend returns 503 or fails, fail closed with genuine Odia message', async () => {
  const originalFetch = globalThis.fetch;
  let errorReported = '';

  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable'
    };
  };

  try {
    await voiceService.speak('ପରୀକ୍ଷାମୂଳକ ଓଡ଼ିଆ ବାର୍ତ୍ତା', 'or', {
      onError: (msg) => {
        errorReported = msg;
      }
    });

    assert.equal(voiceService.getPlaybackState(), 'error', 'Must enter error state on backend failure');
    assert.ok(
      errorReported.includes('ଓଡ଼ିଆ ଅଡିଓ ସାମୟିକ ଭାବେ ଅନୁପଲବ୍ଧ ଅଛି'), 
      'Must display honest Odia retry message, NEVER silently convert to Hindi or English'
    );
  } finally {
    globalThis.fetch = originalFetch;
    voiceService.stopSpeaking();
  }
});

// -----------------------------------------------------------------------------
// SUITE 3: CONTINUOUS SPEECH-TO-TEXT (STT) ODIA RECOGNITION & ACCUMULATION
// -----------------------------------------------------------------------------

test('Speech-to-Text: Continuous recognition accumulates full Odia sentences without truncation', async () => {
  // Mock SpeechRecognition
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    lang = '';
    onstart = null;
    onresult = null;
    onerror = null;
    onend = null;

    start() {
      if (this.onstart) this.onstart();
    }
    stop() {
      if (this.onend) this.onend();
    }
  }

  globalThis.window = {
    SpeechRecognition: MockSpeechRecognition,
    webkitSpeechRecognition: MockSpeechRecognition
  };

  try {
    let capturedTranscript = '';
    let transcriptChanges = [];
    let startTriggered = false;

    voiceService.startListening({
      lang: 'or',
      continuous: true,
      interimResults: true,
      silenceTimeoutMs: 1500,
      onStart: () => {
        startTriggered = true;
      },
      onTranscriptChange: (interim, final, complete) => {
        transcriptChanges.push({ interim, final, complete });
      },
      onFinalResult: (complete) => {
        capturedTranscript = complete;
      }
    });

    assert.equal(startTriggered, true, 'STT engine must start listening');
    const recInstance = voiceService['recognition'];
    assert.equal(recInstance.continuous, true, 'Must enable continuous recognition mode');
    assert.equal(recInstance.interimResults, true, 'Must enable interim results');
    assert.equal(recInstance.lang, 'or-IN', 'Odia language code must strictly be or-IN');

    // Simulate Segment 1: User speaks first words: "ମୋ ଧାନ ଗଛରେ"
    recInstance.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ମୋ ଧାନ ଗଛରେ' }], { isFinal: true })
      ]
    });

    // Simulate Segment 2: User pauses briefly, then speaks next words: "କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଛି"
    recInstance.onresult({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'ମୋ ଧାନ ଗଛରେ' }], { isFinal: true }),
        Object.assign([{ transcript: 'କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଛି' }], { isFinal: true })
      ]
    });

    // Simulate Segment 3: User finishes question: "ମୁଁ କଣ କରିବି?"
    recInstance.onresult({
      resultIndex: 2,
      results: [
        Object.assign([{ transcript: 'ମୋ ଧାନ ଗଛରେ' }], { isFinal: true }),
        Object.assign([{ transcript: 'କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଛି' }], { isFinal: true }),
        Object.assign([{ transcript: 'ମୁଁ କଣ କରିବି?' }], { isFinal: true })
      ]
    });

    // User finishes speaking and manual stop is triggered
    voiceService.stopListening();

    // Verify complete multi-segment sentence is retained in full
    assert.equal(
      capturedTranscript, 
      'ମୋ ଧାନ ଗଛରେ କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଛି ମୁଁ କଣ କରିବି?',
      'Complete spoken sentence must be preserved without truncation or word loss'
    );
    assert.ok(capturedTranscript.includes('ମୋ ଧାନ ଗଛରେ'), 'First phrase must be preserved');
    assert.ok(capturedTranscript.includes('କାଣ୍ଡବିନ୍ଧା ପୋକ ଲାଗିଛି'), 'Middle phrase must be preserved');
    assert.ok(capturedTranscript.includes('ମୁଁ କଣ କରିବି?'), 'Final phrase must be preserved');
    assert.equal(voiceService.isCurrentlyListening(), false, 'Must transition to idle when stopped');
  } finally {
    voiceService.stopListening();
    delete globalThis.window;
  }
});

test('Speech-to-Text: Mixed Odia and English speech accumulation', async () => {
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    lang = '';
    onstart = null;
    onresult = null;
    onerror = null;
    onend = null;
    start() { if (this.onstart) this.onstart(); }
    stop() { if (this.onend) this.onend(); }
  }

  globalThis.window = {
    SpeechRecognition: MockSpeechRecognition
  };

  try {
    let finalOutput = '';

    voiceService.startListening({
      lang: 'or',
      onFinalResult: (res) => {
        finalOutput = res;
      }
    });

    const recInstance = voiceService['recognition'];

    // Mixed language speech: "ମୋ paddy crop ରେ stem borer attack ହୋଇଛି"
    recInstance.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ମୋ paddy crop ରେ' }], { isFinal: true })
      ]
    });

    recInstance.onresult({
      resultIndex: 1,
      results: [
        Object.assign([{ transcript: 'ମୋ paddy crop ରେ' }], { isFinal: true }),
        Object.assign([{ transcript: 'stem borer attack ହୋଇଛି' }], { isFinal: true })
      ]
    });

    voiceService.stopListening();

    assert.equal(finalOutput, 'ମୋ paddy crop ରେ stem borer attack ହୋଇଛି');
    assert.ok(finalOutput.includes('paddy crop'), 'English loan words must be preserved');
    assert.ok(finalOutput.includes('stem borer'), 'Agricultural technical terms must be preserved');
  } finally {
    voiceService.stopListening();
    delete globalThis.window;
  }
});

test('Speech-to-Text: Deduplication prevents repeating words on recognition restart', async () => {
  class MockSpeechRecognition {
    onstart = null;
    onresult = null;
    onend = null;
    start() { if (this.onstart) this.onstart(); }
    stop() { if (this.onend) this.onend(); }
  }

  globalThis.window = {
    SpeechRecognition: MockSpeechRecognition
  };

  try {
    let finalResult = '';

    voiceService.startListening({
      lang: 'or',
      onFinalResult: (res) => {
        finalResult = res;
      }
    });

    const recInstance = voiceService['recognition'];

    // Result 1
    recInstance.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ନମସ୍କାର ସାର୍' }], { isFinal: true })
      ]
    });

    // Repeat identical result in event stream (simulating browser duplicate event)
    recInstance.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: 'ନମସ୍କାର ସାର୍' }], { isFinal: true })
      ]
    });

    voiceService.stopListening();

    assert.equal(finalResult, 'ନମସ୍କାର ସାର୍', 'Must deduplicate and NOT repeat words into "ନମସ୍କାର ସାର୍ ନମସ୍କାର ସାର୍"');
  } finally {
    voiceService.stopListening();
    delete globalThis.window;
  }
});

test('Speech-to-Text: Informative error handling for permission denied and unsupported browser', async () => {
  // 1. Unsupported Browser
  globalThis.window = {}; // No SpeechRecognition API
  let notSupportedReported = '';

  voiceService.startListening({
    lang: 'or',
    onError: (msg) => {
      notSupportedReported = msg;
    }
  });

  assert.ok(
    notSupportedReported.includes('ସ୍ୱର ଚିହ୍ନଟ (Speech Recognition) ସୁବିଧା ନାହିଁ') ||
    notSupportedReported.includes('not supported'),
    'Must display informative message when Web Speech API is absent'
  );

  // 2. Microphone Permission Denied
  class MockSpeechRecognition {
    onerror = null;
    onstart = null;
    start() {
      if (this.onerror) {
        this.onerror({ error: 'not-allowed' });
      }
    }
    stop() {}
  }

  globalThis.window = {
    SpeechRecognition: MockSpeechRecognition
  };

  let permissionErrorReported = '';
  voiceService.startListening({
    lang: 'or',
    onError: (msg) => {
      permissionErrorReported = msg;
    }
  });

  assert.ok(
    permissionErrorReported.includes('ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ'),
    'Must provide clear instructions in Odia when microphone permission is denied'
  );

  delete globalThis.window;
});
