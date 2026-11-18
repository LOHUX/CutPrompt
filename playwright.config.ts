import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e', timeout: 60000, workers: 1,
  testIgnore: ['**/._*'],
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    headless: true,
    baseURL: 'http://127.0.0.1:4173',
    acceptDownloads: true,
    screenshot: 'only-on-failure',
  },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true, timeout: 30000 },
});
