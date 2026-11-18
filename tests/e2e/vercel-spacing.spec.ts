import { expect, test, type Page } from '@playwright/test';

async function checkBadgeSpacing(page: Page, width: number) {
  // Check the rendered workspace dimensions before measuring badge spacing.
  await expect.poll(async () => {
    return page.evaluate(() => {
      const workspace = document.querySelector('main > div.max-w-6xl');
      const badge = document.querySelector('[data-testid="vercel-attribution"]');
      if (!workspace || !badge) return Infinity;
      return badge.getBoundingClientRect().top - workspace.getBoundingClientRect().bottom;
    });
  }, { timeout: 15000 }).toBeLessThanOrEqual(40);

  const workspace = await page.locator('main > div.max-w-6xl').boundingBox();
  const badge = await page.getByRole('link', { name: 'Powered by Vercel' }).boundingBox();
  const footer = await page.locator('footer').boundingBox();
  expect(workspace).not.toBeNull();
  expect(badge).not.toBeNull();
  expect(footer).not.toBeNull();

  const above = badge!.y - (workspace!.y + workspace!.height);
  const below = footer!.y - (badge!.y + badge!.height);
  expect(above, 'space between workspace and badge').toBeGreaterThanOrEqual(24);
  expect(above, 'space between workspace and badge').toBeLessThanOrEqual(40);
  expect(below, 'space between badge and footer').toBeGreaterThanOrEqual(32);
  expect(below, 'space between badge and footer').toBeLessThanOrEqual(48);
  expect(Math.abs(badge!.x + badge!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
  await expect(page.locator('main').getByRole('link', { name: 'Powered by Vercel' })).toBeVisible();
  await expect(page.locator('footer').getByRole('link', { name: 'Powered by Vercel' })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  )).toBeLessThanOrEqual(1);
  return badge!.y;
}

for (const { width, height } of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 375, height: 812 },
]) {
  test(`Vercel badge follows workspace at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?lang=en');

    const initialY = await checkBadgeSpacing(page, width);
    await page.screenshot({ path: `evidence/vercel-spacing-${width}-editor.png`, fullPage: true });

    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Close settings' })).toBeVisible();
    expect(await checkBadgeSpacing(page, width)).toBeGreaterThan(initialY);
    await page.screenshot({ path: `evidence/vercel-spacing-${width}-settings.png`, fullPage: true });

    await page.getByRole('button', { name: 'Templates', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Prompt Templates' })).toBeVisible();
    await checkBadgeSpacing(page, width);

    await page.getByRole('button', { name: 'History', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Recent History', exact: true })).toBeVisible();
    await checkBadgeSpacing(page, width);

    await page.getByRole('button', { name: 'History', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your Long Prompt' }).fill(
      'Please organize this prompt into readable chunks. '.repeat(40)
    );
    await page.getByRole('button', { name: /Split Prompt/ }).first().click();
    await expect(page.getByText('Split Complete!')).toBeVisible();
    expect(await checkBadgeSpacing(page, width)).toBeGreaterThan(initialY);
    await page.screenshot({ path: `evidence/vercel-spacing-${width}-results.png`, fullPage: true });
  });
}
