import { test, expect, type Page } from '@playwright/test';

const panels = ['templates', 'history', 'settings', 'batch', 'shortcuts'] as const;
type PanelId = (typeof panels)[number];
const names: Record<PanelId, string> = {
  templates: 'Templates',
  history: 'History',
  settings: 'Settings',
  batch: 'Batch',
  shortcuts: 'Shortcuts',
};

async function assertExclusive(page: Page, expected: PanelId | null) {
  await expect(page.locator('[data-testid="tool-navigation"] > button[aria-expanded="true"]'))
    .toHaveCount(expected ? 1 : 0);

  for (const panel of panels) {
    const trigger = page.getByRole('button', { name: names[panel], exact: true });
    await expect(trigger).toHaveAttribute('aria-controls', `panel-${panel}`);
    await expect(trigger).toHaveAttribute('aria-expanded', panel === expected ? 'true' : 'false');
    const content = page.locator(`#panel-${panel}`);
    await expect(content).toHaveCount(panel === expected ? 1 : 0);
    if (panel === expected) await expect(content).toBeVisible();
  }
}

for (const width of [1440, 375]) {
  test(`P0 panel transitions remain exclusive at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.goto('/?lang=en');
    const prompt = `P0 panel regression ${width}: original prompt must survive menu switches.`;
    const editor = page.getByRole('textbox', { name: 'Your Long Prompt' });
    await editor.fill(prompt);
    await page.getByRole('button', { name: /Save to History/ }).click();

    await assertExclusive(page, null);
    const clickPanel = async (panel: PanelId) => {
      await page.getByRole('button', { name: names[panel], exact: true }).click();
      await assertExclusive(page, panel);
      await expect(editor).toHaveValue(prompt);
    };

    await clickPanel('templates');
    await page.screenshot({ path: `evidence/p0-${width}-templates.png`, fullPage: true });
    await clickPanel('history');
    await expect(page.locator('#panel-history')).toContainText(`P0 panel regression ${width}`);
    await page.screenshot({ path: `evidence/p0-${width}-history.png`, fullPage: true });
    await clickPanel('settings');
    const budget = page.getByRole('spinbutton');
    await budget.fill('777');
    await budget.blur();
    await expect(budget).toHaveValue('777');
    await page.screenshot({ path: `evidence/p0-${width}-settings.png`, fullPage: true });
    await clickPanel('batch');
    await expect(page.getByRole('dialog', { name: /Batch/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close batch' })).toBeFocused();

    // Batch and Shortcuts are dialogs that cover the toolbar. Switch with the
    // supported keyboard shortcut, just as a keyboard user would.
    await page.keyboard.press('Alt+Shift+k');
    await assertExclusive(page, 'shortcuts');
    await expect(page.getByRole('dialog', { name: 'Shortcuts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close keyboard shortcuts' })).toBeFocused();
    await page.keyboard.press('Alt+Shift+k');
    await assertExclusive(page, null);

    // Repeated button activation closes an inline panel.
    await clickPanel('templates');
    await page.getByRole('button', { name: 'Templates', exact: true }).click();
    await assertExclusive(page, null);

    // Twenty consecutive real clicks expose regressions where multiple panels
    // retain their own state and stack in the document flow.
    for (let i = 0; i < 20; i++) {
      await clickPanel((['templates', 'history', 'settings'] as const)[i % 3]);
    }
    await page.keyboard.press('Escape');
    await assertExclusive(page, null);
    await clickPanel('settings');
    await expect(page.getByRole('spinbutton')).toHaveValue('777');
    await page.getByRole('button', { name: 'Close settings' }).click();
    await assertExclusive(page, null);

    // Close buttons work for both inline panels and dialogs.
    await clickPanel('templates');
    await page.getByRole('button', { name: 'Close templates' }).click();
    await assertExclusive(page, null);
    await expect(page.getByRole('button', { name: 'Templates', exact: true })).toBeFocused();
    await clickPanel('history');
    await page.getByRole('button', { name: 'Close history' }).click();
    await assertExclusive(page, null);
    await expect(page.getByRole('button', { name: 'History', exact: true })).toBeFocused();
    await clickPanel('batch');
    await page.getByRole('button', { name: 'Close batch' }).click();
    await assertExclusive(page, null);
    await expect(page.getByRole('button', { name: 'Batch', exact: true })).toBeFocused();
    await clickPanel('shortcuts');
    await page.getByRole('button', { name: 'Close keyboard shortcuts' }).click();
    await assertExclusive(page, null);
    await expect(page.getByRole('button', { name: 'Shortcuts', exact: true })).toBeFocused();

    // Assert the existing shortcuts use the shared state, even when a panel
    // is already open. Dispatch the browser-reserved Ctrl+T/Ctrl+H combinations
    // to the app directly; Chrome may intercept the physical shortcuts.
    for (const [key, panel] of [
      ['t', 'templates'], ['h', 'history'], ['s', 'settings'], ['k', 'shortcuts'],
    ] as const) {
      await page.evaluate(key => window.dispatchEvent(new KeyboardEvent('keydown', {
        key, ctrlKey: true, bubbles: true, cancelable: true,
      })), key);
      await assertExclusive(page, panel);
    }
    await page.keyboard.press('Escape');
    await assertExclusive(page, null);

    // Exercise physical keyboard delivery in Chrome for browser-safe aliases.
    for (const [key, panel] of [
      ['t', 'templates'], ['h', 'history'], ['s', 'settings'], ['k', 'shortcuts'],
    ] as const) {
      await page.keyboard.press(`Alt+Shift+${key}`);
      await assertExclusive(page, panel);
    }
    await page.keyboard.press('Escape');
    await assertExclusive(page, null);
    await expect(editor).toHaveValue(prompt);

    await clickPanel('history');
    await expect(page.locator('#panel-history')).toContainText(`P0 panel regression ${width}`);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
      .toBeLessThanOrEqual(1);
  });
}
