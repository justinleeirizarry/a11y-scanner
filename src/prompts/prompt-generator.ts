import fs from 'fs';
import path from 'path';
import type { ScanResults, PromptContext, PromptExportOptions, TechStack } from '../types.js';
import { getTemplate } from './templates/index.js';

/**
 * Generate AI prompt from scan results
 */
export function generatePrompt(
    results: ScanResults,
    techStack: TechStack,
    templateName: string = 'fix-all'
): string {
    const template = getTemplate(templateName);

    if (!template) {
        throw new Error(`Template "${templateName}" not found. Available templates: fix-all, explain, quick-wins, critical-only`);
    }

    const context: PromptContext = {
        violations: results.violations,
        summary: results.summary,
        techStack,
        url: results.url,
    };

    return template.render(context);
}

/**
 * Export prompt to file
 */
export function exportPrompt(
    prompt: string,
    options: PromptExportOptions
): string {
    const { format, outputPath, template } = options;

    let content: string;
    let defaultFilename: string;

    switch (format) {
        case 'txt':
            content = prompt;
            defaultFilename = `a11y-prompt-${template}.txt`;
            break;

        case 'md':
            content = `# Accessibility Violations - AI Fix Prompt\n\n${prompt}`;
            defaultFilename = `a11y-prompt-${template}.md`;
            break;

        case 'json':
            content = JSON.stringify({
                template,
                prompt,
                generatedAt: new Date().toISOString(),
            }, null, 2);
            defaultFilename = `a11y-prompt-${template}.json`;
            break;

        default:
            throw new Error(`Unknown format: ${format}`);
    }

    const filepath = outputPath || defaultFilename;
    fs.writeFileSync(filepath, content, 'utf-8');

    return path.resolve(filepath);
}

/**
 * Generate and export prompt in one step
 */
export function generateAndExport(
    results: ScanResults,
    techStack: TechStack,
    options: PromptExportOptions
): string {
    const prompt = generatePrompt(results, techStack, options.template);
    return exportPrompt(prompt, options);
}
