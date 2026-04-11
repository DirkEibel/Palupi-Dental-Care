import puppeteer from 'puppeteer';
import fs from 'fs';

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Scroll full page to trigger AOS
await page.evaluate(async () => {
  await new Promise(res => {
    let pos = 0;
    const go = () => {
      pos += 600;
      window.scrollTo(0, pos);
      if (pos < document.body.scrollHeight) setTimeout(go, 100);
      else setTimeout(res, 500);
    };
    go();
  });
});
await new Promise(r => setTimeout(r, 800));

// Full page
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: dir + '/full-v2.png', fullPage: true });
console.log('Full page saved');

// Section screenshots
const sections = ['about', 'services', 'results', 'testimonials', 'locations'];
for (const id of sections) {
  await page.evaluate((sid) => {
    const el = document.getElementById(sid);
    if (el) el.scrollIntoView({ behavior: 'instant' });
  }, id);
  await new Promise(r => setTimeout(r, 600));
  // Get current scroll Y to clip correctly
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: dir + '/sec-' + id + '.png', clip: { x: 0, y: scrollY, width: 1440, height: 900 } });
  console.log('Section ' + id + ' saved');
}

await browser.close();
console.log('All done');
