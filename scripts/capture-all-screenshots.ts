import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'docs', 'screenshots');
const BASE_URL = 'http://localhost:5000';

interface ScreenshotTask {
  filename: string;
  url: string;
  description: string;
  role?: 'admin' | 'manager' | 'regional' | 'technician' | 'guest';
  waitForSelector?: string;
}

const screenshots: ScreenshotTask[] = [
  // Guest Portal (no auth needed)
  {
    filename: 'guest-portal-network-status.png',
    url: '/guest',
    description: 'Guest Portal - Network Status',
    role: 'guest'
  },
  {
    filename: 'guest-portal-report-issue.png',
    url: '/guest/report',
    description: 'Guest Portal - Report Issue Form',
    role: 'guest'
  },
  {
    filename: 'guest-portal-my-issues.png',
    url: '/guest/my-issues',
    description: 'Guest Portal - My Issues Dashboard',
    role: 'guest'
  },
  
  // Hotel Manager Dashboard
  {
    filename: 'manager-dashboard-overview.png',
    url: '/manager',
    description: 'Hotel Manager Dashboard - Overview',
    role: 'manager'
  },
  {
    filename: 'manager-incident-queue.png',
    url: '/manager/incidents',
    description: 'Hotel Manager - Incident Queue',
    role: 'manager'
  },
  {
    filename: 'manager-analytics.png',
    url: '/manager/analytics',
    description: 'Hotel Manager - Analytics View',
    role: 'manager'
  },
  
  // Regional Manager Dashboard
  {
    filename: 'regional-manager-overview.png',
    url: '/regional-manager',
    description: 'Regional Manager - Multi-Property Overview',
    role: 'regional'
  },
  {
    filename: 'regional-manager-incidents.png',
    url: '/regional-manager/incidents',
    description: 'Regional Manager - Incident Queue',
    role: 'regional'
  },
  
  // Admin Center
  {
    filename: 'admin-dashboard.png',
    url: '/admin',
    description: 'Admin Center - Dashboard',
    role: 'admin'
  },
  {
    filename: 'admin-organizations.png',
    url: '/admin/organizations',
    description: 'Admin Center - Organizations',
    role: 'admin'
  },
  {
    filename: 'admin-users.png',
    url: '/admin/users',
    description: 'Admin Center - User Management',
    role: 'admin'
  },
  
  // Technician App
  {
    filename: 'technician-work-queue.png',
    url: '/technician',
    description: 'Technician App - Work Queue',
    role: 'technician'
  },
  
  // Simulator (no auth needed)
  {
    filename: 'simulator-interface.png',
    url: '/simulator',
    description: 'Event Simulator',
    role: 'guest'
  }
];

const credentials = {
  admin: { username: 'thabo.malema', password: 'demo123' },
  manager: { username: 'pieter.dutoit', password: 'demo123' },
  regional: { username: 'zanele.khumalo', password: 'demo123' },
  technician: { username: 'lerato.botha', password: 'demo123' }
};

async function login(page: Page, role: 'admin' | 'manager' | 'regional' | 'technician') {
  const creds = credentials[role];
  console.log(`  Logging in as ${role} (${creds.username})...`);
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('input[name="username"]', { timeout: 5000 });
  
  await page.type('input[name="username"]', creds.username);
  await page.type('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
  console.log(`  ✓ Logged in as ${role}`);
}

async function captureScreenshot(browser: Browser, task: ScreenshotTask, page?: Page) {
  const shouldClosePage = !page;
  if (!page) {
    page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
  }
  
  try {
    console.log(`Capturing: ${task.description}...`);
    
    await page.goto(`${BASE_URL}${task.url}`, { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (task.waitForSelector) {
      await page.waitForSelector(task.waitForSelector, { timeout: 5000 }).catch(() => {
        console.log(`  ⚠ Selector ${task.waitForSelector} not found, continuing anyway`);
      });
    }
    
    const screenshotPath = path.join(SCREENSHOT_DIR, task.filename);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false 
    });
    
    console.log(`  ✓ Saved: ${task.filename}`);
    return true;
  } catch (error: any) {
    console.error(`  ✗ Failed: ${error.message}`);
    return false;
  } finally {
    if (shouldClosePage && page) {
      await page.close();
    }
  }
}

async function captureAllScreenshots() {
  console.log('🚀 Starting screenshot capture process...\n');
  
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
    let successCount = 0;
    let failCount = 0;
    
    // Group screenshots by role
    const roleGroups = {
      guest: screenshots.filter(s => s.role === 'guest'),
      admin: screenshots.filter(s => s.role === 'admin'),
      manager: screenshots.filter(s => s.role === 'manager'),
      regional: screenshots.filter(s => s.role === 'regional'),
      technician: screenshots.filter(s => s.role === 'technician')
    };
    
    // Capture guest screenshots (no auth needed)
    if (roleGroups.guest.length > 0) {
      console.log('\n📱 Capturing Guest Portal screenshots...');
      for (const task of roleGroups.guest) {
        const success = await captureScreenshot(browser, task);
        if (success) successCount++;
        else failCount++;
      }
    }
    
    // Capture authenticated screenshots for each role
    for (const [role, tasks] of Object.entries(roleGroups)) {
      if (role === 'guest' || tasks.length === 0) continue;
      
      console.log(`\n👤 Capturing ${role} screenshots...`);
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      
      try {
        await login(page, role as any);
        
        for (const task of tasks) {
          const success = await captureScreenshot(browser, task, page);
          if (success) successCount++;
          else failCount++;
        }
      } catch (error: any) {
        console.error(`  ✗ Failed to login as ${role}: ${error.message}`);
        failCount += tasks.length;
      } finally {
        await page.close();
      }
    }
    
    console.log(`\n✅ Screenshot capture complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    
  } finally {
    await browser.close();
  }
}

captureAllScreenshots().catch(console.error);
