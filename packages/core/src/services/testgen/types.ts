/**
 * Test Generation Service Types
 */
import type { Effect } from 'effect';
import type { Page } from 'playwright';
import type { ElementDiscovery, TestGenerationResults } from '../../types.js';
import type {
    EffectTestGenNotInitializedError,
    EffectTestGenInitError,
    EffectTestGenNavigationError,
    EffectTestGenDiscoveryError,
} from '../../errors/effect-errors.js';

export interface TestGenerationConfig {
    model?: string;
    verbose?: boolean;
}

/**
 * Effect-first Test Generation Service interface
 *
 * All methods return Effects for composability with the Effect ecosystem.
 */
export interface ITestGenerationService {
    /**
     * Initialize the Stagehand scanner
     */
    init(config?: TestGenerationConfig): Effect.Effect<void, EffectTestGenInitError>;

    /**
     * Get the underlying page instance
     */
    getPage(): Effect.Effect<Page, EffectTestGenNotInitializedError>;

    /**
     * Navigate to a URL
     */
    navigateTo(url: string): Effect.Effect<void, EffectTestGenNotInitializedError | EffectTestGenNavigationError>;

    /**
     * Discover interactive elements on the page using AI
     */
    discoverElements(): Effect.Effect<ElementDiscovery[], EffectTestGenNotInitializedError | EffectTestGenDiscoveryError>;

    /**
     * Generate a Playwright test file from discovered elements
     */
    generateTest(url: string, elements: ElementDiscovery[]): Effect.Effect<string>;

    /**
     * Close the scanner and clean up resources
     */
    close(): Effect.Effect<void>;

    /**
     * Check if service is initialized
     */
    isInitialized(): Effect.Effect<boolean>;
}

/**
 * @deprecated Use ITestGenerationService instead
 * Legacy interface for backward compatibility
 */
export interface ITestGenerationServiceLegacy {
    init(config?: TestGenerationConfig): Promise<void>;
    getPage(): Page | null;
    navigateTo(url: string): Promise<void>;
    discoverElements(): Promise<ElementDiscovery[]>;
    generateTest(url: string, elements: ElementDiscovery[]): string;
    close(): Promise<void>;
    isInitialized(): boolean;
}
