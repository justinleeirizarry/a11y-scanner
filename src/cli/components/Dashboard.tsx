import React from 'react';
import { Box, Text } from 'ink';
import { ScanResults } from '../../types.js';

interface DashboardProps {
    summary: ScanResults['summary'];
}

export const Dashboard: React.FC<DashboardProps> = ({ summary }) => {
    const { violationsBySeverity, totalViolations, totalComponents, componentsWithViolations } = summary;

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
                    <Text bold color={totalViolations > 0 ? 'red' : 'green'}>
                        {totalViolations}
                    </Text>
                </Box>
            </Box>

            <Box marginTop={1} borderStyle="single" borderColor="gray" flexDirection="row" justifyContent="space-around">
                <Box flexDirection="column" alignItems="center">
                    <Text color="red" bold>{violationsBySeverity.critical}</Text>
                    <Text color="red">Critical</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="yellow" bold>{violationsBySeverity.serious}</Text>
                    <Text color="yellow">Serious</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="cyan" bold>{violationsBySeverity.moderate}</Text>
                    <Text color="cyan">Moderate</Text>
                </Box>
                <Box flexDirection="column" alignItems="center">
                    <Text color="green" bold>{violationsBySeverity.minor}</Text>
                    <Text color="green">Minor</Text>
                </Box>
            </Box>
        </Box>
    );
};
