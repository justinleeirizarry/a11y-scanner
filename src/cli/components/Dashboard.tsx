import React from 'react';
import { Box, Text } from 'ink';
import { ScanResults } from '../../types.js';

interface DashboardProps {
    summary: ScanResults['summary'];
    keyboardSummary?: {
        criticalIssues: number;
        seriousIssues: number;
        moderateIssues: number;
    };
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, keyboardSummary }) => {
    const {
        violationsBySeverity,
        violationsByWcagLevel,
        totalViolations,
        totalPasses,
        totalIncomplete,
        totalComponents,
        componentsWithViolations,
        keyboardIssues
    } = summary;

    // Calculate total issues including keyboard issues
    const totalIssuesFound = totalViolations + (keyboardIssues || 0);
    const hasIssues = totalIssuesFound > 0;

    // Merge severities
    const critical = violationsBySeverity.critical + (keyboardSummary?.criticalIssues || 0);
    const serious = violationsBySeverity.serious + (keyboardSummary?.seriousIssues || 0);
    const moderate = violationsBySeverity.moderate + (keyboardSummary?.moderateIssues || 0);
    const minor = violationsBySeverity.minor; // Keyboard tests don't have minor issues currently

    // Get WCAG level counts
    const wcag = violationsByWcagLevel || {
        wcag2a: 0, wcag2aa: 0, wcag2aaa: 0,
        wcag21a: 0, wcag21aa: 0, wcag22aa: 0, bestPractice: 0
    };

    // Calculate combined WCAG levels for display
    const wcagA = wcag.wcag2a + wcag.wcag21a;
    const wcagAA = wcag.wcag2aa + wcag.wcag21aa + wcag.wcag22aa;

    return (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
            <Box marginBottom={1}>
                <Text bold>Scan Summary</Text>
            </Box>

            {/* Main stats row */}
            <Box flexDirection="row" justifyContent="space-between">
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Components</Text>
                    <Text bold>{totalComponents}</Text>
                </Box>
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">With Issues</Text>
                    <Text bold color={componentsWithViolations > 0 ? 'yellow' : 'green'}>
                        {componentsWithViolations}
                    </Text>
                </Box>
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Violations</Text>
                    <Text bold color={hasIssues ? 'red' : 'green'}>
                        {totalIssuesFound}
                    </Text>
                    {keyboardIssues !== undefined && keyboardIssues > 0 && (
                        <Text color="gray" dimColor>
                            (inc. {keyboardIssues} keyboard)
                        </Text>
                    )}
                </Box>
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Passes</Text>
                    <Text bold color="green">{totalPasses}</Text>
                </Box>
                {totalIncomplete > 0 && (
                    <Box flexDirection="column">
                        <Text color="gray">Manual Review</Text>
                        <Text bold color="yellow">{totalIncomplete}</Text>
                    </Box>
                )}
            </Box>

            {/* Severity breakdown */}
            <Box marginTop={1} borderStyle="single" borderColor="gray" flexDirection="row" justifyContent="space-around">
                <Box flexDirection="column" alignItems="center">
                    <Text color="red" bold>{critical}</Text>
                    <Text color="red">Critical</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="yellow" bold>{serious}</Text>
                    <Text color="yellow">Serious</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="cyan" bold>{moderate}</Text>
                    <Text color="cyan">Moderate</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="green" bold>{minor}</Text>
                    <Text color="green">Minor</Text>
                </Box>
            </Box>

            {/* WCAG level breakdown - only show if there are violations */}
            {totalViolations > 0 && violationsByWcagLevel && (
                <Box marginTop={1} flexDirection="row" justifyContent="flex-start" gap={2}>
                    <Text color="gray">WCAG: </Text>
                    {wcagA > 0 && (
                        <Text color="red">A: {wcagA} </Text>
                    )}
                    {wcagAA > 0 && (
                        <Text color="yellow">AA: {wcagAA} </Text>
                    )}
                    {wcag.wcag2aaa > 0 && (
                        <Text color="cyan">AAA: {wcag.wcag2aaa} </Text>
                    )}
                    {wcag.bestPractice > 0 && (
                        <Text color="gray">Best Practice: {wcag.bestPractice}</Text>
                    )}
                </Box>
            )}
        </Box>
    );
};
