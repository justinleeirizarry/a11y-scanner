import React from 'react';
import { Box, Text } from 'ink';
import type { ScanResults } from '../../types.js';
import { TreeViewer } from './TreeViewer.js';
import { Dashboard } from './Dashboard.js';
import { ViolationCard } from './ViolationCard.js';
import { Banner } from './Banner.js';
import { KeyboardResults } from './KeyboardResults.js';
import { colors, impactColors } from '../colors.js';

interface ResultsProps {
    results: ScanResults | null;
    outputFile?: string;
    aiPromptFile?: string;
    report?: string;
    showTree?: boolean;
    quiet?: boolean;
}

const Results: React.FC<ResultsProps> = ({ results, outputFile, aiPromptFile, report, showTree, quiet }) => {
    if (!results) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="gray">Loading scan results...</Text>
            </Box>
        );
    }

    const { violations, incomplete, summary, url } = results;

    // Quiet mode: plain text, no boxes or extra spacing
    if (quiet) {
        const { totalViolations, totalPasses, violationsBySeverity } = summary;
        const hasIssues = totalViolations > 0;

        return (
            <Box flexDirection="column">
                {/* Summary line */}
                <Text>
                    <Text color={hasIssues ? colors.critical : colors.success} bold>{hasIssues ? '✗' : '✓'} </Text>
                    <Text>{url} - {totalViolations} violations, {totalPasses} passes</Text>
                </Text>

                {/* Severity breakdown if issues exist */}
                {hasIssues && (
                    <Text color="gray">
                        {violationsBySeverity.critical > 0 && `${violationsBySeverity.critical} critical `}
                        {violationsBySeverity.serious > 0 && `${violationsBySeverity.serious} serious `}
                        {violationsBySeverity.moderate > 0 && `${violationsBySeverity.moderate} moderate `}
                        {violationsBySeverity.minor > 0 && `${violationsBySeverity.minor} minor`}
                    </Text>
                )}

                {/* Violations - plain text format */}
                {violations.map((violation, idx) => {
                    const impactColor = impactColors[violation.impact] || colors.muted;

                    return (
                        <Box key={idx} flexDirection="column">
                            <Text>
                                <Text color={impactColor}>[{violation.impact}]</Text>
                                <Text> {violation.id}: {violation.description}</Text>
                            </Text>
                            {violation.nodes.map((node, nodeIdx) => {
                                const componentName = node.userComponentPath?.length
                                    ? node.userComponentPath[node.userComponentPath.length - 1]
                                    : node.component || 'Unknown';
                                return (
                                    <Text key={nodeIdx} color="gray">
                                        {`  - ${componentName}`}{node.cssSelector ? ` (${node.cssSelector})` : ''}
                                    </Text>
                                );
                            })}
                            {violation.helpUrl && (
                                <Text color="gray">  Docs: {violation.helpUrl}</Text>
                            )}
                        </Box>
                    );
                })}

                {/* Output files */}
                {outputFile && <Text color="gray">Output: {outputFile}</Text>}
                {aiPromptFile && <Text color="gray">AI Prompt: {aiPromptFile}</Text>}
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Banner url={url} />

            {/* File Outputs */}
            {(outputFile || aiPromptFile || report) && (
                <Box flexDirection="column" marginBottom={1} paddingX={1}>
                    {outputFile && (
                        <Box>
                            <Text color={colors.muted}>JSON Report: </Text>
                            <Text color={colors.success}>{outputFile}</Text>
                        </Box>
                    )}
                    {report && (
                        <Box>
                            <Text color={colors.muted}>HTML Report: </Text>
                            <Text color={colors.success}>{report}</Text>
                        </Box>
                    )}
                    {aiPromptFile && (
                        <Box>
                            <Text color={colors.muted}>AI Prompt: </Text>
                            <Text color={colors.info}>{aiPromptFile}</Text>
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
                <Box marginTop={1} padding={1}>
                    <Text color={colors.success} bold>✓ No accessibility violations found!</Text>
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

            {/* Incomplete - Manual Review Needed */}
            {incomplete && incomplete.length > 0 && (
                <Box flexDirection="column" marginTop={2}>
                    <Box marginBottom={1}>
                        <Text bold underline color={colors.serious}>Manual Review Required ({incomplete.length})</Text>
                    </Box>
                    <Text color={colors.muted} dimColor>
                        These items could not be automatically verified and require manual testing:
                    </Text>
                    {incomplete.slice(0, 5).map((item, idx) => (
                        <Box key={idx} flexDirection="column" marginTop={1} marginLeft={1}>
                            <Box>
                                <Text color={colors.serious}>• </Text>
                                <Text bold>{item.id}</Text>
                                <Text color={colors.muted}> - {item.description}</Text>
                            </Box>
                            {item.nodes.length > 0 && item.nodes[0].message && (
                                <Box marginLeft={2}>
                                    <Text color="gray" dimColor>Reason: {item.nodes[0].message}</Text>
                                </Box>
                            )}
                            <Box marginLeft={2}>
                                <Text color="gray" dimColor>
                                    {item.nodes.length} element{item.nodes.length !== 1 ? 's' : ''} to check
                                </Text>
                            </Box>
                        </Box>
                    ))}
                    {incomplete.length > 5 && (
                        <Box marginTop={1} marginLeft={1}>
                            <Text color="gray" dimColor>
                                ... and {incomplete.length - 5} more (see JSON output for full list)
                            </Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Results;
