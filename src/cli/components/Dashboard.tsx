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
    const { violationsBySeverity, totalViolations, totalComponents, componentsWithViolations, keyboardIssues } = summary;

    // Calculate total issues including keyboard issues
    const totalIssuesFound = totalViolations + (keyboardIssues || 0);
    const hasIssues = totalIssuesFound > 0;

    // Merge severities
    const critical = violationsBySeverity.critical + (keyboardSummary?.criticalIssues || 0);
    const serious = violationsBySeverity.serious + (keyboardSummary?.seriousIssues || 0);
    const moderate = violationsBySeverity.moderate + (keyboardSummary?.moderateIssues || 0);
    const minor = violationsBySeverity.minor; // Keyboard tests don't have minor issues currently

    return (
        <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
            <Box marginBottom={1}>
                <Text bold>📊 Scan Summary</Text>
            </Box>

            <Box flexDirection="row" justifyContent="space-between">
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Components</Text>
                    <Text bold>{totalComponents}</Text>
                </Box>
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Issues Found</Text>
                    <Text bold color={componentsWithViolations > 0 ? 'yellow' : 'green'}>
                        {componentsWithViolations}
                    </Text>
                </Box>
                <Box flexDirection="column" marginRight={4}>
                    <Text color="gray">Total Violations</Text>
                    <Text bold color={hasIssues ? 'red' : 'green'}>
                        {totalIssuesFound}
                    </Text>
                    {keyboardIssues !== undefined && keyboardIssues > 0 && (
                        <Text color="gray" dimColor>
                            (inc. {keyboardIssues} keyboard)
                        </Text>
                    )}
                </Box>
            </Box>

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
        </Box>
    );
};
