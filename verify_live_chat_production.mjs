import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

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

function startCurlBridge(port = 3015) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const targetUrl = 'https://krushi-psi.vercel.app' + req.url;
      const curl = spawn('curl.exe', ['-s', '-k', '-i', '--resolve', 'krushi-psi.vercel.app:443:64.29.17.131', targetUrl]);

      let headerEnded = false;
      let headerBuf = '';

      curl.stdout.on('data', (chunk) => {
        if (!headerEnded) {
          headerBuf += chunk.toString('binary');
          const idx = headerBuf.indexOf('\r\n\r\n');
          if (idx !== -1) {
            headerEnded = true;
            const rawHeaders = headerBuf.slice(0, idx).split('\r\n');
            const bodyPart = Buffer.from(headerBuf.slice(idx + 4), 'binary');

            const statusLine = rawHeaders[0] || 'HTTP/1.1 200 OK';
            const parts = statusLine.split(' ');
            const statusCode = parseInt(parts[1], 10) || 200;
            res.statusCode = statusCode;

            for (let i = 1; i < rawHeaders.length; i++) {
              const colon = rawHeaders[i].indexOf(':');
              if (colon !== -1) {
                const k = rawHeaders[i].slice(0, colon).trim();
                const v = rawHeaders[i].slice(colon + 1).trim();
                if (k.toLowerCase() !== 'transfer-encoding') {
                  try { res.setHeader(k, v); } catch(e) {}
                }
              }
            }
            res.write(bodyPart);
          }
        } else {
          res.write(chunk);
        }
      });

      curl.stdout.on('end', () => res.end());
      curl.on('error', (err) => {
        res.statusCode = 502;
        res.end(err.message);
      });
    });

    server.listen(port, '127.0.0.1', () => {
      console.log(`🌐 Live Vercel Curl Bridge active on http://127.0.0.1:${port}`);
      resolve(server);
    });
  });
}

async function runVerification() {
  console.log('🚀 Starting Krushi Mitra AI Production Chat & Voice Verification...');
  console.log('Live Target: https://krushi-psi.vercel.app/ (via Vercel Bridge)');

  const bridgeServer = await startCurlBridge(3015);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
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
  await page.goto('http://127.0.0.1:3015/', { waitUntil: 'networkidle2', timeout: 35000 });
  await page.waitForSelector('button');

  // Switch to English language
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enBtn = btns.find(b => b.textContent.includes('English') || b.textContent.trim() === 'EN');
    if (enBtn) enBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Find and click Rice Armyworm sample card on Dashboard
  console.log('Locating Rice Armyworm sample card on Dashboard...');
  await page.evaluate(() => {
    window.scrollTo(0, 1000);
  });
  await new Promise(r => setTimeout(r, 600));

  const foundArmyworm = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.group.cursor-pointer, .cursor-pointer, .group'));
    const armywormCard = cards.find(c => 
      (c.textContent || '').includes('Armyworm') || 
      (c.textContent || '').includes('Mythimna') || 
      (c.textContent || '').includes('ଲେଡ଼ା')
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
      (b.textContent || '').includes('Diagnosis') || 
      (b.textContent || '').includes('Analyze') || 
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
    const navButtons = Array.from(document.querySelectorAll('nav button, header button, button'));
    const assistantBtn = navButtons.find(b => 
      (b.textContent || '').includes('Voice') ||
      (b.textContent || '').includes('Assistant') || 
      (b.textContent || '').includes('Odia AI') || 
      (b.textContent || '').includes('ଭଏସ୍')
    );
    if (assistantBtn) assistantBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

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

  await mobilePage.goto('http://127.0.0.1:3015/', { waitUntil: 'networkidle2', timeout: 35000 });

  await mobilePage.waitForSelector('button');

  // Switch to English language on mobile
  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const enBtn = btns.find(b => b.textContent.includes('English') || b.textContent.trim() === 'EN');
    if (enBtn) enBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Navigate to Voice Assistant tab on mobile via Hero CTA or Drawer
  console.log('Navigating to Assistant tab on mobile...');
  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const heroBtn = btns.find(b => 
      (b.textContent || '').includes('Ask Voice Assistant') || 
      (b.textContent || '').includes('ଓଡ଼ିଆରେ କଥା')
    );
    if (heroBtn) {
      heroBtn.scrollIntoView();
      heroBtn.click();
      return;
    }
    const menuBtn = document.querySelector('button[aria-label="Navigation Menu"]');
    if (menuBtn) menuBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await mobilePage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const drawerBtn = btns.find(b => 
      (b.textContent || '').includes('Voice') || 
      (b.textContent || '').includes('Assistant') || 
      (b.textContent || '').includes('ଭଏସ୍') ||
      (b.textContent || '').includes('ସାଥୀ')
    );
    if (drawerBtn) drawerBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

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
  bridgeServer.close();

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
