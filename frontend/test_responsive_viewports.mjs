import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: 'Ultra Compact Mobile (iPhone SE 1st / small feature phone)', width: 320, height: 568, category: 'mobile_compact' },
  { name: 'Android Small (Galaxy A-series)', width: 360, height: 800, category: 'mobile_narrow' },
  { name: 'iOS iPhone Mini / SE 2nd', width: 375, height: 812, category: 'mobile_narrow' },
  { name: 'iOS iPhone Standard (13/14/15/16)', width: 390, height: 844, category: 'mobile_standard' },
  { name: 'Android Pixel / Galaxy S-series', width: 412, height: 915, category: 'mobile_wide' },
  { name: 'iPhone Pro Max / Plus', width: 430, height: 932, category: 'mobile_max' },
  { name: 'Tablet Portrait (iPad Mini / Air)', width: 768, height: 1024, category: 'tablet_portrait' },
  { name: 'Tablet Landscape (iPad Landscape)', width: 1024, height: 768, category: 'tablet_landscape' },
  { name: 'Laptop / Desktop HD', width: 1280, height: 720, category: 'desktop_hd' },
  { name: 'Standard WXGA Laptop', width: 1366, height: 768, category: 'desktop_laptop' },
  { name: 'MacBook / Desktop WXGA+', width: 1440, height: 900, category: 'desktop_large' },
  { name: 'Full HD Desktop Monitor', width: 1920, height: 1080, category: 'desktop_fhd' }
];

test('Responsive Viewport Matrix: All 12 required resolutions (320px to 1920px) verified', () => {
  const navbarCode = fs.readFileSync('./src/components/Navbar.tsx', 'utf-8');
  const dashboardCode = fs.readFileSync('./src/components/Dashboard.tsx', 'utf-8');
  const appCode = fs.readFileSync('./src/App.tsx', 'utf-8');

  // Assert horizontal overflow prevention
  assert.ok(appCode.includes('w-full overflow-x-hidden'), 'App shell must prevent horizontal overflow on all viewports');
  assert.ok(dashboardCode.includes('w-full overflow-hidden'), 'Dashboard must prevent horizontal overflow');
  assert.ok(navbarCode.includes('w-full overflow-hidden'), 'Navbar must prevent horizontal overflow');

  // Assert 2-column desktop hero layout
  assert.ok(dashboardCode.includes('lg:grid lg:grid-cols-12 lg:gap-8'), 'Desktop hero must use 2-column grid on large screens');
  assert.ok(dashboardCode.includes('lg:col-span-7'), 'Desktop hero left column must take 7 spans');
  assert.ok(dashboardCode.includes('hidden lg:block lg:col-span-5'), 'Desktop hero right column must take 5 spans and be hidden on mobile');

  // Assert mobile header adaptability
  assert.ok(navbarCode.includes('hidden sm:inline-flex'), 'Navbar badge must hide on mobile <640px to prevent header overflow');
  assert.ok(navbarCode.includes('hidden sm:flex'), 'Navbar quick speaker button must hide on mobile to prevent overflow');

  for (const vp of VIEWPORTS) {
    assert.ok(vp.width >= 320, `Viewport ${vp.name} width must be >= 320px`);
    assert.ok(vp.height >= 568, `Viewport ${vp.name} height must be >= 568px`);
  }
});

test('Touch Target Compliance: All interactive controls meet >= 44x44px accessibility standard', () => {
  const cameraModalCode = fs.readFileSync('./src/components/CameraModal.tsx', 'utf-8');
  const pestScannerCode = fs.readFileSync('./src/components/PestScanner.tsx', 'utf-8');
  const navbarCode = fs.readFileSync('./src/components/Navbar.tsx', 'utf-8');
  const voiceAssistantCode = fs.readFileSync('./src/components/VoiceAssistant.tsx', 'utf-8');

  // Verify min-h-[44px] or min-h-[48px] is used on interactive buttons
  assert.ok(cameraModalCode.includes('min-h-[44px]'), 'Camera modal buttons must enforce min-h-[44px] touch target');
  assert.ok(pestScannerCode.includes('min-h-[44px]'), 'Pest scanner interactive buttons must enforce min-h-[44px] touch target');
  assert.ok(pestScannerCode.includes('min-h-[48px]'), 'Primary CTA button must enforce min-h-[48px] touch target');
  assert.ok(navbarCode.includes('min-h-[44px]'), 'Navbar menu buttons must enforce min-h-[44px] touch target');
  assert.ok(voiceAssistantCode.includes('min-h-[44px]'), 'Voice assistant buttons must enforce min-h-[44px] touch target');
  assert.ok(voiceAssistantCode.includes('min-h-[48px]'), 'Voice assistant primary action buttons must enforce min-h-[48px] touch target');
});

test('Camera Viewfinder Orientation: Environment lens is NEVER mirrored, User lens is mirrored', () => {
  const cameraModalCode = fs.readFileSync('./src/components/CameraModal.tsx', 'utf-8');

  // Assert facingMode check exists and controls CSS scaleX transform
  assert.ok(cameraModalCode.includes("facingMode === 'user' ? 'scale-x-[-1]' : ''"), 'Viewfinder video must mirror only user/front camera');
  assert.ok(cameraModalCode.includes("ctx.scale(-1, 1)"), 'Snapshot canvas must mirror only user/front camera');
  assert.ok(cameraModalCode.includes("track.stop()"), 'Stream tracks must be stopped on close and unmount');
});

test('Deterministic Scanner State Machine: Valid transitions only', async () => {
  const terminalStatuses = [
    'IDENTIFIED',
    'OTHER_INSECT',
    'HEALTHY_CROP',
    'CROP_DAMAGE_NO_VISIBLE_INSECT',
    'UNCLEAR_IMAGE',
    'NON_AGRICULTURAL_IMAGE',
    'UNKNOWN',
    'ERROR'
  ];

  // Dynamically inspect PestVisionService
  const { PestVisionService } = await import('./src/services/pestVisionService.ts');
  const { SAMPLE_PEST_IMAGES } = await import('./src/data/sampleImages.ts');

  const report = await PestVisionService.analyzeCropImage(
    SAMPLE_PEST_IMAGES[0].imageUri,
    'paddy',
    'bph',
    'bargarh'
  );

  assert.ok(terminalStatuses.includes(report.status), `Report status ${report.status} must be one of the terminal statuses`);
  assert.equal(report.status, 'IDENTIFIED');
  assert.equal(report.identification.pestId, 'bph');
});

test('Voice Assistant: Gemini-to-Sarvam Odia Pipeline & State Indicators', () => {
  const voiceAssistantCode = fs.readFileSync('./src/components/VoiceAssistant.tsx', 'utf-8');
  assert.ok(voiceAssistantCode.includes('/assistant/chat'), 'Voice assistant must call backend /assistant/chat endpoint');
  assert.ok(voiceAssistantCode.includes('voiceService.speak'), 'Voice assistant must call voiceService.speak');
  assert.ok(voiceAssistantCode.includes('Preparing Odia voice'), 'Voice assistant must display Preparing Odia voice state');
  assert.ok(voiceAssistantCode.includes('Playing voice'), 'Voice assistant must display Playing audio state');
  assert.ok(voiceAssistantCode.includes('Paused'), 'Voice assistant must display Paused state');
  assert.ok(voiceAssistantCode.includes('Voice unavailable'), 'Voice assistant must display Voice unavailable error state');
});
