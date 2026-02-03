import React from 'react';
import { Box, Text } from 'ink';
import type { ScanResults } from '@accessibility-toolkit/core';
import { colors } from '../colors.js';

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
    const minor = violationsBySeverity.minor;

    // Get WCAG level counts
    const wcag = violationsByWcagLevel || {
        wcag2a: 0, wcag2aa: 0, wcag2aaa: 0,
        wcag21a: 0, wcag21aa: 0, wcag22aa: 0, bestPractice: 0
    };

    // Calculate combined WCAG levels for display
    const wcagA = wcag.wcag2a + wcag.wcag21a;
    const wcagAA = wcag.wcag2aa + wcag.wcag21aa + wcag.wcag22aa;

    return (
        <Box flexDirection="column" marginBottom={1}>
            {/* Main stats line */}
            <Box flexDirection="row" gap={1}>
                <Text color={colors.muted}>Components:</Text>
                <Text bold>{totalComponents}</Text>
                <Text color={colors.muted}>({componentsWithViolations} with issues)</Text>
                <Text color={colors.muted}>│</Text>
                <Text color={colors.muted}>Violations:</Text>
                <Text bold color={hasIssues ? colors.critical : colors.success}>{totalIssuesFound}</Text>
                <Text color={colors.muted}>│</Text>
                <Text color={colors.muted}>Passes:</Text>
                <Text bold color={colors.success}>{totalPasses}</Text>
                {totalIncomplete > 0 && (
                    <>
                        <Text color={colors.muted}>│</Text>
                        <Text color={colors.muted}>Review:</Text>
                        <Text bold color={colors.serious}>{totalIncomplete}</Text>
                    </>
                )}
            </Box>

            {/* Severity breakdown line */}
            {hasIssues && (
                <Box flexDirection="row" gap={1}>
                    <Text color={colors.muted}>Severity:</Text>
                    {critical > 0 && <Text color={colors.critical}>{critical} critical</Text>}
                    {critical > 0 && (serious > 0 || moderate > 0 || minor > 0) && <Text color={colors.muted}>·</Text>}
                    {serious > 0 && <Text color={colors.serious}>{serious} serious</Text>}
                    {serious > 0 && (moderate > 0 || minor > 0) && <Text color={colors.muted}>·</Text>}
                    {moderate > 0 && <Text color={colors.moderate}>{moderate} moderate</Text>}
                    {moderate > 0 && minor > 0 && <Text color={colors.muted}>·</Text>}
                    {minor > 0 && <Text color={colors.minor}>{minor} minor</Text>}
                    {keyboardIssues !== undefined && keyboardIssues > 0 && (
                        <>
                            <Text color={colors.muted}>│</Text>
                            <Text color={colors.muted} dimColor>inc. {keyboardIssues} keyboard</Text>
                        </>
                    )}
                </Box>
            )}

            {/* WCAG level breakdown - only show if there are violations */}
            {totalViolations > 0 && violationsByWcagLevel && (
                <Box flexDirection="row" gap={1}>
                    <Text color={colors.muted}>WCAG:</Text>
                    {wcagA > 0 && <Text color={colors.critical}>A: {wcagA}</Text>}
                    {wcagAA > 0 && <Text color={colors.serious}>AA: {wcagAA}</Text>}
                    {wcag.wcag2aaa > 0 && <Text color={colors.moderate}>AAA: {wcag.wcag2aaa}</Text>}
                    {wcag.bestPractice > 0 && <Text color={colors.muted}>Best Practice: {wcag.bestPractice}</Text>}
                </Box>
            )}
        </Box>
    );
};
