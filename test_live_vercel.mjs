import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const VIEWPORTS = [1440, 1366, 1280, 1024, 900, 768];
const LIVE_SCREENSHOT_DIR = './LIVE_DEPLOYMENT_SCREENSHOTS';

if (!fs.existsSync(LIVE_SCREENSHOT_DIR)) {
  fs.mkdirSync(LIVE_SCREENSHOT_DIR, { recursive: true });
}

async function verifyLive() {
  console.log('Connecting to live production URL: https://krushi-psi.vercel.app/ ...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const summary = [];

  for (const width of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 800 });
    
    // Bypass cache to ensure we get the latest deployed assets
    await page.setCacheEnabled(false);
    const response = await page.goto('https://krushi-psi.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });
    const httpStatus = response ? response.status() : 0;

    // Switch to English language
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enBtn = btns.find(b => b.textContent.includes('English') || b.textContent.trim() === 'EN');
      if (enBtn) enBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture screenshot of live production deployment
    const screenshotPath = path.join(LIVE_SCREENSHOT_DIR, `live_nav_${width}px.png`);
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
          return {
            text,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            overlapLogo: logoRect ? (rect.left < logoRect.right && rect.right > logoRect.left && rect.top < logoRect.bottom && rect.bottom > logoRect.top) : false,
            overlapLang: langRect ? (rect.left < langRect.right && rect.right > langRect.left && rect.top < langRect.bottom && rect.bottom > langRect.top) : false,
            clippedLeft: navRect ? rect.left < navRect.left - 1 : false,
            clippedRight: navRect ? rect.right > navRect.right + 1 : false
          };
        });
      }

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

    console.log(`\n================ LIVE PRODUCTION ${width}px (HTTP ${httpStatus}) ================`);
    console.log(`Nav visible: ${result.navVisible}, Horiz Overflow: ${result.horizontalOverflow ? 'FAIL' : 'PASS (0px)'}`);
    console.log(`Diagnostic Report: "${result.diagnosticReportText}" -> ${result.diagnosticReportVisible ? 'PASS (100% visible)' : 'FAIL'}`);
    console.log(`Follow-Up: "${result.followUpText}" -> ${result.followUpVisible ? 'PASS (100% visible)' : 'FAIL'}`);

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

  console.log('\n================ LIVE VERIFICATION SUMMARY ================');
  console.table(summary);

  const allPassed = summary.every(s => s.status === 'PASS');
  if (!allPassed) {
    console.warn('Live deployment may still be propagating on Vercel CDN or failed.');
    process.exit(1);
  } else {
    console.log('LIVE VERCEL PRODUCTION VERIFICATION COMPLETE: 100% PASS!');
  }
}

verifyLive().catch(e => {
  console.error(e);
  process.exit(1);
});
