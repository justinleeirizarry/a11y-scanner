import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
            exclude: [
                'packages/*/src/**/*.test.ts',
                'packages/*/src/**/*.test.tsx',
                'packages/core/src/types.ts',
                'packages/core/src/scanner/browser-bundle.ts',
            ],
        },
        include: [
            'packages/*/src/**/*.test.ts',
            'packages/*/src/**/*.test.tsx',
            'test/**/*.test.ts',
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
        ],
    },
});
