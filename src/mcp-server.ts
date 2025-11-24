#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runScan } from "./browser/launcher.js";
import { logger } from "./utils/logger.js";
import { formatViolations } from "./prompts/formatters.js";

// Configure logger to use stderr to avoid corrupting JSON-RPC on stdout
logger.setUseStderr(true);

// Create server instance
const server = new McpServer({
    name: "react-a11y-scanner",
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

            const results = await runScan({
                url,
                browser: browser as "chromium" | "firefox" | "webkit",
                headless: true,
                includeKeyboardTests: true,
            });

            const violationCount = results.violations.length;
            const criticalCount = results.summary.violationsBySeverity.critical;

            let summary = `## Scan Complete for ${url}\n\n`;
            summary += `Found **${violationCount}** violations (**${criticalCount}** critical).\n\n`;

            if (violationCount > 0) {
                summary += "### Violations Summary\n";
                // Use existing formatter but maybe truncate for chat context if needed
                // For now, we'll use the standard formatter which produces good markdown
                summary += formatViolations(results.violations);
            } else {
                summary += "No accessibility violations found!";
            }

            const content: any[] = [
                {
                    type: "text",
                    text: summary,
                }
            ];

            // Optionally include the full JSON result if requested, but usually text summary is better for LLMs
            // to avoid token limit issues with massive JSONs.
            // We can add a separate tool to get raw JSON if needed.

            if (include_tree && results.accessibilityTree) {
                content.push({
                    type: "text",
                    text: "\n\n### Accessibility Tree\n```json\n" + JSON.stringify(results.accessibilityTree, null, 2) + "\n```"
                });
            }

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
    logger.info("React A11y Scanner MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
