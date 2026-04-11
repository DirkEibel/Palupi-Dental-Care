import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Auto-increment filename
let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));

// Scroll through page to trigger AOS animations, then scroll back to top
await page.evaluate(async () => {
  await new Promise(resolve => {
    let pos = 0;
    const step = 500;
    const delay = 60;
    const scroll = () => {
      pos += step;
      window.scrollTo(0, pos);
      if (pos < document.body.scrollHeight) setTimeout(scroll, delay);
      else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
    };
    scroll();
  });
});
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outPath, fullPage: true });

await browser.close();
console.log(`Saved: ${outPath}`);
