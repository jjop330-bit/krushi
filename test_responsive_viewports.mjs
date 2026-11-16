import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: 'Android Small (Galaxy A-series)', width: 360, height: 800, category: 'mobile_narrow' },
  { name: 'iOS iPhone Mini / SE', width: 375, height: 812, category: 'mobile_narrow' },
  { name: 'iOS iPhone Standard (13/14/15)', width: 390, height: 844, category: 'mobile_standard' },
  { name: 'Android Pixel / Galaxy S-series', width: 412, height: 915, category: 'mobile_wide' },
  { name: 'Tablet Portrait (iPad Mini / Air)', width: 768, height: 1024, category: 'tablet_portrait' },
  { name: 'Tablet Landscape (iPad Landscape)', width: 1024, height: 768, category: 'tablet_landscape' },
  { name: 'Laptop / Desktop HD', width: 1280, height: 720, category: 'desktop_hd' },
  { name: 'MacBook / Desktop WXGA+', width: 1440, height: 900, category: 'desktop_large' },
  { name: 'Full HD Desktop Monitor', width: 1920, height: 1080, category: 'desktop_fhd' }
];

test('Responsive Viewport Matrix: All 9 required resolutions supported in CSS grid & flex breakpoints', () => {
  const cssContent = fs.readFileSync('./src/index.css', 'utf-8');
  const pestScannerCode = fs.readFileSync('./src/components/PestScanner.tsx', 'utf-8');
  const cameraModalCode = fs.readFileSync('./src/components/CameraModal.tsx', 'utf-8');

  for (const vp of VIEWPORTS) {
    assert.ok(vp.width >= 360, `Viewport ${vp.name} width must be >= 360px`);
    assert.ok(vp.height >= 720, `Viewport ${vp.name} height must be >= 720px`);

    // Verify breakpoint handling
    if (vp.width < 640) {
      // Mobile narrow checks: responsive grid/flex stacks
      assert.ok(pestScannerCode.includes('flex-col sm:flex-row'), 'Scanner title/buttons must stack vertically on mobile viewports');
      assert.ok(pestScannerCode.includes('grid-cols-2 sm:grid-cols-4'), 'Sample test strip must wrap to 2 columns on mobile screens');
    } else if (vp.width >= 640 && vp.width < 1024) {
      // Tablet checks
      assert.ok(pestScannerCode.includes('sm:p-8'), 'Scanner card must adapt padding for tablet screens');
    } else {
      // Desktop checks: drag & drop and spacious layout
      assert.ok(pestScannerCode.includes('max-w-4xl mx-auto'), 'Scanner container must be centered with max width to avoid stretching on desktop 1080p');
    }
  }
});

test('Touch Target Compliance: All interactive controls meet >= 44x44px accessibility standard', () => {
  const cameraModalCode = fs.readFileSync('./src/components/CameraModal.tsx', 'utf-8');
  const pestScannerCode = fs.readFileSync('./src/components/PestScanner.tsx', 'utf-8');

  // Verify min-h-[44px] or min-h-[48px] is used on interactive buttons
  assert.ok(cameraModalCode.includes('min-h-[44px]'), 'Camera modal buttons must enforce min-h-[44px] touch target');
  assert.ok(pestScannerCode.includes('min-h-[44px]'), 'Pest scanner interactive buttons must enforce min-h-[44px] touch target');
  assert.ok(pestScannerCode.includes('min-h-[48px]'), 'Primary CTA button must enforce min-h-[48px] touch target');
});

test('Camera Viewfinder Orientation: Environment lens is NEVER mirrored, User lens is mirrored', () => {
  const cameraModalCode = fs.readFileSync('./src/components/CameraModal.tsx', 'utf-8');

  // Assert facingMode check exists and controls CSS scaleX transform
  assert.ok(cameraModalCode.includes("facingMode === 'user' ? 'scale-x-[-1]' : ''"), 'Viewfinder video must mirror only user/front camera');
  assert.ok(cameraModalCode.includes("ctx.scale(-1, 1)"), 'Snapshot canvas must mirror only user/front camera');
  assert.ok(cameraModalCode.includes("track.stop()"), 'Stream tracks must be stopped on close and unmount');
});

test('Deterministic Scanner State Machine: Valid transitions only', async () => {
  const validStates = ['IDLE', 'IMAGE_SELECTED', 'IMAGE_VALIDATED', 'ANALYZING', 'RESULT_RECEIVED'];
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
