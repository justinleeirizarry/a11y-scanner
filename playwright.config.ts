import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './generated-tests',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: 'line',
    use: {
        trace: 'off',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
