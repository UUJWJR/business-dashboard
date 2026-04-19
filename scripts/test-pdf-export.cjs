const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/home');

  await page.goto('http://localhost:5173/sales-revenue/overview');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'test-page.png', fullPage: true });

  console.log('Clicking export button...');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120000 }),
    page.click('button:has-text("导出PDF")'),
  ]);

  await download.saveAs('/Users/jrjw.h/Documents/Dev/Code/business-dashboard/test-export.pdf');
  console.log('PDF saved to test-export.pdf');

  await browser.close();
})();
