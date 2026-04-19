const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pdfPath = 'file:///Users/jrjw.h/Documents/Dev/Code/business-dashboard/test-export.pdf';

  await page.goto(pdfPath);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'test-pdf-viewer.png', fullPage: true });
  console.log('PDF viewer screenshot saved');

  await browser.close();
})();
