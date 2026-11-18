import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.goto(pathToFileURL(resolve('scripts/og-card.html')).href);
  await page.locator('.brand img').evaluate(async img => { if (!img.complete) await new Promise(resolve => img.addEventListener('load', resolve, { once: true })); });
  await page.screenshot({path:'public/og-image.png',animations:'disabled'});
} finally { await browser.close(); }
