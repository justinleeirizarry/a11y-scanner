import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrompt, exportPrompt, generateAndExport } from './prompt-generator.js';
import { getTemplate } from './templates/index.js';
import fs from 'fs';
import path from 'path';

// Mock dependencies
vi.mock('fs', () => ({
    default: {
        mkdirSync: vi.fn(),
        writeFileSync: vi.fn()
    }
}));

vi.mock('./templates/index.js', () => ({
    getTemplate: vi.fn()
}));

describe('Prompt Generator', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('generatePrompt', () => {
        it('should render template with context', () => {
            const mockTemplate = { render: vi.fn().mockReturnValue('Rendered Prompt') };
            (getTemplate as any).mockReturnValue(mockTemplate);

            const results = {
                violations: [],
                summary: { totalViolations: 0, violationsByImpact: {} },
                url: 'http://example.com'
            };

            const result = generatePrompt(results as any, 'fix-all');

            expect(getTemplate).toHaveBeenCalledWith('fix-all');
            expect(mockTemplate.render).toHaveBeenCalledWith({
                violations: results.violations,
                summary: results.summary,
                url: results.url
            });
            expect(result).toBe('Rendered Prompt');
        });

        it('should throw if template not found', () => {
            (getTemplate as any).mockReturnValue(null);

            expect(() => {
                generatePrompt({} as any, 'invalid');
            }).toThrow(/Template "invalid" not found/);
        });
    });

    describe('exportPrompt', () => {
        it('should write txt file', () => {
            const prompt = 'My Prompt';
            exportPrompt(prompt, { format: 'txt', template: 'fix-all' });

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'a11y-prompt-fix-all.txt',
                'My Prompt',
                'utf-8'
            );
        });

        it('should write md file with header', () => {
            const prompt = 'My Prompt';
            exportPrompt(prompt, { format: 'md', template: 'fix-all' });

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'a11y-prompt.md',
                expect.stringContaining('# Accessibility Violations'),
                'utf-8'
            );
        });

        it('should write json file', () => {
            const prompt = 'My Prompt';
            exportPrompt(prompt, { format: 'json', template: 'fix-all' });

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'a11y-prompt-fix-all.json',
                expect.stringContaining('"prompt": "My Prompt"'),
                'utf-8'
            );
        });

        it('should create directory if needed', () => {
            const prompt = 'My Prompt';
            exportPrompt(prompt, { format: 'txt', template: 'fix-all', outputPath: 'out/prompt.txt' });

            expect(fs.mkdirSync).toHaveBeenCalledWith('out', { recursive: true });
            expect(fs.writeFileSync).toHaveBeenCalledWith('out/prompt.txt', prompt, 'utf-8');
        });

        it('should throw on write error', () => {
            (fs.writeFileSync as any).mockImplementation(() => {
                throw new Error('Write failed');
            });

            expect(() => {
                exportPrompt('prompt', { format: 'txt', template: 'fix-all' });
            }).toThrow(/Failed to write prompt/);
        });
    });
});
