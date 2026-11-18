import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const prompt = 'Tiếng Việt 👩🏽‍💻\r\n\r\n' + ('Code ```js``` 🎯 with JSON {"a":1} and tabs\t. ').repeat(40);

test('editor/settings/preview/split/download/templates/history/batch are functional', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({ path: 'evidence/desktop-dark.png', fullPage: true });

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.screenshot({ path: 'evidence/settings-dark.png', fullPage: true });
  const budget = page.getByRole('spinbutton');
  await budget.fill('');
  await budget.fill('100');
  await budget.blur();
  await expect(budget).toHaveValue('100');
  await page.getByRole('button', { name: 'Close settings' }).click();

  await page.getByRole('textbox', { name: 'Your Long Prompt' }).fill(prompt);
  await page.getByRole('button', { name: /Preview/ }).click();
  await expect(page.getByText('Split Preview')).toBeVisible();
  await page.getByRole('button', { name: /Split Prompt/ }).first().click();
  await expect(page.getByText('Split Complete!')).toBeVisible();
  await page.screenshot({ path: 'evidence/results-dark.png', fullPage: true });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON JSON' }).click();
  const download = await downloadPromise;
  const savedPath = await download.path();
  expect(savedPath).toBeTruthy();
  const exported = JSON.parse(await readFile(savedPath!, 'utf8'));
  // Textareas normalize pasted CRLF line breaks to LF before exporting.
  expect(exported.parts.map((p: { content: string }) => p.content).join('')).toBe(prompt.replace(/\r\n/g, '\n'));
  expect(exported.metadata.maxTokens).toBe(100);

  await page.getByRole('button', { name: /Save to History/ }).click();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByText('History', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'evidence/history-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Close' }).first().click().catch(async () => {
    await page.locator('[aria-label="Close history"]').click();
  });

  await page.getByRole('button', { name: 'Templates' }).click();
  await page.screenshot({ path: 'evidence/templates-dark.png', fullPage: true });
  const templateBtn = page.locator('button.group').first();
  await expect(templateBtn).toBeVisible();
  await templateBtn.click();
  await expect(page.getByRole('textbox', { name: 'Your Long Prompt' })).not.toHaveValue(prompt);

  await page.getByRole('button', { name: 'Batch' }).click();
  const dialog = page.getByRole('dialog', { name: /Batch/ });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: 'evidence/batch-dark.png', fullPage: true });
  await dialog.locator('input[type=file]').setInputFiles([
    { name: 'one.txt', mimeType: 'text/plain', buffer: Buffer.from(prompt, 'utf8') },
    { name: 'two.md', mimeType: 'text/markdown', buffer: Buffer.from('hello\r\nworld', 'utf8') },
    { name: 'bad.bin', mimeType: 'application/octet-stream', buffer: Buffer.from([0xff, 0x00]) },
  ]);
  await expect(dialog.getByText('Processed Files (2)')).toBeVisible();
  await expect(dialog.getByRole('alert')).toContainText('bad.bin');
  const batchDownload = page.waitForEvent('download');
  await dialog.getByRole('button', { name: /Download All JSON/ }).click();
  const batch = JSON.parse(await readFile(await (await batchDownload).path(), 'utf8'));
  expect(batch.files).toHaveLength(2);
  expect(batch.files[0].parts.join('')).toBe(prompt);
  expect(batch.files[1].parts.join('')).toBe('hello\r\nworld');
  await dialog.getByRole('button', { name: 'Clear batch' }).click();
  await expect(dialog.getByText('Processed Files (2)')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close batch' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('spinbutton')).toHaveValue('100');
  await page.getByRole('button', { name: 'Reset to defaults' }).click();
  await expect(page.getByRole('spinbutton')).toHaveValue('3000');
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByText('History', { exact: true })).toBeVisible();
});

test('responsive widths and themes have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/');
    await page.getByRole('button', { name: 'English' }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    if ([320, 375, 430, 1440].includes(width)) {
      await page.screenshot({ path: `evidence/responsive-${width}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.getByRole('button', { name: 'Close settings' }).click();
  }
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.screenshot({ path: 'evidence/desktop-light.png', fullPage: true });
  await expect(page.locator('html')).toHaveClass(/light/);
});

test('Vercel attribution stays centered above footer and button layout is consistent', async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?lang=en');

    const badge = page.getByRole('link', { name: 'Powered by Vercel' });
    await expect(page.locator('main').getByRole('link', { name: 'Powered by Vercel' })).toBeVisible();
    await expect(page.locator('footer').getByRole('link', { name: 'Powered by Vercel' })).toHaveCount(0);

    const badgeBox = await badge.boundingBox();
    const footerBox = await page.locator('footer').last().boundingBox();
    const imageBox = await badge.locator('img').boundingBox();
    expect(badgeBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(imageBox).not.toBeNull();
    expect(Math.abs(badgeBox!.x + badgeBox!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(badgeBox!.y + badgeBox!.height).toBeLessThan(footerBox!.y);
    expect(imageBox!.width).toBeGreaterThanOrEqual(135);
    expect(imageBox!.width).toBeLessThanOrEqual(155);
    expect(await badge.evaluate(el => getComputedStyle(el).position)).not.toMatch(/absolute|fixed/);

    const nav = await page.locator('[data-testid="tool-navigation"] > button').evaluateAll(buttons =>
      buttons.map(el => { const { x, y, width, height } = el.getBoundingClientRect(); return { x, y, width, height }; })
    );
    expect(nav).toHaveLength(5);
    const rowGroups = new Map<number, typeof nav>();
    nav.forEach(button => {
      const row = Math.round(button.y);
      rowGroups.set(row, [...(rowGroups.get(row) || []), button]);
    });
    for (const buttons of rowGroups.values()) {
      expect(Math.max(...buttons.map(b => b.width)) - Math.min(...buttons.map(b => b.width))).toBeLessThanOrEqual(1);
    }
    expect(Math.max(...nav.map(b => b.height)) - Math.min(...nav.map(b => b.height))).toBeLessThanOrEqual(1);
    for (const button of nav) expect(button.height).toBeGreaterThanOrEqual(39);

    const actionHeights = await Promise.all([
      page.getByRole('button', { name: /Split Prompt/ }).first(),
      page.getByRole('button', { name: /Preview Split/ }),
    ].map(async button => (await button.boundingBox())!.height));
    expect(Math.abs(actionHeights[0] - actionHeights[1])).toBeLessThanOrEqual(1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `evidence/polish-${width}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 375, height: 850 });
  await page.goto('/?lang=en');
  await page.getByRole('button', { name: 'Templates' }).click();
  await expect(page.getByRole('heading', { name: 'Prompt Templates' })).toBeVisible();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Prompt Templates' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Close settings' })).toBeVisible();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close settings' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Recent History', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Recent History', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('main').getByRole('link', { name: 'Powered by Vercel' })).toBeVisible();
  await page.screenshot({ path: 'evidence/polish-mobile-dark.png', fullPage: true });
});

test('manifest/icons and SPA routes are accessible', async ({ page, request }) => {
  for (const resource of ['/favicon.ico', '/favicon-16.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/og-image.png', '/manifest.json']) {
    const response = await request.get(resource);
    expect(response.ok(), resource).toBe(true);
  }
  await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('Privacy Policy');
  await page.goto('/terms', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('Terms of Service');
});

test('rebrand, metadata, Ko-fi and Vercel badge render with an API-provided visit count', async ({ page, request }) => {
  let requests = 0;
  await page.route('**/api/visits', async (route) => {
    requests += 1;
    expect(route.request().method()).toBe('POST');
    expect(JSON.parse(route.request().postData() || '{}').sessionId).toMatch(/^[0-9a-f-]{36}$/);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 1234 }) });
  });
  await page.goto('/?lang=en');
  await expect(page).toHaveTitle(/CutPrompts.*AI Prompt Splitter/);
  await expect(page.locator('header')).toContainText('CutPrompts');
  await expect(page.locator('footer')).toContainText('lohux.dev');
  await expect(page.locator('footer')).toContainText('Visit count: 1,234');
  await expect(page.getByRole('link', { name: 'Support me on Ko-fi' })).toHaveAttribute('href', 'https://ko-fi.com/lohux');
  await expect(page.getByRole('link', { name: 'Powered by Vercel' })).toHaveAttribute('href', 'https://vercel.com');
  expect((await request.get('/static/powered-by-vercel.svg')).ok()).toBe(true);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'CutPrompts');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og-image\.png$/);
  await page.reload();
  await expect(page.locator('footer')).toContainText('Visit count: 1,234');
  await page.getByRole('button', { name: 'Tiếng Việt' }).click();
  await expect(page.locator('footer')).toContainText('Lượt truy cập: 1.234');
  expect(requests).toBeGreaterThanOrEqual(1);
});

test('unavailable counter has no fabricated number and Vietnamese locale works', async ({ page }) => {
  await page.route('**/api/visits', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'unavailable' }) }));
  await page.goto('/?lang=vi');
  await expect(page.locator('header')).toContainText('CutPrompts');
  await expect(page.getByRole('link', { name: 'Ủng hộ qua Ko-fi' })).toHaveAttribute('href', 'https://ko-fi.com/lohux');
  await expect(page.locator('footer')).toContainText('chưa khả dụng');
  await expect(page.locator('footer')).not.toContainText('Visit count: 0');
});
