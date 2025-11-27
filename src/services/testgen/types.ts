/**
 * Test Generation Service Types
 */
import type { Page } from 'playwright';
import type { ElementDiscovery, TestGenerationResults } from '../../types.js';

export interface TestGenerationConfig {
    model?: string;
    verbose?: boolean;
}

export interface ITestGenerationService {
    init(config?: TestGenerationConfig): Promise<void>;
    getPage(): Page | null;
    navigateTo(url: string): Promise<void>;
    discoverElements(): Promise<ElementDiscovery[]>;
    generateTest(url: string, elements: ElementDiscovery[]): string;
    close(): Promise<void>;
    isInitialized(): boolean;
}
