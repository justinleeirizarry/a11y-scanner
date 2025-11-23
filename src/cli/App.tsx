import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import Scanner from './components/Scanner.js';
import Results from './components/Results.js';
import { runScan } from '../browser/launcher.js';
import type { ScanResults } from '../types.js';

interface AppProps {
    url: string;
    browser: 'chromium' | 'firefox' | 'webkit';
    output?: string;
    ci: boolean;
    threshold: number;
    headless: boolean;
    ai?: boolean;
    tags?: string[];
    keyboardNav?: boolean;
}

type ScanState = 'idle' | 'scanning' | 'complete' | 'error';

const App: React.FC<AppProps> = ({ url, browser, output, ci, threshold, headless, ai, tags, keyboardNav }) => {
    const { exit } = useApp();
    const [state, setState] = useState<ScanState>('idle');
    const [results, setResults] = useState<ScanResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aiPromptFilePath, setAiPromptFilePath] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const performScan = async () => {
            setState('scanning');

            try {
                const scanResults = await runScan({
                    url,
                    browser,
                    headless,
                    tags,
                    includeKeyboardTests: keyboardNav,
                });

                if (cancelled) return;

                setResults(scanResults);
                setState('complete');

                // Handle CI mode
                if (ci) {
                    const totalViolations = scanResults.violations.length;
                    if (totalViolations > threshold) {
                        process.exitCode = 1;
                        exit();
                    } else {
                        process.exitCode = 0;
                        exit();
                    }
                }

                // Handle output file
                if (output) {
                    const fs = await import('fs/promises');
                    await fs.writeFile(output, JSON.stringify(scanResults, null, 2));
                }

                // Handle AI prompts
                if (ai) {
                    const { generateAndExport } = await import('../prompts/prompt-generator.js');
                    const promptPath = generateAndExport(
                        scanResults,
                        {
                            template: 'fix-all',
                            format: 'md',
                            outputPath: undefined,
                        }
                    );
                    setAiPromptFilePath(promptPath);
                }
            } catch (err) {
                if (cancelled) return;

                setState('error');
                setError(err instanceof Error ? err.message : String(err));

                if (ci) {
                    process.exitCode = 1;
                    exit();
                }
            }
        };

        performScan();

        return () => {
            cancelled = true;
        };
    }, [url, browser, headless, ci, threshold, output, ai, tags, keyboardNav]);

    if (state === 'error') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box>
                    <Text color="red" bold>❌ Scan Error</Text>
                </Box>
                <Box marginTop={1}>
                    <Text>{error}</Text>
                </Box>
            </Box>
        );
    }

    if (state === 'scanning') {
        return <Scanner url={url} browser={browser} />;
    }

    if (state === 'complete' && results) {
        return <Results results={results} outputFile={output} aiPromptFile={aiPromptFilePath || undefined} />;
    }

    return (
        <Box>
            <Text color="green">
                <Spinner type="dots" />
            </Text>
            <Text> Initializing...</Text>
        </Box>
    );
};

export default App;
