import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOT_DIR = './CHAT_FIX_VERIFICATION_SCREENSHOTS';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TEST_MESSAGES = [
  'HII',
  'Hello',
  'ନମସ୍କାର',
  'Thanks',
  'Why is this pest attacking my paddy?',
  'How can I control it without chemicals?',
  'What is the correct chemical dosage?',
  'What is the weather today?',
  'Explain the pest life cycle.'
];

async function runVerification() {
  console.log('🚀 Starting Krushi Mitra AI Production Chat & Voice Verification...');
  console.log('Live Target: https://krushi-psi.vercel.app/');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--disable-web-security'
    ]
  });

  const networkTraffic = [];

  // ================= 1. DESKTOP RUN (1280px) =================
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/v1/')) {
      networkTraffic.push({
        event: 'REQUEST',
        method: req.method(),
        url: url,
        postData: req.postData()
      });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/v1/')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {
        body = '[binary]';
      }
      networkTraffic.push({
        event: 'RESPONSE',
        status: res.status(),
        url: url,
        bodyPreview: body.slice(0, 200)
      });
    }
  });

  console.log('Navigating to live production site...');
  let navSuccess = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto('https://krushi-psi.vercel.app/', { waitUntil: 'networkidle2', timeout: 35000 });
      navSuccess = true;
      break;
    } catch (err) {
      console.warn(`Nav attempt ${attempt} failed: ${err.message}. Retrying in 2s...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  if (!navSuccess) throw new Error('Failed to load production site');

  // Switch to English language
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enBtn = btns.find(b => b.textContent.includes('English') || b.textContent.trim() === 'EN');
    if (enBtn) enBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Find and click Rice Armyworm sample card on Dashboard
  console.log('Locating Rice Armyworm sample card on Dashboard...');
  const foundArmyworm = await page.evaluate(() => {
    // Scroll down to specimen grid
    window.scrollTo(0, 500);
    const cards = Array.from(document.querySelectorAll('.cursor-pointer, .group'));
    const armywormCard = cards.find(c => 
      (c.textContent || '').includes('Armyworm') || 
      (c.textContent || '').includes('ଲେଡ଼ା ପୋକ') || 
      (c.textContent || '').includes('ଧାନ ଲେଡ଼ା')
    );
    if (armywormCard) {
      armywormCard.scrollIntoView();
      armywormCard.click();
      return true;
    }
    return false;
  });
  console.log('Armyworm card selected:', foundArmyworm);
  await new Promise(r => setTimeout(r, 1500));

  // If in scanner, click analyze button to generate activeReport
  console.log('Scanning Rice Armyworm specimen to establish activeReport state...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const analyzeBtn = buttons.find(b => 
      (b.textContent || '').includes('Run AI Pest Diagnosis') ||
      (b.textContent || '').includes('Analyze') || 
      (b.textContent || '').includes('Scan') || 
      (b.textContent || '').includes('ବିଶ୍ଳେଷଣ')
    );
    if (analyzeBtn) {
      analyzeBtn.scrollIntoView();
      analyzeBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 3500));

  // Navigate to Voice Assistant tab
  console.log('Navigating to Assistant tab...');
  await page.evaluate(() => {
    const navButtons = Array.from(document.querySelectorAll('nav button, header button'));
    const assistantBtn = navButtons.find(b => 
      (b.textContent || '').includes('Voice') ||
      (b.textContent || '').includes('Assistant') || 
      (b.textContent || '').includes('Odia AI') || 
      (b.textContent || '').includes('ଭଏସ୍')
    );
    if (assistantBtn) assistantBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify chat banner context
  const activePestBanner = await page.evaluate(() => {
    const banner = document.querySelector('.bg-gradient-to-r');
    return banner ? (banner.textContent || '').replace(/\s+/g, ' ').trim() : '';
  });
  console.log('Active Pest Banner:', activePestBanner);

  const transcript = [];

  // Submit test messages one by one
  for (const text of TEST_MESSAGES) {
    console.log(`\n💬 Testing Query: "${text}" ...`);

    // Focus input, clear, and type query
    const inputSelector = 'input[type="text"]';
    await page.waitForSelector(inputSelector);
    await page.click(inputSelector);

    // Clear existing text
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.value = '';
    }, inputSelector);

    // Type text with slight delay to trigger React synthetic events
    await page.type(inputSelector, text, { delay: 25 });
    await new Promise(r => setTimeout(r, 150));

    // Submit by pressing Enter
    await page.keyboard.press('Enter');

    // Wait for response bubble
    await new Promise(r => setTimeout(r, 3000));

    // Extract the latest assistant response bubble text
    const responseData = await page.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.rounded-2xl.p-4'));
      if (bubbles.length < 2) return { reply: '', pills: [] };
      const latestBubble = bubbles[bubbles.length - 1];
      const p = latestBubble.querySelector('p');
      const text = p ? (p.textContent || '').trim() : (latestBubble.textContent || '').trim();

      // Look for action pills container
      const pillButtons = Array.from(document.querySelectorAll('button')).filter(b => 
        (b.className || '').includes('rounded-full') && ((b.textContent || '').includes('?') || (b.textContent || '').includes('control') || (b.textContent || '').includes('କାହିଁକି') || (b.textContent || '').includes('ଔଷଧ'))
      );
      const pills = pillButtons.map(b => (b.textContent || '').trim());

      return { reply: text, pills };
    });

    console.log(`Assistant Reply: "${responseData.reply}"`);
    transcript.push({
      query: text,
      reply: responseData.reply,
      pills: responseData.pills
    });
  }

  // Test Listen Button
  console.log('\n🔊 Testing "Listen" button click...');
  const listenClick = await page.evaluate(() => {
    const listenButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.title?.includes('Listen') || (b.textContent || '').includes('Listen') || (b.textContent || '').includes('ଶୁଣନ୍ତୁ')
    );
    if (listenButtons.length > 0) {
      const last = listenButtons[listenButtons.length - 1];
      last.click();
      return { clicked: true, title: last.title, text: (last.textContent || '').trim() };
    }
    return { clicked: false };
  });
  console.log('Listen Button Clicked:', listenClick);

  await new Promise(r => setTimeout(r, 1500));

  const audioStateIndicator = await page.evaluate(() => {
    const pills = Array.from(document.querySelectorAll('.text-amber-600, .text-agri-700, .text-rose-600, .text-slate-500'));
    return pills.map(p => (p.textContent || '').trim()).filter(Boolean);
  });
  console.log('Audio State Indicators visible on UI:', audioStateIndicator);

  // Take Desktop Screenshot
  const desktopScreenshot = path.join(SCREENSHOT_DIR, 'production_chat_desktop_1280px.png');
  await page.screenshot({ path: desktopScreenshot, fullPage: true });
  console.log(`📸 Saved Desktop Screenshot: ${desktopScreenshot}`);

  // ================= 2. MOBILE RUN (390px) =================
  console.log('\n📱 Testing Mobile Viewport (390px)...');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await mobilePage.goto('https://krushi-psi.vercel.app/', { waitUntil: 'networkidle2', timeout: 35000 });
      break;
    } catch (err) {
      console.warn(`Mobile attempt ${attempt} failed. Retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Navigate to Voice Assistant tab on mobile
  await mobilePage.evaluate(() => {
    // Check if there is an assistant button on dashboard or open hamburger menu
    const menuBtn = document.querySelector('button[aria-label="Navigation Menu"]');
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await mobilePage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aiBtn = buttons.find(b => 
      (b.textContent || '').includes('Voice') || 
      (b.textContent || '').includes('Assistant') || 
      (b.textContent || '').includes('Odia AI') || 
      (b.textContent || '').includes('ଭଏସ୍') || 
      (b.textContent || '').includes('ସହାୟକ')
    );
    if (aiBtn) aiBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Type HII on mobile
  await mobilePage.waitForSelector('input[type="text"]');
  await mobilePage.click('input[type="text"]');
  await mobilePage.type('input[type="text"]', 'HII', { delay: 30 });
  await mobilePage.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2500));

  const mobileScreenshot = path.join(SCREENSHOT_DIR, 'production_chat_mobile_390px.png');
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: true });
  console.log(`📸 Saved Mobile Screenshot: ${mobileScreenshot}`);

  await browser.close();

  // Save evidence report
  const evidence = {
    releaseVerificationTimestamp: new Date().toISOString(),
    liveProductionUrl: 'https://krushi-psi.vercel.app/',
    liveRailwayApiUrl: 'https://krushi-mitra-ai-production.up.railway.app/',
    activePestBanner,
    transcript,
    audioStateIndicator,
    networkTraffic
  };

  fs.writeFileSync('./LIVE_PRODUCTION_CHAT_EVIDENCE.json', JSON.stringify(evidence, null, 2));
  console.log('🎉 Production Chat & Voice Verification completed successfully!');
}

runVerification().catch(err => {
  console.error('❌ Verification run failed:', err);
  process.exit(1);
});
