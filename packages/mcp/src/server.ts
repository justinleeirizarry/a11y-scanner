#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Effect } from "effect";
import { z } from "zod";
import {
    runScanAsPromise,
    AppLayer,
    createResultsProcessorService,
    logger,
    EXIT_CODES,
    exitWithCode,
    updateConfig,
    loadEnvConfig,
    hasEnvConfig,
} from "@accessibility-toolkit/core";

// Configure logger to use stderr to avoid corrupting JSON-RPC on stdout
logger.setUseStderr(true);

// Load configuration from environment variables (REACT_A11Y_*)
if (hasEnvConfig()) {
    updateConfig(loadEnvConfig());
}

// Create server instance
const server = new McpServer({
    name: "accessibility-toolkit",
    version: "1.0.0",
});

// Register scan tool
server.registerTool(
    "scan_url",
    {
        description: "Scan a URL for accessibility violations",
        inputSchema: {
            url: z.string().url().describe("The URL to scan"),
            browser: z.enum(["chromium", "firefox", "webkit"]).optional().default("chromium").describe("Browser to use for scanning"),
            mobile: z.boolean().optional().default(false).describe("Emulate a mobile device"),
            include_tree: z.boolean().optional().default(false).describe("Include the full accessibility tree in the response (can be large)"),
        },
    },
    async ({ url, browser, mobile, include_tree }) => {
        try {
            logger.info(`Starting scan for ${url} using ${browser}`);

            const { results } = await runScanAsPromise({
                url,
                browser: browser as "chromium" | "firefox" | "webkit",
                headless: true,
                includeKeyboardTests: true,
            }, AppLayer);

            const processor = createResultsProcessorService();
            const content = Effect.runSync(processor.formatForMCP(results, { includeTree: include_tree }));

            return {
                content,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Scan failed: ${errorMessage}`);
            return {
                content: [
                    {
                        type: "text",
                        text: `Scan failed: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("Accessibility Toolkit MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    exitWithCode(EXIT_CODES.RUNTIME_ERROR);
});
