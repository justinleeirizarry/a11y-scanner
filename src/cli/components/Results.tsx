import React from 'react';
import { Box, Text } from 'ink';
import type { ScanResults } from '../../types.js';

interface ResultsProps {
    results: ScanResults;
    outputFile?: string;
}

const Results: React.FC<ResultsProps> = ({ results, outputFile }) => {
    const { violations, summary } = results;

    const criticalCount = violations.filter(v => v.impact === 'critical').length;
    const seriousCount = violations.filter(v => v.impact === 'serious').length;
    const moderateCount = violations.filter(v => v.impact === 'moderate').length;
    const minorCount = violations.filter(v => v.impact === 'minor').length;

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">✨ Scan Complete</Text>
            </Box>

            {outputFile && (
                <Box marginBottom={1}>
                    <Text color="gray">Saved to: </Text>
                    <Text color="green">{outputFile}</Text>
                </Box>
            )}

            <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
                <Text bold underline>Summary</Text>
                <Box marginTop={1}>
                    <Text color="gray">Components scanned: </Text>
                    <Text bold>{summary.totalComponents}</Text>
                </Box>
                <Box>
                    <Text color="gray">Components with issues: </Text>
                    <Text bold color={summary.componentsWithViolations > 0 ? 'yellow' : 'green'}>
                        {summary.componentsWithViolations}
                    </Text>
                </Box>
                <Box>
                    <Text color="gray">Total violations: </Text>
                    <Text bold color={summary.totalViolations > 0 ? 'red' : 'green'}>
                        {summary.totalViolations}
                    </Text>
                </Box>
            </Box>

            {violations.length > 0 && (
                <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="yellow" padding={1}>
                    <Text bold underline>Violations by Severity</Text>
                    {criticalCount > 0 && (
                        <Box marginTop={1}>
                            <Text color="magenta">● Critical: </Text>
                            <Text bold>{criticalCount}</Text>
                        </Box>
                    )}
                    {seriousCount > 0 && (
                        <Box>
                            <Text color="red">● Serious: </Text>
                            <Text bold>{seriousCount}</Text>
                        </Box>
                    )}
                    {moderateCount > 0 && (
                        <Box>
                            <Text color="yellow">● Moderate: </Text>
                            <Text bold>{moderateCount}</Text>
                        </Box>
                    )}
                    {minorCount > 0 && (
                        <Box>
                            <Text color="blue">● Minor: </Text>
                            <Text bold>{minorCount}</Text>
                        </Box>
                    )}
                </Box>
            )}

            {violations.length === 0 && (
                <Box marginTop={1}>
                    <Text color="green" bold>✅ No accessibility violations found!</Text>
                </Box>
            )}

            {violations.length > 0 && (
                <Box flexDirection="column" marginTop={1}>
                    <Text bold underline>Top Issues</Text>
                    {violations.slice(0, 5).map((violation, idx) => {
                        // Get the first node for display
                        const firstNode = violation.nodes[0];
                        const componentName = firstNode?.component || 'Unknown';
                        const componentPath = firstNode?.componentPath?.join(' > ') || '';
                        const componentType = firstNode?.componentType;

                        return (
                            <Box key={idx} flexDirection="column" marginTop={1}>
                                <Box>
                                    <Text color="gray">{idx + 1}. </Text>
                                    <Text bold color={componentType === 'host' ? 'cyan' : 'blue'}>
                                        {componentName}
                                    </Text>
                                    {componentType && (
                                        <Text color="gray" dimColor> [{componentType}]</Text>
                                    )}
                                    <Text color="gray"> - </Text>
                                    <Text color={
                                        violation.impact === 'critical' ? 'magenta' :
                                            violation.impact === 'serious' ? 'red' :
                                                violation.impact === 'moderate' ? 'yellow' : 'blue'
                                    }>
                                        {violation.impact}
                                    </Text>
                                </Box>
                                {componentPath && (
                                    <Box marginLeft={3}>
                                        <Text color="gray" dimColor>Path: {componentPath}</Text>
                                    </Box>
                                )}
                                <Box marginLeft={3}>
                                    <Text color="gray">{violation.description}</Text>
                                </Box>
                                {violation.nodes.length > 1 && (
                                    <Box marginLeft={3}>
                                        <Text color="yellow" dimColor>
                                            +{violation.nodes.length - 1} more instance(s)
                                        </Text>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                    {violations.length > 5 && (
                        <Box marginTop={1}>
                            <Text color="gray">... and {violations.length - 5} more violation types</Text>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Results;
