import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureIncidentPanel() {
  console.log('🚀 Capturing Hotel Manager Incident Detail Panel...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to hotel manager
    await page.goto('http://localhost:5000/hotel-manager', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Wait for incidents to load
    await page.waitForSelector('[data-testid^="button-view-"]', { timeout: 15000 });
    
    // Click the first incident's view button
    await page.click('[data-testid^="button-view-"]');
    
    // Wait for detail panel to open
    await page.waitForSelector('[data-testid="incident-detail-panel"]', { timeout: 5000 });
    
    // Wait a bit for animations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot
    const screenshotPath = join(__dirname, '..', 'public', 'docs', 'screenshots', 'manager-incident-detail-panel.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false
    });

    console.log('  ✓ Saved: manager-incident-detail-panel.png');

  } catch (error) {
    console.error('  ✗ Failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureIncidentPanel().catch(console.error);
