import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface TestGeneratorProps {
    url: string;
    stage: 'idle' | 'initializing' | 'navigating' | 'discovering' | 'generating' | 'complete' | 'error';
    elementsFound?: number;
}

const TestGenerator: React.FC<TestGeneratorProps> = ({ url, stage, elementsFound }) => {
    const getStageMessage = () => {
        switch (stage) {
            case 'initializing':
                return 'Initializing Stagehand AI...';
            case 'navigating':
                return `Navigating to ${url}...`;
            case 'discovering':
                return 'Discovering interactive elements...';
            case 'generating':
                return `Generating Playwright test (${elementsFound || 0} elements found)...`;
            case 'complete':
                return 'Test generation complete!';
            default:
                return 'Processing...';
        }
    };

    const getIcon = () => {
        if (stage === 'complete') {
            return '✅';
        }
        return <Spinner type="dots" />;
    };

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">
                    🧪 Test Generation Mode
                </Text>
            </Box>

            <Box>
                <Text color="green">
                    {getIcon()}
                </Text>
                <Text> {getStageMessage()}</Text>
            </Box>

            {stage === 'discovering' && elementsFound !== undefined && elementsFound > 0 && (
                <Box marginTop={1}>
                    <Text color="gray">
                        Found {elementsFound} interactive elements so far...
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default TestGenerator;
