import React from 'react';
import { Box, Text } from 'ink';
import type { KeyboardTestResults } from '../../types.js';
import { truncateSelector } from '../utils/formatters.js';

interface KeyboardResultsProps {
    results: KeyboardTestResults;
}

export const KeyboardResults: React.FC<KeyboardResultsProps> = ({ results }) => {
    const { tabOrder, focusManagement, shortcuts, summary } = results;

    if (summary.totalIssues === 0) {
        return (
            <Box marginTop={1} padding={1} borderStyle="round" borderColor="green">
                <Text color="green" bold>✅ No keyboard navigation issues found!</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" marginTop={1}>
            <Box marginBottom={1} padding={1} borderStyle="round" borderColor="cyan">
                <Box flexDirection="column">
                    <Text bold underline>🎹 Keyboard Navigation Results</Text>
                    <Box marginTop={1}>
                        <Text>
                            <Text color="gray">Total Issues: </Text>
                            <Text bold color={summary.totalIssues > 0 ? 'red' : 'green'}>
                                {summary.totalIssues}
                            </Text>
                            <Text color="gray"> (</Text>
                            <Text color="magenta">{summary.criticalIssues} critical</Text>
                            <Text color="gray">, </Text>
                            <Text color="red">{summary.seriousIssues} serious</Text>
                            <Text color="gray">, </Text>
                            <Text color="yellow">{summary.moderateIssues} moderate</Text>
                            <Text color="gray">)</Text>
                        </Text>
                    </Box>
                </Box>
            </Box>

            {/* Tab Order Issues */}
            {tabOrder.violations.length > 0 && (
                <Box flexDirection="column" marginBottom={1} padding={1} borderStyle="single" borderColor="yellow">
                    <Text bold color="yellow">⚠ Tab Order Issues ({tabOrder.violations.length})</Text>
                    <Box flexDirection="column" marginTop={1} marginLeft={2}>
                        {tabOrder.violations.slice(0, 5).map((violation, idx) => (
                            <Box key={idx} marginBottom={1}>
                                <Text>
                                    <Text color="red">• </Text>
                                    <Text bold>{violation.type}: </Text>
                                    <Text dimColor>{truncateSelector(violation.element)}</Text>
                                </Text>
                                <Box marginLeft={2}>
                                    <Text color="gray">{violation.details}</Text>
                                </Box>
                            </Box>
                        ))}
                        {tabOrder.violations.length > 5 && (
                            <Text color="gray" dimColor>
                                ... and {tabOrder.violations.length - 5} more
                            </Text>
                        )}
                    </Box>
                </Box>
            )}

            {/* Focus Indicator Issues */}
            {focusManagement.focusIndicatorIssues.length > 0 && (
                <Box flexDirection="column" marginBottom={1} padding={1} borderStyle="single" borderColor="red">
                    <Text bold color="red">🎯 Focus Indicator Issues ({focusManagement.focusIndicatorIssues.length})</Text>
                    <Box flexDirection="column" marginTop={1} marginLeft={2}>
                        {focusManagement.focusIndicatorIssues.slice(0, 5).map((issue, idx) => (
                            <Box key={idx} marginBottom={1}>
                                <Text>
                                    <Text color="red">• </Text>
                                    <Text bold>{issue.issue}: </Text>
                                    <Text dimColor>{truncateSelector(issue.element)}</Text>
                                </Text>
                                <Box marginLeft={2}>
                                    <Text color="gray">{issue.details}</Text>
                                </Box>
                            </Box>
                        ))}
                        {focusManagement.focusIndicatorIssues.length > 5 && (
                            <Text color="gray" dimColor>
                                ... and {focusManagement.focusIndicatorIssues.length - 5} more
                            </Text>
                        )}
                    </Box>
                </Box>
            )}

            {/* Skip Links */}
            {!focusManagement.skipLinksWorking && (
                <Box marginBottom={1} padding={1} borderStyle="single" borderColor="yellow">
                    <Text>
                        <Text color="yellow" bold>⚠ Skip Links: </Text>
                        <Text>{focusManagement.skipLinkDetails}</Text>
                    </Text>
                </Box>
            )}

            {/* Custom Widgets */}
            {shortcuts.customWidgets.length > 0 && (
                <Box flexDirection="column" marginBottom={1} padding={1} borderStyle="single" borderColor="cyan">
                    <Text bold color="cyan">🔧 Custom Widgets ({shortcuts.customWidgets.length})</Text>
                    <Box flexDirection="column" marginTop={1} marginLeft={2}>
                        {shortcuts.customWidgets.map((widget, idx) => (
                            <Box key={idx}>
                                <Text>
                                    <Text color={widget.keyboardSupport === 'full' ? 'green' : widget.keyboardSupport === 'partial' ? 'yellow' : 'red'}>
                                        {widget.keyboardSupport === 'full' ? '✓' : widget.keyboardSupport === 'partial' ? '⚠' : '✗'}
                                    </Text>
                                    <Text> {widget.role}: </Text>
                                    <Text dimColor>{truncateSelector(widget.element)}</Text>
                                    {widget.issues.length > 0 && (
                                        <Text color="gray"> ({widget.issues.join(', ')})</Text>
                                    )}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Summary Stats */}
            <Box marginTop={1} padding={1} borderStyle="round" borderColor="gray">
                <Text color="gray">
                    Found {tabOrder.totalFocusableElements} focusable elements
                    {tabOrder.visualOrderMismatches.length > 0 && (
                        <Text>, {tabOrder.visualOrderMismatches.length} visual order mismatches</Text>
                    )}
                </Text>
            </Box>
        </Box>
    );
};
