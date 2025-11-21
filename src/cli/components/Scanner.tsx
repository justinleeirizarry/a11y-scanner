import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface ScannerProps {
    url: string;
    browser: string;
}

const Scanner: React.FC<ScannerProps> = ({ url, browser }) => {
    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text bold color="cyan">🔍 React A11y Scanner</Text>
            </Box>

            <Box>
                <Text color="gray">URL: </Text>
                <Text>{url}</Text>
            </Box>

            <Box>
                <Text color="gray">Browser: </Text>
                <Text>{browser}</Text>
            </Box>

            <Box marginTop={1}>
                <Text color="green">
                    <Spinner type="dots" />
                </Text>
                <Text> Scanning React components...</Text>
            </Box>
        </Box>
    );
};

export default Scanner;
