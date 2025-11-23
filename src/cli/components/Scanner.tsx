import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { Banner } from './Banner.js';

interface ScannerProps {
    url: string;
    browser: string;
}

const Scanner: React.FC<ScannerProps> = ({ url, browser }) => {
    return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
            <Banner />

            <Box flexDirection="column" marginBottom={1}>
                <Box>
                    <Text color="gray">Target:  </Text>
                    <Text bold>{url}</Text>
                </Box>
                <Box>
                    <Text color="gray">Browser: </Text>
                    <Text>{browser}</Text>
                </Box>
            </Box>

            <Box borderStyle="single" borderColor="gray" paddingX={1}>
                <Text color="green">
                    <Spinner type="dots" />
                </Text>
                <Text>  Analyzing accessibility tree and components...</Text>
            </Box>
        </Box>
    );
};

export default Scanner;
