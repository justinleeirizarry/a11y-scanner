import { StagehandScanner } from '../scanner/stagehand/index.js';
import { TestGenerator } from '../scanner/stagehand/test-generator.js';
import type { TestGenerationOptions, TestGenerationResults } from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * Run test generation using Stagehand AI
 * This is a separate flow from the accessibility scan
 */
export async function runTestGeneration(options: TestGenerationOptions): Promise<TestGenerationResults> {
    const { url, outputFile, model, verbose } = options;

    if (verbose) {
        logger.setLevel(0); // DEBUG
    }

    const scanner = new StagehandScanner({
        enabled: true,
        model,
        verbose
    });

    try {
        logger.info('Initializing Stagehand for test generation...');
        await scanner.init(url);

        const page = scanner.page;
        if (!page) {
            throw new Error('Failed to get Stagehand page');
        }

        logger.info(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Wait for page to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        logger.info('Discovering interactive elements...');
        const elements = await scanner.discoverElements();

        if (elements.length === 0) {
            logger.warn('No interactive elements discovered');
        } else {
            logger.info(`Discovered ${elements.length} interactive elements`);
        }

        logger.info('Generating Playwright test file...');
        const generator = new TestGenerator();
        const testContent = generator.generateTest(url, elements);

        // Write test file
        const fs = await import('fs/promises');
        const path = await import('path');

        // Ensure directory exists
        const dir = path.dirname(outputFile);
        if (dir !== '.') {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (err) {
                // Directory may already exist
                if (err instanceof Error && !err.message.includes('exists')) {
                    throw err;
                }
            }
        }

        await fs.writeFile(outputFile, testContent);
        logger.info(`Test file written to ${outputFile}`);

        return {
            url,
            timestamp: new Date().toISOString(),
            outputFile,
            elementsDiscovered: elements.length,
            elements,
            success: true
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error(`Test generation failed: ${errorMsg}`);

        return {
            url,
            timestamp: new Date().toISOString(),
            outputFile,
            elementsDiscovered: 0,
            elements: [],
            success: false,
            error: errorMsg
        };
    } finally {
        await scanner.close();
    }
}
