
import React from 'react';
import { Box, Text } from 'ink';
import type { ScanResults } from '../../types.js';
import { TreeViewer } from './TreeViewer.js';

interface ResultsProps {
    results: ScanResults | null;
    outputFile?: string;
    showTree?: boolean;
    aiPromptFile?: string;
}

const Results: React.FC<ResultsProps> = ({ results, outputFile, aiPromptFile, showTree }) => {
    // Debug logs
    // console.log('Results props:', { showTree, hasTree: !!results?.accessibilityTree });

    // If results are null, render a loading or empty state
    if (!results) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="gray">Loading scan results...</Text>
            </Box>
        );
    }

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

            {aiPromptFile && (
                <Box marginBottom={1}>
                    <Text color="gray">AI Prompt: </Text>
                    <Text color="cyan">{aiPromptFile}</Text>
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

            {/* Accessibility Issues Summary */}
            {showTree && violations.length > 0 && (
                <TreeViewer violations={violations} />
            )}

            {violations.length > 0 && (
                <Box flexDirection="column" marginTop={1}>
                    <Text bold underline>All Issues</Text>
                    {violations.slice(0, 5).map((violation, idx) => {
                        return (
                            <Box key={idx} flexDirection="column" marginTop={1} borderStyle="round" borderColor="gray" padding={1}>
                                {/* Violation Header */}
                                <Box>
                                    <Text color="gray">{idx + 1}. </Text>
                                    <Text bold color="cyan">{violation.id}</Text>
                                    <Text color="gray"> - </Text>
                                    <Text color={
                                        violation.impact === 'critical' ? 'magenta' :
                                            violation.impact === 'serious' ? 'red' :
                                                violation.impact === 'moderate' ? 'yellow' : 'blue'
                                    }>
                                        {violation.impact}
                                    </Text>
                                    <Text color="gray"> ({violation.nodes.length} instance{violation.nodes.length > 1 ? 's' : ''})</Text>
                                </Box>

                                {/* Description */}
                                <Box marginLeft={3} marginTop={1}>
                                    <Text color="yellow">{violation.description}</Text>
                                </Box>

                                {/* WCAG Criteria Badge */}
                                {violation.fixSuggestion?.wcagCriteria && (
                                    <Box marginLeft={3} marginTop={1}>
                                        <Text color="blue">📋 WCAG: </Text>
                                        <Text color="cyan">{violation.fixSuggestion.wcagCriteria}</Text>
                                        {violation.fixSuggestion.wcagLevel && (
                                            <>
                                                <Text color="gray"> - Level </Text>
                                                <Text bold color="magenta">{violation.fixSuggestion.wcagLevel}</Text>
                                            </>
                                        )}
                                    </Box>
                                )}

                                {/* Priority Badge */}
                                {violation.fixSuggestion?.priority && (
                                    <Box marginLeft={3}>
                                        <Text color="blue">⚡ Priority: </Text>
                                        <Text bold color={
                                            violation.fixSuggestion.priority === 'critical' ? 'red' :
                                                violation.fixSuggestion.priority === 'high' ? 'yellow' :
                                                    violation.fixSuggestion.priority === 'medium' ? 'cyan' : 'gray'
                                        }>
                                            {violation.fixSuggestion.priority.toUpperCase()}
                                        </Text>
                                    </Box>
                                )}

                                {/* User Impact */}
                                {violation.fixSuggestion?.userImpact && (
                                    <Box marginLeft={3} marginTop={1} flexDirection="column">
                                        <Text color="magenta" bold>👥 Who is affected:</Text>
                                        <Box marginLeft={2} marginTop={0}>
                                            <Text color="gray">{violation.fixSuggestion.userImpact}</Text>
                                        </Box>
                                    </Box>
                                )}

                                {/* Fix Suggestion */}
                                {violation.fixSuggestion && (
                                    <Box marginLeft={3} marginTop={1} flexDirection="column" borderStyle="single" borderColor="green" padding={1}>
                                        <Text color="green" bold>💡 How to Fix:</Text>
                                        <Box marginTop={0}>
                                            <Text color="green" bold>{violation.fixSuggestion.summary}</Text>
                                        </Box>
                                        <Box marginTop={0}>
                                            <Text color="gray">{violation.fixSuggestion.details}</Text>
                                        </Box>
                                        {violation.fixSuggestion.codeExample && (
                                            <Box marginTop={1} flexDirection="column">
                                                <Text color="blue" dimColor>Example:</Text>
                                                <Text color="blue">{violation.fixSuggestion.codeExample}</Text>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {/* All Instances */}
                                <Box marginLeft={3} marginTop={1} flexDirection="column">
                                    <Text color="cyan" bold>📍 All Instances:</Text>
                                    {violation.nodes.map((node, nodeIdx) => {
                                        const componentName = node.component || 'Unknown';
                                        const displayPath = node.userComponentPath && node.userComponentPath.length > 0
                                            ? node.userComponentPath
                                            : node.componentPath || [];
                                        const componentType = node.componentType;

                                        return (
                                            <Box key={nodeIdx} flexDirection="column" marginTop={1} marginLeft={2} borderStyle="single" borderColor="gray" padding={1}>
                                                {/* Instance Header */}
                                                <Box>
                                                    <Text color="gray">Instance {nodeIdx + 1}: </Text>
                                                    <Text bold color={componentType === 'host' ? 'cyan' : 'blue'}>
                                                        {componentName}
                                                    </Text>
                                                    {componentType && (
                                                        <Text color="gray" dimColor> [{componentType}]</Text>
                                                    )}
                                                </Box>

                                                {/* Component Path */}
                                                {displayPath.length > 0 && (
                                                    <Box marginLeft={2} flexWrap="wrap">
                                                        <Text color="gray" dimColor>Path: </Text>
                                                        {displayPath.map((item, i) => {
                                                            const isReact = /^[A-Z]/.test(item);
                                                            return (
                                                                <Text key={i}>
                                                                    {i > 0 && <Text color="gray" dimColor> {'>'} </Text>}
                                                                    <Text
                                                                        color={isReact ? 'cyan' : 'gray'}
                                                                        bold={isReact}
                                                                        dimColor={!isReact}
                                                                    >
                                                                        {item}
                                                                    </Text>
                                                                </Text>
                                                            );
                                                        })}
                                                    </Box>
                                                )}

                                                {/* CSS Selector */}
                                                {node.cssSelector && (
                                                    <Box marginLeft={2}>
                                                        <Text color="gray" dimColor>Selector: </Text>
                                                        <Text color="cyan">{node.cssSelector}</Text>
                                                    </Box>
                                                )}

                                                {/* HTML Snippet */}
                                                {node.htmlSnippet && (
                                                    <Box marginLeft={2} flexDirection="column">
                                                        <Text color="gray" dimColor>HTML:</Text>
                                                        <Text color="gray">{node.htmlSnippet}</Text>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
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
