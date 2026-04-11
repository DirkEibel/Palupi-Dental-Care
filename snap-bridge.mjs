import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));

// Trigger AOS
await page.evaluate(async () => {
  await new Promise(res => {
    let pos = 0;
    const go = () => { pos += 500; window.scrollTo(0, pos); if (pos < document.body.scrollHeight) setTimeout(go, 80); else setTimeout(res, 300); };
    go();
  });
});
await new Promise(r => setTimeout(r, 600));

// Scroll to results section bridge area
await page.evaluate(() => {
  const el = document.getElementById('results');
  if (el) window.scrollTo(0, el.offsetTop + el.offsetHeight - 700);
});
await new Promise(r => setTimeout(r, 500));
const sy = await page.evaluate(() => window.scrollY);
await page.screenshot({ path: 'temporary screenshots/results-bridge.png', clip: { x: 0, y: sy, width: 1440, height: 900 } });

// Also full page
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: 'temporary screenshots/full-final.png', fullPage: true });

await browser.close();
console.log('done');
