import React from 'react';
import { Box, Text } from 'ink';
import type { AttributedViolation } from '../../types.js';

interface TreeViewerProps {
    violations: AttributedViolation[];
}

// Extract element types that have violations
const getViolationElements = (violations: AttributedViolation[]): Map<string, number> => {
    const elementMap = new Map<string, number>();
    violations.forEach(violation => {
        violation.nodes.forEach(node => {
            try {
                if (node.target && Array.isArray(node.target) && node.target.length > 0) {
                    // Extract element type from first selector (e.g., "button" from "button.flex.items")
                    const selector = node.target[0];
                    if (typeof selector === 'string') {
                        const elementMatch = selector.match(/^([a-z0-9]+)/i);
                        if (elementMatch) {
                            const element = elementMatch[1];
                            elementMap.set(element, (elementMap.get(element) || 0) + 1);
                        }
                    }
                }
            } catch (e) {
                // Silently skip on error
            }
        });
    });
    return elementMap;
};

export const TreeViewer: React.FC<TreeViewerProps> = ({ violations }) => {
    if (!violations || violations.length === 0) return null;

    const violationElements = getViolationElements(violations);

    // If no elements were found, it might be a data structure issue - just show a count
    if (violationElements.size === 0) {
        return (
            <Box flexDirection="column" marginTop={1} marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
                <Text bold underline>Accessibility Issues Found</Text>
                <Box marginTop={1}>
                    <Text color="yellow">
                        {violations.length} violation{violations.length > 1 ? 's' : ''} detected. See details below.
                    </Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" marginTop={1} marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
            <Text bold underline>Elements with Issues</Text>
            <Box marginTop={1}>
                <Text color="gray" dimColor>
                    {violations.length} violation{violations.length > 1 ? 's' : ''} found in the following element types
                </Text>
            </Box>
            <Box marginTop={1} flexDirection="column">
                {Array.from(violationElements.entries()).map(([element, count], index) => (
                    <Box key={index} marginLeft={2}>
                        <Text>
                            <Text color="red">⚠ </Text>
                            <Text bold color="cyan">{element}</Text>
                            <Text color="yellow"> ({count} issue{count > 1 ? 's' : ''})</Text>
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
