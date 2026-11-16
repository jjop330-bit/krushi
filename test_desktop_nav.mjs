import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [1440, 1366, 1280, 1024, 900, 768];
const SCREENSHOT_DIR = './NAV_FIX_VERIFICATION_SCREENSHOTS';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verifyAll() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const summary = [];

  for (const width of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 800 });
    await page.goto('http://localhost:4173/');

    // Switch to English
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enBtn = btns.find(b => b.textContent.includes('English') || b.textContent.trim() === 'EN');
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Capture screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `nav_${width}px_en.png`);
    await page.screenshot({ path: screenshotPath });

    const result = await page.evaluate((vpWidth) => {
      const logo = document.querySelector('header .group');
      const langToggle = document.querySelector('header .bg-agri-900\\/80') || document.querySelector('header button');
      const nav = document.querySelector('nav');
      
      const logoRect = logo ? logo.getBoundingClientRect() : null;
      const langRect = langToggle ? langToggle.getBoundingClientRect() : null;

      const bodyScrollWidth = document.body.scrollWidth;
      const windowInnerWidth = window.innerWidth;
      const horizontalOverflow = bodyScrollWidth > windowInnerWidth;

      let navVisible = false;
      let navRect = null;
      let buttons = [];

      if (nav && window.getComputedStyle(nav).display !== 'none') {
        navVisible = true;
        navRect = nav.getBoundingClientRect();
        buttons = Array.from(nav.querySelectorAll('button')).map(b => {
          const rect = b.getBoundingClientRect();
          const text = b.innerText.trim();
          const isClickable = !b.disabled;
          return {
            text,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            overlapLogo: logoRect ? (rect.left < logoRect.right && rect.right > logoRect.left && rect.top < logoRect.bottom && rect.bottom > logoRect.top) : false,
            overlapLang: langRect ? (rect.left < langRect.right && rect.right > langRect.left && rect.top < langRect.bottom && rect.bottom > langRect.top) : false,
            clippedLeft: navRect ? rect.left < navRect.left - 1 : false,
            clippedRight: navRect ? rect.right > navRect.right + 1 : false,
            isClickable
          };
        });
      }

      // Look specifically for Diagnostic Report and Follow-Up
      const diagBtn = buttons.find(b => b.text.includes('Diagnostic Report'));
      const followBtn = buttons.find(b => b.text.includes('Follow-Up'));

      return {
        viewportWidth: vpWidth,
        horizontalOverflow,
        navVisible,
        navRect: navRect ? { left: navRect.left, right: navRect.right, width: navRect.width } : null,
        buttons,
        diagnosticReportVisible: !!diagBtn && !diagBtn.clippedLeft && !diagBtn.clippedRight && !diagBtn.overlapLogo && !diagBtn.overlapLang,
        diagnosticReportText: diagBtn ? diagBtn.text : 'NOT_FOUND',
        followUpVisible: !!followBtn && !followBtn.clippedLeft && !followBtn.clippedRight && !followBtn.overlapLogo && !followBtn.overlapLang,
        followUpText: followBtn ? followBtn.text : 'NOT_FOUND'
      };
    }, width);

    console.log(`\n================ VIEWPORT ${width}px ================`);
    console.log(`Nav visible: ${result.navVisible}`);
    console.log(`Horizontal page overflow: ${result.horizontalOverflow ? 'FAIL' : 'PASS (0px)'}`);
    console.log(`Diagnostic Report text: "${result.diagnosticReportText}" -> ${result.diagnosticReportVisible ? 'PASS (100% visible)' : 'FAIL'}`);
    console.log(`Follow-Up text: "${result.followUpText}" -> ${result.followUpVisible ? 'PASS (100% visible)' : 'FAIL'}`);

    let allButtonsPass = true;
    for (const btn of result.buttons) {
      const issues = [];
      if (btn.overlapLogo) issues.push('OVERLAPS LOGO');
      if (btn.overlapLang) issues.push('OVERLAPS LANG TOGGLE');
      if (btn.clippedLeft) issues.push('CLIPPED LEFT');
      if (btn.clippedRight) issues.push('CLIPPED RIGHT');
      if (issues.length) allButtonsPass = false;
      console.log(`  [${btn.text}] (${btn.width.toFixed(1)}px, [${btn.left.toFixed(1)}, ${btn.right.toFixed(1)}]) ${issues.length ? '❌ ' + issues.join(', ') : '✅ PASS'}`);
    }

    summary.push({
      width,
      status: allButtonsPass && !result.horizontalOverflow && result.diagnosticReportVisible && result.followUpVisible ? 'PASS' : 'FAIL',
      diagnosticReport: result.diagnosticReportText,
      followUp: result.followUpText,
      overflow: result.horizontalOverflow
    });

    await page.close();
  }

  await browser.close();

  console.log('\n================ SUMMARY MATRIX ================');
  console.table(summary);

  const allPassed = summary.every(s => s.status === 'PASS');
  if (!allPassed) {
    console.error('CRITICAL: Some viewport tests failed!');
    process.exit(1);
  } else {
    console.log('ALL 6 VIEWPORT TESTS PASSED WITH 100% SUCCESS!');
  }
}

verifyAll().catch(e => {
  console.error(e);
  process.exit(1);
});
