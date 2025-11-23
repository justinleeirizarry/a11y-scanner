import React from 'react';
import { Box, Text } from 'ink';
import type { ScanResults } from '../../types.js';
import { TreeViewer } from './TreeViewer.js';
import { Dashboard } from './Dashboard.js';
import { ViolationCard } from './ViolationCard.js';
import { Banner } from './Banner.js';
import { KeyboardResults } from './KeyboardResults.js';

interface ResultsProps {
    results: ScanResults | null;
    outputFile?: string;
    aiPromptFile?: string;
    report?: string;
    showTree?: boolean;
}

const Results: React.FC<ResultsProps> = ({ results, outputFile, aiPromptFile, report, showTree }) => {
    if (!results) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="gray">Loading scan results...</Text>
            </Box>
        );
    }

    const { violations, summary } = results;

    return (
        <Box flexDirection="column" padding={1}>
            <Banner />

            {/* File Outputs */}
            {(outputFile || aiPromptFile || report) && (
                <Box flexDirection="column" marginBottom={1} borderStyle="single" borderColor="gray" paddingX={1}>
                    {outputFile && (
                        <Box>
                            <Text color="gray">JSON Report: </Text>
                            <Text color="green">{outputFile}</Text>
                        </Box>
                    )}
                    {report && (
                        <Box>
                            <Text color="gray">HTML Report: </Text>
                            <Text color="green">{report}</Text>
                        </Box>
                    )}
                    {aiPromptFile && (
                        <Box>
                            <Text color="gray">AI Prompt: </Text>
                            <Text color="cyan">{aiPromptFile}</Text>
                        </Box>
                    )}
                </Box>
            )}

            {/* Dashboard Summary */}
            <Dashboard
                summary={summary}
                keyboardSummary={results.keyboardTests?.summary}
            />

            {/* Keyboard Test Results */}
            {results.keyboardTests && (
                <KeyboardResults results={results.keyboardTests} />
            )}

            {/* Success Message */}
            {violations.length === 0 && (
                <Box marginTop={1} padding={1} borderStyle="round" borderColor="green">
                    <Text color="green" bold>✅ No accessibility violations found!</Text>
                </Box>
            )}

            {/* Accessibility Tree - Only show if --tree flag is set */}
            {violations.length > 0 && showTree && (
                <TreeViewer violations={violations} />
            )}

            {/* Violation Cards */}
            {violations.length > 0 && (
                <Box flexDirection="column" marginTop={1}>
                    <Text bold underline>Violations</Text>
                    {violations.map((violation, idx) => (
                        <ViolationCard key={idx} violation={violation} index={idx + 1} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Results;
