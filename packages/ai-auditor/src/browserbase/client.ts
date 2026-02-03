/**
 * Browserbase Client - SDK wrapper for Browserbase integration
 *
 * Provides session management and live view URL generation for
 * AI-powered accessibility auditing.
 */

import Browserbase from '@browserbasehq/sdk';
import { Stagehand } from '@browserbasehq/stagehand';

/**
 * Browserbase configuration
 */
export interface BrowserbaseConfig {
    /** Browserbase API key */
    apiKey: string;
    /** Browserbase project ID */
    projectId: string;
}

/**
 * Browserbase session information
 */
export interface BrowserbaseSession {
    /** Session ID */
    sessionId: string;
    /** Live view URL for watching the browser */
    liveViewUrl: string;
    /** Debug URL for Browserbase dashboard */
    debugUrl: string;
}

/**
 * Browserbase Client - manages browser sessions and Stagehand integration
 *
 * @example
 * ```typescript
 * const client = new BrowserbaseClient({
 *   apiKey: process.env.BROWSERBASE_API_KEY!,
 *   projectId: process.env.BROWSERBASE_PROJECT_ID!,
 * });
 *
 * const session = await client.createSession();
 * console.log(`Live view: ${session.liveViewUrl}`);
 *
 * const stagehand = await client.createStagehand(session.sessionId);
 * // Use stagehand for AI-powered browsing
 *
 * await client.closeSession(session.sessionId);
 * ```
 */
export class BrowserbaseClient {
    private bb: Browserbase;
    private config: BrowserbaseConfig;

    constructor(config: BrowserbaseConfig) {
        this.config = config;
        this.bb = new Browserbase({ apiKey: config.apiKey });
    }

    /**
     * Create a new Browserbase session
     */
    async createSession(): Promise<BrowserbaseSession> {
        const session = await this.bb.sessions.create({
            projectId: this.config.projectId,
        });

        return {
            sessionId: session.id,
            liveViewUrl: `https://www.browserbase.com/sessions/${session.id}/live`,
            debugUrl: `https://www.browserbase.com/sessions/${session.id}`,
        };
    }

    /**
     * Create a Stagehand instance connected to a Browserbase session
     */
    async createStagehand(
        sessionId: string,
        options?: {
            model?: string;
            verbose?: boolean;
        }
    ): Promise<Stagehand> {
        const stagehand = new Stagehand({
            env: 'BROWSERBASE',
            browserbaseSessionID: sessionId,
            // Using any to handle version differences in Stagehand API
            ...(options?.model && { modelName: options.model as any }),
            verbose: options?.verbose ? 1 : 0,
        } as any);

        await stagehand.init();
        return stagehand;
    }

    /**
     * Get session information
     */
    async getSession(sessionId: string): Promise<BrowserbaseSession | null> {
        try {
            const session = await this.bb.sessions.retrieve(sessionId);
            return {
                sessionId: session.id,
                liveViewUrl: `https://www.browserbase.com/sessions/${session.id}/live`,
                debugUrl: `https://www.browserbase.com/sessions/${session.id}`,
            };
        } catch {
            return null;
        }
    }

    /**
     * Close a session
     *
     * Note: This attempts to close the session but may fail silently if
     * the session is already closed or the API has changed.
     */
    async closeSession(sessionId: string): Promise<void> {
        try {
            // Try to close via the SDK - API may vary by version
            await (this.bb.sessions as any).update?.(sessionId, {
                projectId: this.config.projectId,
                status: 'REQUEST_RELEASE'
            });
        } catch {
            // Session may already be closed or API may differ
        }
    }

    /**
     * Get the underlying Browserbase SDK instance
     */
    getSDK(): Browserbase {
        return this.bb;
    }
}

/**
 * Create a new BrowserbaseClient instance
 */
export function createBrowserbaseClient(config: BrowserbaseConfig): BrowserbaseClient {
    return new BrowserbaseClient(config);
}
