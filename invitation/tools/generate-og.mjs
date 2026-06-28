/**
 * generate-og.mjs — renders the WhatsApp/OpenGraph share image (1200×630) on
 * brand: an ivory card with a gold frame on emerald velvet. Run after fonts
 * exist: node tools/generate-og.mjs
 */
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const fontDir = fileURLToPath(new URL('public/fonts/', root));
const outDir = fileURLToPath(new URL('public/og/', root));
mkdirSync(outDir, { recursive: true });

const b64 = (f) => readFileSync(fontDir + f).toString('base64');
const cormorant = b64('cormorant-garamond.woff2');
const pinyon = b64('pinyon-script.woff2');
const ebg = b64('eb-garamond.woff2');

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Cormorant';src:url(data:font/woff2;base64,${cormorant}) format('woff2');font-weight:400 600}
@font-face{font-family:'Pinyon';src:url(data:font/woff2;base64,${pinyon}) format('woff2')}
@font-face{font-family:'EBG';src:url(data:font/woff2;base64,${ebg}) format('woff2')}
*{margin:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
.bg{width:1200px;height:630px;display:grid;place-items:center;
 background:radial-gradient(120% 120% at 50% 0%,#2f5a4e,#23463d 45%,#16322b 100%);font-family:'EBG',serif}
.card{width:1056px;height:486px;background:linear-gradient(180deg,#fbf8f3,#f3ecdd);border-radius:14px;
 box-shadow:0 30px 80px rgba(0,0,0,.45);display:grid;place-items:center;position:relative}
.frame{position:absolute;inset:22px;border:2px solid transparent;border-radius:8px;
 background:linear-gradient(#fbf8f3,#fbf8f3) padding-box,linear-gradient(100deg,#9c7536,#f3e3bd,#b88a42,#e6cf9b) border-box}
.inner{position:relative;text-align:center;color:#4c372e}
.kicker{font-family:'Cormorant';font-weight:600;letter-spacing:.34em;text-transform:uppercase;font-size:26px;color:#b88a42}
.names{font-family:'Pinyon';font-size:148px;line-height:.9;margin:18px 0 6px;
 background:linear-gradient(100deg,#9c7536,#c8a86b 30%,#f3e3bd 50%,#b88a42 70%,#9c7536);
 -webkit-background-clip:text;background-clip:text;color:transparent}
.amp{font-family:'Cormorant';font-size:50px;color:#b88a42;vertical-align:middle;margin:0 14px}
.rule{width:240px;height:1px;background:linear-gradient(90deg,transparent,#c8a86b,transparent);margin:18px auto}
.meta{font-family:'Cormorant';font-weight:600;letter-spacing:.06em;font-size:30px;color:#23463d}
.sub{font-family:'EBG';font-size:22px;color:#6a5247;margin-top:6px}
.mono{position:absolute;top:40px;left:50%;transform:translateX(-50%);font-family:'Cormorant';font-weight:600;font-size:30px;color:#b88a42;letter-spacing:.1em}
</style></head><body>
<div class="bg"><div class="card"><div class="frame"></div>
<div class="inner">
 <div class="kicker">Roka Ceremony</div>
 <div class="names">Prakhar<span class="amp">&amp;</span>Pranjali</div>
 <div class="rule"></div>
 <div class="meta">Friday, 27 November 2026</div>
 <div class="sub">Rooftop, ITC Fortune · Lucknow</div>
</div></div></div></body></html>`;

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 }).then((c) => c.newPage());
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(200);
await page.screenshot({ path: outDir + 'roka-og.png' });
await browser.close();
console.log('wrote', outDir + 'roka-og.png');
