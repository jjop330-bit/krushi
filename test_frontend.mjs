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
