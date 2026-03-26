/**
 * Provider Abstraction
 *
 * Two provider implementations:
 * - 'anthropic': Native Anthropic SDK (betaZodTool + toolRunner + adaptive thinking)
 * - 'ai-sdk': Vercel AI SDK (tool() + generateText, any provider/model)
 *
 * Tools are defined once in a shared format and converted to each provider's native format.
 */
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ProviderConfig } from '../types.js';
export type { ProviderConfig } from '../types.js';

// =============================================================================
// Shared Tool Format
// =============================================================================

export interface AgentToolDef<T extends z.ZodType = z.ZodType> {
    name: string;
    description: string;
    inputSchema: T;
    run: (input: z.infer<T>) => Promise<string>;
}

// =============================================================================
// Provider Interface
// =============================================================================

export interface ProviderRunParams {
    model: string;
    system: string;
    prompt: string;
    tools: AgentToolDef[];
    maxSteps: number;
    onEvent?: (event: { type: string; message: string }) => void;
}

export interface ProviderResult {
    text: string;
}

export interface AgentProvider {
    runWithTools(params: ProviderRunParams): Promise<ProviderResult>;
}

// =============================================================================
// Anthropic Provider (native SDK)
// =============================================================================

export function createAnthropicProvider(): AgentProvider {
    return {
        async runWithTools(params) {
            const { resilientToolRunner } = await import('./resilient-client.js');
            const tools = toNativeAnthropicTools(params.tools);

            const finalMessage = await resilientToolRunner({
                model: params.model,
                max_tokens: 16000,
                system: params.system,
                thinking: { type: 'adaptive' },
                tools,
                messages: [{ role: 'user', content: params.prompt }],
            }, { onEvent: params.onEvent as any });

            const text = finalMessage.content
                .filter((b: any) => b.type === 'text')
                .map((b: any) => b.text)
                .join('\n');

            return { text };
        },
    };
}

// =============================================================================
// Vercel AI SDK Provider
// =============================================================================

export function createAiSdkProvider(model: any): AgentProvider {
    return {
        async runWithTools(params) {
            // Dynamic import — ai SDK is an optional peer dep
            const { generateText, tool } = await import('ai');

            const tools: Record<string, any> = {};
            for (const t of params.tools) {
                tools[t.name] = (tool as any)({
                    description: t.description,
                    parameters: t.inputSchema,
                    execute: t.run,
                });
            }

            const result = await (generateText as any)({
                model,
                system: params.system,
                prompt: params.prompt,
                tools,
                maxSteps: params.maxSteps,
                toolChoice: 'auto',
            });

            return { text: result.text || '' };
        },
    };
}

// =============================================================================
// Shared: Convert AgentToolDef → Anthropic native tool (using zod/v4)
// =============================================================================

export function toNativeAnthropicTools(tools: AgentToolDef[]) {
    return tools.map((t) => {
        const jsonSchema = zodToJsonSchema(t.inputSchema, { target: 'openApi3' });
        return {
            type: 'custom' as const,
            name: t.name,
            description: t.description,
            input_schema: jsonSchema as any,
            run: t.run,
            parse: (args: unknown) => t.inputSchema.parse(args),
        };
    });
}

// =============================================================================
// Factory
// =============================================================================

export function createProvider(config: ProviderConfig): AgentProvider {
    if (config === 'anthropic') {
        return createAnthropicProvider();
    }
    if (config.type === 'ai-sdk') {
        return createAiSdkProvider(config.model);
    }
    throw new Error(`Unknown provider: ${JSON.stringify(config)}`);
}
