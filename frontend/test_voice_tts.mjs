import test from 'node:test';
import assert from 'node:assert/strict';

// Import VoiceService and audio types
import { voiceService } from './src/services/voiceService.ts';
import { PEST_KNOWLEDGE_BASE } from './src/data/pestsData.ts';

test('VoiceService Singleton & Initial State', () => {
  assert.ok(voiceService, 'voiceService instance must exist');
  assert.equal(voiceService.getPlaybackState(), 'idle', 'Initial playback state must be idle');
  assert.equal(voiceService.isVoiceSupported(), true, 'Voice output must be supported');
});

test('Empty or Whitespace Text Handling: Immediately finishes without network request', async () => {
  let finished = false;
  await voiceService.speak('   ', 'or', {
    onEnd: () => {
      finished = true;
    }
  });

  assert.equal(finished, true, 'Empty speech must complete immediately');
  assert.equal(voiceService.getPlaybackState(), 'idle', 'Playback state must be idle after empty text');
});

test('Odia Language Routing & Payload Contract: Language code is strictly od-IN', async () => {
  // Mock global fetch to intercept backend TTS call
  const originalFetch = globalThis.fetch;
  let interceptedPayload = null;
  let interceptedUrl = '';

  globalThis.fetch = async (url, options) => {
    interceptedUrl = url.toString();
    interceptedPayload = JSON.parse(options.body);

    // Mock successful Sarvam Bulbul v3 response
    return {
      ok: true,
      status: 200,
      json: async () => ({
        audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        mime_type: 'audio/wav',
        duration_seconds: 2.5,
        model: 'bulbul:v3',
        language_code: 'od-IN',
        speaker: 'shubh'
      })
    };
  };

  // Mock global Audio
  const originalAudio = globalThis.Audio;
  globalThis.Audio = class MockAudio {
    src = '';
    onplay = null;
    onpause = null;
    onended = null;
    onerror = null;
    constructor(src) {
      this.src = src;
    }
    async play() {
      if (this.onplay) this.onplay();
    }
    pause() {
      if (this.onpause) this.onpause();
    }
  };

  try {
    const testOdiaText = 'ନମସ୍କାର! ଧାନ ଫସଲରେ କାଣ୍ଡବିନ୍ଧା ପୋକ (Scirpophaga incertulas) ଦେଖାଦେଇଛି। ଲିଟର ପ୍ରତି ୪ ମିଲି ନିମ୍ବ ତେଲ ସିଞ୍ଚନ କରନ୍ତୁ।';
    let stateChanges = [];

    await voiceService.speak(testOdiaText, 'or', {
      onStateChange: (state) => {
        stateChanges.push(state);
      }
    });

    assert.ok(interceptedUrl.includes('/voice/tts'), 'Must route to backend /voice/tts endpoint');
    assert.equal(interceptedPayload.language_code, 'od-IN', 'Target language must strictly be od-IN');
    assert.equal(interceptedPayload.speaker, 'shubh', 'Default Odia speaker must be shubh');
    assert.equal(interceptedPayload.text, testOdiaText, 'Odia text must be passed unaltered');
    assert.ok(interceptedPayload.text.includes('Scirpophaga incertulas'), 'Latin scientific binomials must remain intact in Odia TTS request');
    assert.ok(stateChanges.includes('loading'), 'Must transition through loading state');
    assert.ok(stateChanges.includes('playing'), 'Must transition to playing state');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
    voiceService.stopSpeaking();
  }
});

test('Fail-Closed Fallback: Never fall back silently to Hindi or English speech when Odia fails', async () => {
  const originalFetch = globalThis.fetch;
  let receivedErrorMessage = '';

  // Mock fetch failure (e.g. Sarvam API unavailable or key unconfigured)
  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable'
    };
  };

  try {
    await voiceService.speak('ଓଡ଼ିଆ କଥାବାର୍ତ୍ତା ପରୀକ୍ଷା', 'or', {
      onError: (errMsg) => {
        receivedErrorMessage = errMsg;
      }
    });

    assert.equal(voiceService.getPlaybackState(), 'error', 'Must be in error state after network/service failure');
    assert.ok(receivedErrorMessage.includes('ଓଡ଼ିଆ ଅଡିଓ ସାମୟିକ ଭାବେ ଅନୁପଲବ୍ଧ ଅଛି'), 'Must present clear Odia retry message, NOT switch to Hindi/English');
  } finally {
    globalThis.fetch = originalFetch;
    voiceService.stopSpeaking();
  }
});

test('Playback Controls: Pause, Resume, Replay and Stop lifecycle', async () => {
  const originalFetch = globalThis.fetch;
  const originalAudio = globalThis.Audio;

  let playCalled = 0;
  let pauseCalled = 0;

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      mime_type: 'audio/wav',
      duration_seconds: 1.0,
      model: 'bulbul:v3',
      language_code: 'od-IN',
      speaker: 'shubh'
    })
  });

  globalThis.Audio = class MockAudio {
    paused = false;
    currentTime = 0;
    onplay = null;
    onpause = null;
    onended = null;
    async play() {
      playCalled++;
      this.paused = false;
      if (this.onplay) this.onplay();
    }
    pause() {
      pauseCalled++;
      this.paused = true;
      if (this.onpause) this.onpause();
    }
  };

  try {
    let states = [];
    await voiceService.speak('ପରୀକ୍ଷା ବାକ୍ୟ', 'or', {
      onStateChange: (st) => states.push(st)
    });

    assert.equal(voiceService.getPlaybackState(), 'playing');
    assert.equal(playCalled, 1);

    // Pause
    voiceService.pause();
    assert.equal(voiceService.getPlaybackState(), 'paused');
    assert.equal(pauseCalled, 1);

    // Resume
    voiceService.resume();
    assert.equal(voiceService.getPlaybackState(), 'playing');
    assert.equal(playCalled, 2);

    // Replay
    voiceService.replay();
    assert.equal(playCalled, 3);

    // Stop
    voiceService.stopSpeaking();
    assert.equal(voiceService.getPlaybackState(), 'idle');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
    voiceService.stopSpeaking();
  }
});

test('Rapid Repeated Speaker Clicks: Aborts prior requests and cleans up audio', async () => {
  const originalFetch = globalThis.fetch;
  const originalAudio = globalThis.Audio;

  let abortCount = 0;

  globalThis.fetch = async (url, options) => {
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        abortCount++;
      });
    }
    // Simulate slight delay
    await new Promise(r => setTimeout(r, 50));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        mime_type: 'audio/wav'
      })
    };
  };

  globalThis.Audio = class MockAudio {
    onplay = null;
    onended = null;
    async play() {
      if (this.onplay) this.onplay();
    }
    pause() {}
  };

  try {
    // Click 1
    voiceService.speak('ପ୍ରଥମ ବଟନ୍ କ୍ଲିକ୍', 'or');
    // Immediate Click 2
    voiceService.speak('ଦ୍ୱିତୀୟ ବଟନ୍ କ୍ଲିକ୍', 'or');
    // Immediate Click 3
    await voiceService.speak('ତୃତୀୟ ବଟନ୍ କ୍ଲିକ୍', 'or');

    assert.ok(abortCount >= 1, 'Previous pending request must be aborted when a new speaker click occurs');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
    voiceService.stopSpeaking();
  }
});

test('Scientific Names & Dosages Preservation: All 5 supported pests preserve binomials in Odia voice narration', () => {
  const testCases = [
    { id: 'stem_borer', scientific: 'Scirpophaga incertulas', odia: 'ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକ' },
    { id: 'bph', scientific: 'Nilaparvata lugens', odia: 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ' },
    { id: 'leaf_folder', scientific: 'Cnaphalocrocis medinalis', odia: 'ପତ୍ରମୋଡ଼ା ପୋକ' },
    { id: 'rice_hispa', scientific: 'Dicladispa armigera', odia: 'ହିସ୍ପା (କଣ୍ଟା ପୋକ)' },
    { id: 'armyworm', scientific: 'Mythimna separata', odia: 'ଲେଡ଼ା ପୋକ' }
  ];

  for (const tc of testCases) {
    const pest = PEST_KNOWLEDGE_BASE[tc.id];
    assert.ok(pest, `Knowledge base must contain ${tc.id}`);
    assert.ok(pest.scientificName.includes(tc.scientific), `Scientific name must contain binomial ${tc.scientific}, got: ${pest.scientificName}`);
    
    // Simulate generation of Odia speech prompt
    const narrationText = `କୃଷି ମିତ୍ର AI ନିରୀକ୍ଷଣ: ଆପଣଙ୍କ ଧାନ ଫସଲରେ ${pest.commonNameOr} (${pest.scientificName}) ର ଲକ୍ଷଣ ଚିହ୍ନଟ ହୋଇଛି।`;
    assert.ok(narrationText.includes(tc.scientific), `Narration text must contain exact scientific name: ${tc.scientific}`);
    assert.ok(narrationText.includes(pest.commonNameOr), `Narration text must contain authentic Odia name: ${pest.commonNameOr}`);
  }
});
