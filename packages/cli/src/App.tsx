import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import Spinner from 'ink-spinner';
import { Effect } from 'effect';
import Scanner from './components/Scanner.js';
import Results from './components/Results.js';
import TestGenerator from './components/TestGenerator.js';
import TestGenerationResults from './components/TestGenerationResults.js';
import {
    runScanAsPromise,
    AppLayer,
    createTestGenerationService,
    EXIT_CODES,
    setExitCode,
    generateAndExport,
} from '@react-a11y-scanner/core';
import type { ScanResults, TestGenerationResults as TestGenResults, BrowserType } from '@react-a11y-scanner/core';

interface AppProps {
    mode: 'scan' | 'generate-test';
    url: string;
    browser: BrowserType;
    output?: string;
    ci: boolean;
    threshold: number;
    headless: boolean;
    ai?: boolean;
    tags?: string[];
    keyboardNav?: boolean;
    tree?: boolean;
    quiet?: boolean;
    generateTest?: boolean;
    testFile?: string;
    stagehandModel?: string;
    stagehandVerbose?: boolean;
}

type ScanState = 'idle' | 'scanning' | 'complete' | 'error';
type TestGenState = 'idle' | 'initializing' | 'navigating' | 'discovering' | 'generating' | 'complete' | 'error';

const App: React.FC<AppProps> = ({ mode, url, browser, output, ci, threshold, headless, ai, tags, keyboardNav, tree, quiet, generateTest, testFile, stagehandModel, stagehandVerbose }) => {
    const { exit } = useApp();
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [testGenState, setTestGenState] = useState<TestGenState>('idle');
    const [scanResults, setScanResults] = useState<ScanResults | null>(null);
    const [testGenResults, setTestGenResults] = useState<TestGenResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aiPromptFilePath, setAiPromptFilePath] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (mode === 'generate-test') {
            // Test generation mode
            const performTestGeneration = async () => {
                setTestGenState('initializing');

                try {
                    if (!testFile) {
                        throw new Error('Test output file not specified');
                    }

                    setTestGenState('navigating');

                    const testGenService = createTestGenerationService();
                    await Effect.runPromise(testGenService.init({ model: stagehandModel, verbose: stagehandVerbose }));
                    await Effect.runPromise(testGenService.navigateTo(url));

                    setTestGenState('discovering');
                    const elements = await Effect.runPromise(testGenService.discoverElements());

                    setTestGenState('generating');
                    const testContent = await Effect.runPromise(testGenService.generateTest(url, elements));

                    // Write test file
                    const fs = await import('fs/promises');
                    const path = await import('path');
                    const dir = path.dirname(testFile);
                    if (dir !== '.') {
                        await fs.mkdir(dir, { recursive: true }).catch(() => {});
                    }
                    await fs.writeFile(testFile, testContent);

                    await Effect.runPromise(testGenService.close());

                    if (cancelled) return;

                    setTestGenResults({
                        url,
                        timestamp: new Date().toISOString(),
                        outputFile: testFile,
                        elementsDiscovered: elements.length,
                        elements,
                        success: true,
                    });
                    setTestGenState('complete');

                    // Exit after completion
                    exit();
                } catch (err) {
                    if (cancelled) return;

                    setTestGenState('error');
                    setError(err instanceof Error ? err.message : String(err));
                    setExitCode(EXIT_CODES.RUNTIME_ERROR);
                    exit();
                }
            };

            performTestGeneration();
        } else {
            // Accessibility scan mode using Effect-based orchestration
            const performScan = async () => {
                setScanState('scanning');

                try {
                    const { results, ciPassed } = await runScanAsPromise({
                        url,
                        browser,
                        headless,
                        tags,
                        includeKeyboardTests: keyboardNav,
                        outputFile: output,
                        ciMode: ci,
                        ciThreshold: threshold,
                    }, AppLayer);

                    if (cancelled) return;

                    setScanResults(results);
                    setScanState('complete');

                    // Handle AI prompts (must happen before exit)
                    if (ai) {
                        try {
                            const promptPath = generateAndExport(
                                results,
                                {
                                    template: 'fix-all',
                                    format: 'md',
                                    outputPath: undefined,
                                }
                            );
                            setAiPromptFilePath(promptPath);
                        } catch (err) {
                            const errorMsg = err instanceof Error ? err.message : String(err);
                            setScanState('error');
                            setError(`Failed to generate AI prompt: ${errorMsg}`);
                            if (ci) {
                                setExitCode(EXIT_CODES.RUNTIME_ERROR);
                                exit();
                            }
                            return;
                        }
                    }

                    // Handle CI mode exit
                    if (ci) {
                        setExitCode(ciPassed ? EXIT_CODES.SUCCESS : EXIT_CODES.VIOLATIONS_FOUND);
                        exit();
                    } else if (!tree) {
                        // Exit for non-interactive modes
                        // If --tree is set, we keep running for the interactive TreeViewer
                        exit();
                    }
                } catch (err) {
                    if (cancelled) return;

                    setScanState('error');
                    setError(err instanceof Error ? err.message : String(err));

                    setExitCode(EXIT_CODES.RUNTIME_ERROR);
                    exit();
                }
            };

            performScan();
        }

        return () => {
            cancelled = true;
        };
    }, [mode, url, browser, headless, ci, threshold, output, ai, tags, keyboardNav, tree, generateTest, stagehandModel, stagehandVerbose]);

    // Error state
    if (scanState === 'error' || testGenState === 'error') {
        return (
            <Box flexDirection="column" padding={1}>
                <Box>
                    <Text color="red" bold>Scan Error</Text>
                </Box>
                <Box marginTop={1}>
                    <Text>{error}</Text>
                </Box>
            </Box>
        );
    }

    // Test generation mode
    if (mode === 'generate-test') {
        if (testGenState === 'complete' && testGenResults) {
            return <TestGenerationResults results={testGenResults} />;
        }

        return <TestGenerator url={url} stage={testGenState} elementsFound={testGenResults?.elementsDiscovered} />;
    }

    // Scan mode
    if (scanState === 'scanning') {
        // In quiet mode, show minimal scanning indicator
        if (quiet) {
            return (
                <Box>
                    <Text color="gray">Scanning {url}...</Text>
                </Box>
            );
        }
        return <Scanner url={url} browser={browser} />;
    }

    if (scanState === 'complete' && scanResults) {
        return <Results results={scanResults} outputFile={output} aiPromptFile={aiPromptFilePath || undefined} showTree={tree} quiet={quiet} />;
    }

    // In quiet mode, show nothing during initialization
    if (quiet) {
        return null;
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
