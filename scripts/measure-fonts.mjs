// Misst einmalig die Zeichenbreiten der Schriften, die die SVGs verwenden, und schreibt sie nach
// scripts/lib/metrics.json. Die SVGs setzen damit textLength, damit Text auf jedem System
// (Segoe UI, Helvetica, Liberation Sans …) gleich breit läuft.
//
// Braucht Playwright mit installiertem Chromium:
//   PLAYWRIGHT_FROM=C:/Projekte/medlab-studio/frontend/package.json node scripts/measure-fonts.mjs

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire(process.env.PLAYWRIGHT_FROM ?? import.meta.url);
const { chromium } = require('playwright');

const chars = [];
for (let c = 32; c < 127; c++) chars.push(String.fromCharCode(c));
chars.push(...'äöüÄÖÜß’‘“”„–—·…→↗←✕•°×éèàç');

const fonts = {
  sans: { family: '"Segoe UI"', weights: [400, 600, 700] },
  mono: { family: '"Cascadia Mono", Consolas', weights: [400, 700] },
};

const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(({ chars, fonts }) => {
  const ctx = document.createElement('canvas').getContext('2d');
  const out = {};
  for (const [key, { family, weights }] of Object.entries(fonts)) {
    out[key] = {};
    for (const w of weights) {
      ctx.font = `${w} 1000px ${family}`;
      const table = {};
      for (const ch of chars) table[ch] = Math.round(ctx.measureText(ch).width);
      out[key][w] = table;
    }
  }
  return out;
}, { chars, fonts });
await browser.close();

writeFileSync(new URL('./lib/metrics.json', import.meta.url), JSON.stringify(result) + '\n');
console.log('metrics.json geschrieben:', Object.keys(result).map((k) => `${k} ${Object.keys(result[k])}`).join(', '));
