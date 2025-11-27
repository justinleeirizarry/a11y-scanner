import type { TestGenerationOptions, TestGenerationResults } from '../types.js';
import { createOrchestrationService } from '../services/index.js';
import { logger } from '../utils/logger.js';

/**
 * Run test generation using Stagehand AI
 * This is a separate flow from the accessibility scan
 *
 * @deprecated This function is maintained for backwards compatibility.
 * For new code, use OrchestrationService.performTestGeneration() instead:
 *
 * ```typescript
 * import { createOrchestrationService } from './services';
 * const orchestration = createOrchestrationService();
 * const result = await orchestration.performTestGeneration({ url, outputFile, model, verbose });
 * ```
 */
export async function runTestGeneration(options: TestGenerationOptions): Promise<TestGenerationResults> {
    const { url, outputFile, model, verbose } = options;

    if (verbose) {
        logger.setLevel(0); // DEBUG
    }

    const orchestration = createOrchestrationService();
    return orchestration.performTestGeneration({ url, outputFile, model, verbose });
}
