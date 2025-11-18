import puppeteer from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'docs', 'screenshots');
const BASE_URL = 'http://localhost:5000';

interface Screenshot {
  name: string;
  url: string;
  waitFor?: string;
  description: string;
}

const screenshots: Screenshot[] = [
  // Guest Portal
  {
    name: 'guest-portal-network-status.png',
    url: '/guest',
    waitFor: '[data-testid="card-alert"]',
    description: 'Guest Portal - Network Status'
  },
  {
    name: 'guest-portal-report-issue.png',
    url: '/guest/report',
    waitFor: 'form',
    description: 'Guest Portal - Report Issue Form'
  },
  {
    name: 'guest-portal-my-issues.png',
    url: '/guest/my-issues',
    waitFor: '[data-testid="incident-list"]',
    description: 'Guest Portal - My Issues Dashboard'
  },
  
  // Hotel Manager Dashboard
  {
    name: 'manager-dashboard-overview.png',
    url: '/manager',
    waitFor: '[data-testid="metrics-summary"]',
    description: 'Hotel Manager Dashboard - Overview'
  },
  {
    name: 'manager-incident-queue.png',
    url: '/manager/incidents',
    waitFor: '[data-testid="incident-list"]',
    description: 'Hotel Manager - Incident Queue'
  },
  {
    name: 'manager-analytics.png',
    url: '/manager/analytics',
    waitFor: 'canvas',
    description: 'Hotel Manager - Analytics View'
  },
  
  // Regional Manager Dashboard
  {
    name: 'regional-manager-overview.png',
    url: '/regional-manager',
    waitFor: '[data-testid="property-card"]',
    description: 'Regional Manager - Multi-Property Overview'
  },
  
  // Admin Center
  {
    name: 'admin-organizations.png',
    url: '/admin/organizations',
    waitFor: '[data-testid="organization-card"]',
    description: 'Admin Center - Organizations'
  },
  {
    name: 'admin-users.png',
    url: '/admin/users',
    waitFor: '[data-testid="user-table"]',
    description: 'Admin Center - User Management'
  },
  
  // Technician App
  {
    name: 'technician-work-queue.png',
    url: '/technician',
    waitFor: '[data-testid="incident-card"]',
    description: 'Technician App - Work Queue'
  },
  
  // Simulator
  {
    name: 'simulator-interface.png',
    url: '/simulator',
    waitFor: 'form',
    description: 'Event Simulator'
  }
];

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    for (const screenshot of screenshots) {
      console.log(`Capturing: ${screenshot.description}...`);
      
      try {
        await page.goto(`${BASE_URL}${screenshot.url}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 8000 
        });
        
        // Wait for page to render
        await page.waitForTimeout(2000);
        
        const screenshotPath = path.join(SCREENSHOT_DIR, screenshot.name);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false 
        });
        
        console.log(`✓ Saved: ${screenshot.name}`);
      } catch (error) {
        console.error(`✗ Failed to capture ${screenshot.name}:`, error.message);
      }
    }
  } finally {
    await browser.close();
    console.log('Done!');
  }
}

captureScreenshots().catch(console.error);
