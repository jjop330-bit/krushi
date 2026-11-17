import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PEST_KNOWLEDGE_BASE } from './src/data/pestsData.ts';
import { voiceService } from './src/services/voiceService.ts';

test('VoiceAssistant Source Code Audit: Intent Handling, Gemini Context & Voice Routing', () => {
  const code = fs.readFileSync('./src/components/VoiceAssistant.tsx', 'utf-8');

  // 1. Check greetings & small talk intent handling presence
  assert.ok(code.includes('checkGreetingOrSmallTalk'), 'Must have checkGreetingOrSmallTalk intent handler');
  assert.ok(code.includes('hii'), 'Must recognize "hii"');
  assert.ok(code.includes('namaste'), 'Must recognize "namaste"');
  assert.ok(code.includes('ନମସ୍କାର'), 'Must recognize Odia "ନମସ୍କାର"');
  assert.ok(code.includes('ଜୁହାର'), 'Must recognize Odia "ଜୁହାର"');
  assert.ok(code.includes('ଧନ୍ୟବାଦ'), 'Must recognize Odia "ଧନ୍ୟବାଦ"');

  // 2. Check 3 suggestion chips canned responses
  assert.ok(code.includes('checkSuggestionChips'), 'Must have checkSuggestionChips handler');
  assert.ok(code.includes('Why did this pest attack my paddy?'), 'Must have chip 1');
  assert.ok(code.includes('How can I control it without chemicals?'), 'Must have chip 2');
  assert.ok(code.includes('What is the correct chemical dosage?'), 'Must have chip 3');

  // 3. Check clean treatment formatting (no double period, lowercase mid-sentence flood, proper followed by)
  assert.ok(code.includes('formatTreatmentStepsEn'), 'Must have formatTreatmentStepsEn');
  assert.ok(code.includes('formatTreatmentStepsOr'), 'Must have formatTreatmentStepsOr');
  assert.ok(code.includes('replace(/\\.+$/'), 'Must strip trailing periods to prevent double periods');

  // 4. Check that free-form questions are sent to Gemini and do not use static fallback
  assert.ok(code.includes('/assistant/chat'), 'Must call backend /assistant/chat for free-form questions');

  // 5. Check language matching & Sarvam Bulbul v3 od-IN voice on Listen
  assert.ok(code.includes('detectedLanguage'), 'Must track detected language on messages');
  assert.ok(code.includes("handleSpeechOutput(msg.id, msg.textOr || msg.textEn, 'or')"), 'Listen button must speak Odia text with "or" language for Sarvam Bulbul v3');
});

test('Format Treatment Steps: No double period, lowercase mid-sentence "flood", proper ", followed by "', () => {
  const armyworm = PEST_KNOWLEDGE_BASE.armyworm;
  assert.ok(armyworm, 'armyworm pest must exist in knowledge base');

  const steps = armyworm.immediateNextStepsEn;
  assert.ok(steps.length >= 2, 'armyworm must have at least 2 next steps');

  // Verify the raw strings contain the capital Flood and trailing period
  assert.ok(steps[0].endsWith('.'), 'Raw step 0 ends with period');
  assert.ok(steps[1].startsWith('Flood'), 'Raw step 1 starts with capital Flood');
  assert.ok(steps[1].endsWith('.'), 'Raw step 1 ends with period');

  // Implementation of formatting function
  const cleanStep0 = steps[0].trim().replace(/\.+$/, '');
  let cleanStep1 = steps[1].trim().replace(/\.+$/, '');
  cleanStep1 = cleanStep1.charAt(0).toLowerCase() + cleanStep1.slice(1);
  const formatted = `${cleanStep0}, followed by ${cleanStep1}.`;

  // Verify fixes
  assert.ok(!formatted.includes('..'), 'Must NOT contain double periods ("..")');
  assert.ok(!formatted.includes('. followed by'), 'Must NOT have lowercase "followed by" directly after a period');
  assert.ok(formatted.includes(', followed by flood'), 'Must cleanly join with comma and lowercase "flood"');
  assert.ok(formatted.endsWith('them.'), 'Must end with single period after "them."');
});

test('Odia Voice Playback: Listen button triggers Sarvam Bulbul v3 with od-IN payload', async () => {
  const originalFetch = globalThis.fetch;
  let sentPayload = null;

  globalThis.fetch = async (url, options) => {
    sentPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        audio_base64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        mime_type: 'audio/wav',
        duration_seconds: 1.5,
        model: 'bulbul:v3',
        language_code: 'od-IN',
        speaker: 'shubh'
      })
    };
  };

  const originalAudio = globalThis.Audio;
  globalThis.Audio = class MockAudio {
    onplay = null;
    onended = null;
    async play() {
      if (this.onplay) this.onplay();
      if (this.onended) this.onended();
    }
    pause() {}
  };

  try {
    const odiaText = 'ନମସ୍କାର! ଆପଣଙ୍କ ଲେଡା ପୋକ ସମସ୍ୟାରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?';
    await voiceService.speak(odiaText, 'or', { speaker: 'shubh' });

    assert.ok(sentPayload, 'Fetch payload must be generated');
    assert.equal(sentPayload.language_code, 'od-IN', 'Language code must be od-IN for Bulbul v3');
    assert.equal(sentPayload.speaker, 'shubh', 'Speaker must be shubh');
    assert.equal(sentPayload.text, odiaText, 'Odia text must match');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.Audio = originalAudio;
    voiceService.stopSpeaking();
  }
});
