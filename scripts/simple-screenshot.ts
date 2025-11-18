import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'docs', 'screenshots');

async function captureOne(url: string, filename: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log(`Navigating to ${url}...`);
    await page.goto(`http://localhost:5000${url}`, { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // Extra wait for rendering
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const screenshotPath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false 
    });
    
    console.log(`✓ Screenshot saved: ${filename}`);
  } finally {
    await browser.close();
  }
}

// Get URL and filename from command line
const url = process.argv[2] || '/manager';
const filename = process.argv[3] || 'screenshot.png';

captureOne(url, filename).catch(console.error);
