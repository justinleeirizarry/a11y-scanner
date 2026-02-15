import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@accessibility-toolkit/core': resolve(__dirname, 'packages/core/src/index.ts'),
            '@accessibility-toolkit/cli': resolve(__dirname, 'packages/cli/src/index.tsx'),
            '@accessibility-toolkit/mcp': resolve(__dirname, 'packages/mcp/src/server.ts'),
        },
    },
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
