import test from 'node:test';
import assert from 'node:assert/strict';

// Test new marketplace and expert types & services
import { MarketplaceService } from './src/services/marketplaceService.ts';
import { ExpertService } from './src/services/expertService.ts';
import { ODIA_TRANSLATIONS } from './src/data/odiaTranslations.ts';

test('Marketplace Categories: All 8 required categories exist with Odia & English titles', async () => {
  const cats = await MarketplaceService.getCategories();
  assert.equal(cats.length, 8, 'Must have exactly 8 product categories');
  
  const expectedCatIds = [
    'seeds', 'fertilizers', 'organic', 'irrigation', 
    'machinery', 'tools', 'crop_protection', 'harvesting'
  ];
  for (const catId of expectedCatIds) {
    const found = cats.find(c => c.id === catId);
    assert.ok(found, `Category ${catId} must exist`);
    assert.ok(found.name_en, `Category ${catId} must have English name`);
    assert.ok(found.name_or, `Category ${catId} must have Odia name`);
  }
});

test('Verified Agricultural Experts: Directory populated with authenticated institutions', async () => {
  const experts = await ExpertService.listExperts();
  assert.ok(experts.length >= 3, 'Must have verified experts from major Odisha institutions');
  
  const patnaik = experts.find(e => e.id === 'expert-dr-patnaik');
  assert.ok(patnaik, 'Dr. Subrat Kumar Patnaik must be listed');
  assert.ok(patnaik.institution.includes('OUAT'), 'Dr. Patnaik must belong to OUAT');
  assert.ok(patnaik.specialization.includes('Brown Planthopper') || patnaik.specialization.includes('Pest'), 'Specialization must match entomology/BPH');

  const meher = experts.find(e => e.id === 'expert-dr-meher');
  assert.ok(meher, 'Dr. Radharani Meher must be listed');
  assert.ok(meher.institution.includes('KVK'), 'Dr. Meher must belong to KVK');

  const sahoo = experts.find(e => e.id === 'expert-dr-sahoo');
  assert.ok(sahoo, 'Dr. Biswajit Sahoo must be listed');
  assert.ok(sahoo.institution.includes('NRRI'), 'Dr. Sahoo must belong to ICAR-NRRI');
});

test('Translation Parity: New Marketplace & Expert keys exist in English and Odia', () => {
  const newKeys = [
    'navStore', 'navTalkExpert', 'navSellerPortal', 'navAdminDashboard',
    'navMyOrders', 'navMyRequests', 'ctaFindProducts', 'ctaDiscussExpert',
    'cartTitle', 'checkoutTitle', 'sellerRegisterTitle'
  ];

  for (const key of newKeys) {
    assert.ok(ODIA_TRANSLATIONS.en[key], `Missing English key for ${key}`);
    assert.ok(ODIA_TRANSLATIONS.or[key], `Missing Odia key for ${key}`);
    assert.notEqual(ODIA_TRANSLATIONS.en[key], '', `English translation for ${key} cannot be empty`);
    assert.notEqual(ODIA_TRANSLATIONS.or[key], '', `Odia translation for ${key} cannot be empty`);
  }
});

test('Payment Gateway Configuration: Sandbox/Live state detection is robust', async () => {
  const status = await MarketplaceService.getPaymentStatus();
  assert.ok(status.gateway_name, 'Gateway name must be returned');
  assert.equal(typeof status.is_configured, 'boolean', 'is_configured must be boolean');
  assert.ok(['LIVE', 'SANDBOX', 'SANDBOX_SIMULATION_GATEWAY'].includes(status.mode), 'Mode must be LIVE or SANDBOX');
});
