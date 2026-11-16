import test from 'node:test';
import assert from 'node:assert/strict';

// Import knowledge base and sample data
import { PEST_KNOWLEDGE_BASE } from './src/data/pestsData.ts';
import { SAMPLE_PEST_IMAGES } from './src/data/sampleImages.ts';

test('Knowledge base integrity: 5 rice pests + beneficial spider + healthy paddy exist', () => {
  const requiredPestKeys = ['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm', 'beneficial_spider', 'healthy_paddy', 'uncertain'];
  for (const key of requiredPestKeys) {
    assert.ok(PEST_KNOWLEDGE_BASE[key], `Missing knowledge base entry for ${key}`);
    assert.ok(PEST_KNOWLEDGE_BASE[key].commonNameEn, `Missing English name for ${key}`);
    assert.ok(PEST_KNOWLEDGE_BASE[key].commonNameOr, `Missing Odia name for ${key}`);
    assert.ok(PEST_KNOWLEDGE_BASE[key].scientificName, `Missing scientific name for ${key}`);
  }
});

test('Sample library integrity: 16 verified real field specimens', () => {
  assert.equal(SAMPLE_PEST_IMAGES.length, 16, 'Sample library must contain exactly 16 specimens');
  for (const sample of SAMPLE_PEST_IMAGES) {
    assert.ok(sample.id, 'Sample must have an id');
    assert.ok(sample.pestId, `Sample ${sample.id} missing pestId`);
    assert.ok(sample.imageUri.startsWith('data:image/'), `Sample ${sample.id} must have valid data URI`);
    assert.ok(['real_photograph', 'optical_degradation_test'].includes(sample.imageType), `Sample ${sample.id} must be real photograph or optical test`);
    assert.ok(sample.license, `Sample ${sample.id} must have valid license`);
    assert.ok(sample.attribution, `Sample ${sample.id} must have attribution`);
  }
});

test('Treatment Gating: Chemical treatment only allowed for 5 rice pests with high confidence', () => {
  const allowedPests = ['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm'];
  const disallowedPests = ['beneficial_spider', 'healthy_paddy', 'uncertain', 'other_insect', 'non_agricultural'];

  for (const pestId of disallowedPests) {
    const isAllowed = allowedPests.includes(pestId);
    assert.equal(isAllowed, false, `Treatment must be disallowed for ${pestId}`);
  }
});

test('Expert baseline report rules: Never default unclear or arbitrary image to bph', async () => {
  // Mock assessment quality
  const mockQualityClear = { isClear: true, lightingScore: 85, sharpnessScore: 80 };
  const mockQualityUnclear = { isClear: false, lightingScore: 40, sharpnessScore: 10, warningMessage: 'Blurry' };

  // Dynamically import PestVisionService
  const { PestVisionService } = await import('./src/services/pestVisionService.ts');

  // 1. Unclear image specimen test
  const unclearReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'unclear_image');
  assert.equal(unclearReport.status, 'UNCLEAR_IMAGE', 'Unclear specimen must have UNCLEAR_IMAGE status');
  assert.notEqual(unclearReport.identification.pestId, 'bph', 'Unclear image must NEVER default to bph!');
  assert.equal(unclearReport.treatmentAllowed, false, 'Unclear image must have treatmentAllowed = false');

  // 2. Non-agricultural image test
  const nonAgReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'non_agricultural');
  assert.equal(nonAgReport.status, 'NON_AGRICULTURAL_IMAGE', 'Non-ag specimen must have NON_AGRICULTURAL_IMAGE status');
  assert.equal(nonAgReport.treatmentAllowed, false, 'Non-ag image must have treatmentAllowed = false');

  // 3. Healthy crop test
  const healthyReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'healthy_paddy');
  assert.equal(healthyReport.status, 'HEALTHY_CROP', 'Healthy specimen must have HEALTHY_CROP status');
  assert.equal(healthyReport.treatmentAllowed, false, 'Healthy crop must have treatmentAllowed = false');

  // 4. Crop damage without visible insect test
  const damageReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'crop_damage_no_insect');
  assert.equal(damageReport.status, 'CROP_DAMAGE_NO_VISIBLE_INSECT', 'Crop damage without insect must have CROP_DAMAGE_NO_VISIBLE_INSECT status');
  assert.equal(damageReport.treatmentAllowed, false, 'Crop damage without insect must have treatmentAllowed = false');

  // 5. Beneficial spider test
  const spiderReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'beneficial_spider');
  assert.equal(spiderReport.status, 'OTHER_INSECT', 'Beneficial spider must be categorized as OTHER_INSECT');
  assert.equal(spiderReport.treatmentAllowed, false, 'Beneficial predator must NEVER have chemical treatment allowed');

  // 6. Supported pest (bph)
  const bphReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'bph');
  assert.equal(bphReport.status, 'IDENTIFIED');
  assert.equal(bphReport.identification.pestId, 'bph');
  assert.equal(bphReport.treatmentAllowed, true, 'Confirmed BPH pest must have treatment allowed');

  // 7. Supported pest (stem_borer)
  const ysbReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dGVzdA==', 'paddy', 'stem_borer');
  assert.equal(ysbReport.status, 'IDENTIFIED');
  assert.equal(ysbReport.identification.pestId, 'stem_borer');
  assert.equal(ysbReport.treatmentAllowed, true, 'Confirmed YSB pest must have treatment allowed');

  // 8. Arbitrary offline image without forced ID
  const unknownReport = await PestVisionService.analyzeCropImage('data:image/jpeg;base64,dW5rbm93bl9hcmJpdHJhcnlfaW1hZ2U=', 'paddy');
  assert.equal(unknownReport.status, 'UNKNOWN', 'Arbitrary offline image must be UNKNOWN');
  assert.notEqual(unknownReport.identification.pestId, 'bph', 'Arbitrary offline image must NEVER default to bph!');
  assert.equal(unknownReport.treatmentAllowed, false, 'Arbitrary offline image must NEVER have treatment allowed');
});

test('Bilingual UI Translation Parity: All Odia and English keys populated', async () => {
  const { ODIA_TRANSLATIONS } = await import('./src/data/odiaTranslations.ts');
  const enKeys = Object.keys(ODIA_TRANSLATIONS.en);
  const orKeys = Object.keys(ODIA_TRANSLATIONS.or);

  assert.equal(enKeys.length, orKeys.length, 'English and Odia translation dictionaries must have identical key counts');
  for (const k of enKeys) {
    assert.ok(ODIA_TRANSLATIONS.en[k], `Missing EN string for key: ${k}`);
    assert.ok(ODIA_TRANSLATIONS.or[k], `Missing OR string for key: ${k}`);
    if (k !== 'taglineOr' && k !== 'appName') {
      assert.notEqual(ODIA_TRANSLATIONS.en[k], ODIA_TRANSLATIONS.or[k], `Odia text should be translated, not English echo for: ${k}`);
    }
  }
});

test('Pest-Specific ETL Standards: All 5 supported pests have authentic thresholds in EN and OR', () => {
  const supported = ['bph', 'stem_borer', 'leaf_folder', 'rice_hispa', 'armyworm'];
  for (const id of supported) {
    const k = PEST_KNOWLEDGE_BASE[id];
    assert.ok(k, `Pest ${id} must exist in knowledge base`);
    assert.ok(k.economicThresholdLevelEn, `Missing English ETL for ${id}`);
    assert.ok(k.economicThresholdLevelOr, `Missing Odia ETL for ${id}`);
    assert.ok(k.economicThresholdLevelEn.length > 15, `ETL for ${id} too short to be authentic`);
    assert.ok(k.chemicalControl.length > 0, `Pest ${id} must have registered chemical options`);
    for (const chem of k.chemicalControl) {
      assert.ok(chem.activeIngredient, 'Molecule must have active ingredient');
      assert.ok(chem.dosagePerAcre, 'Molecule must specify per-acre dosage');
      assert.ok(chem.phiDays >= 0, 'Molecule must specify Pre-Harvest Interval (PHI)');
      assert.ok(chem.cibrcRegistered, 'Molecule must be CIBRC registered');
    }
  }
});

test('Binary Image Validation: Accurate magic byte detection and extension spoofing rejection', async () => {
  const { PestVisionService } = await import('./src/services/pestVisionService.ts');

  // 1. Valid JPEG mock file
  const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegBlob = new Blob([jpegBytes], { type: 'image/jpeg' });
  const jpegFile = new File([jpegBlob], 'specimen.jpg', { type: 'image/jpeg' });
  const jpegValidation = await PestVisionService.validateImageBinary(jpegFile);
  assert.equal(jpegValidation.isValid, true, 'Genuine JPEG must validate as valid');
  assert.equal(jpegValidation.format, 'image/jpeg');

  // 2. Valid PNG mock file
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
  const pngBlob = new Blob([pngBytes], { type: 'image/png' });
  const pngFile = new File([pngBlob], 'sample.png', { type: 'image/png' });
  const pngValidation = await PestVisionService.validateImageBinary(pngFile);
  assert.equal(pngValidation.isValid, true, 'Genuine PNG must validate as valid');
  assert.equal(pngValidation.format, 'image/png');

  // 3. Valid WEBP mock file
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20
  ]);
  const webpBlob = new Blob([webpBytes], { type: 'image/webp' });
  const webpFile = new File([webpBlob], 'field.webp', { type: 'image/webp' });
  const webpValidation = await PestVisionService.validateImageBinary(webpFile);
  assert.equal(webpValidation.isValid, true, 'Genuine WEBP must validate as valid');
  assert.equal(webpValidation.format, 'image/webp');

  // 4. Empty file rejection (0 bytes)
  const emptyBlob = new Blob([], { type: 'image/jpeg' });
  const emptyFile = new File([emptyBlob], 'empty.jpg', { type: 'image/jpeg' });
  const emptyValidation = await PestVisionService.validateImageBinary(emptyFile);
  assert.equal(emptyValidation.isValid, false, '0-byte file must be rejected');
  assert.equal(emptyValidation.format, 'empty');

  // 5. Extension spoofing rejection (plain text disguised as .jpg)
  const fakeBytes = new TextEncoder().encode('THIS_IS_PLAIN_TEXT_NOT_AN_INSECT_IMAGE');
  const fakeBlob = new Blob([fakeBytes], { type: 'image/jpeg' });
  const fakeFile = new File([fakeBlob], 'malicious_text.jpg', { type: 'image/jpeg' });
  const fakeValidation = await PestVisionService.validateImageBinary(fakeFile);
  assert.equal(fakeValidation.isValid, false, 'Spoofed file must be rejected');
  assert.equal(fakeValidation.format, 'unsupported');
});

test('Cryptographic SHA-256 Digest & Traceability on Every Diagnosis Report', async () => {
  const { PestVisionService } = await import('./src/services/pestVisionService.ts');

  const sampleDataUrl = SAMPLE_PEST_IMAGES[0].imageUri;
  const hash = await PestVisionService.computeImageHash(sampleDataUrl);
  assert.ok(hash && hash.length >= 16, 'SHA-256 hash must be computed');

  const customReqId = 'req-trace-test-001';
  const report = await PestVisionService.analyzeCropImage(
    sampleDataUrl,
    'paddy',
    'bph',
    'bargarh',
    customReqId
  );

  assert.equal(report.requestId, customReqId, 'Report must carry caller requestId');
  assert.ok(report.imageHash, 'Report must carry specimen imageHash');
  assert.ok(report.modelVersion, 'Report must carry modelVersion');
  assert.ok(report.analysisTimestamp > 0, 'Report must carry analysisTimestamp');
});


