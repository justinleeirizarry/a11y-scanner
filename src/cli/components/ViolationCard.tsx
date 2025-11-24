import React from 'react';
import { Box, Text } from 'ink';
import { AttributedViolation } from '../../types.js';

interface ViolationCardProps {
    violation: AttributedViolation;
    index: number;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({ violation, index }) => {
    const impactColor =
        violation.impact === 'critical' ? 'magenta' :
            violation.impact === 'serious' ? 'red' :
                violation.impact === 'moderate' ? 'yellow' : 'blue';

    return (
        <Box flexDirection="column" marginTop={1} padding={1}>
            {/* Separator */}
            <Box marginBottom={1}>
                <Text color="gray">──────────────────────────────────────────────────</Text>
            </Box>

            {/* Header */}
            <Box justifyContent="space-between">
                <Box>
                    <Text color="gray">{index}. </Text>
                    <Text bold color="cyan">{violation.id}</Text>
                </Box>
                <Box>
                    <Text bold color={impactColor} backgroundColor={impactColor === 'yellow' ? undefined : undefined}>
                        {' ' + violation.impact.toUpperCase() + ' '}
                    </Text>
                </Box>
            </Box>

            {/* Description */}
            <Box marginTop={1}>
                <Text>{violation.description}</Text>
            </Box>

            {/* Fix Suggestion */}
            {violation.fixSuggestion && (
                <Box marginTop={1} flexDirection="column" padding={1}>
                    <Text color="green" bold>💡 How to Fix:</Text>
                    <Text>{violation.fixSuggestion.summary}</Text>

                    {violation.fixSuggestion.codeExample && (
                        <Box marginTop={1} flexDirection="column">
                            <Text color="gray" dimColor>Example:</Text>
                            <Text color="blue">{violation.fixSuggestion.codeExample}</Text>
                        </Box>
                    )}
                </Box>
            )}

            {/* Instances Summary */}
            <Box marginTop={1}>
                <Text color="gray" dimColor>
                    Found in {violation.nodes.length} instance{violation.nodes.length !== 1 ? 's' : ''}:
                </Text>
            </Box>

            {/* List all instances */}
            <Box flexDirection="column" marginLeft={2}>
                {violation.nodes.map((node, i) => {
                    // Extract the nearest React component from the path
                    const rawPath = node.userComponentPath && node.userComponentPath.length > 0
                        ? node.userComponentPath
                        : node.componentPath || [];

                    const filteredPath = rawPath.filter(name => {
                        if (name.length <= 2) return false; // Filter minified
                        if (name.includes('Anonymous')) return false;
                        if (name.startsWith('__')) return false;
                        return true;
                    });

                    const componentName = filteredPath.length > 0
                        ? filteredPath[filteredPath.length - 1]
                        : (node.component && node.component.length > 2 ? node.component : 'Unknown Component');

                    return (
                        <Box key={i}>
                            <Text color="gray">- </Text>
                            <Text color="yellow" bold>
                                {componentName}
                            </Text>
                            {node.cssSelector && (
                                <Text color="gray" dimColor> ({node.cssSelector})</Text>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
