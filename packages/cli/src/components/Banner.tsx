import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';

interface BannerProps {
    url?: string;
    urlLabel?: string;
}

export const Banner: React.FC<BannerProps> = ({ url, urlLabel = 'Scanned' }) => {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Text>
                {`   █████╗ ██████╗ ██╗ █████╗ `}
                <Text color={colors.muted}>{`███████╗ ██╗`}</Text>
            </Text>
            <Text>
                {`  ██╔══██╗██╔══██╗██║██╔══██╗`}
                <Text color={colors.muted}>{`██╔════╝███║`}</Text>
            </Text>
            <Text>
                {`  ███████║██████╔╝██║███████║`}
                <Text color={colors.muted}>{`███████╗╚██║`}</Text>
            </Text>
            <Text>
                {`  ██╔══██║██╔══██╗██║██╔══██║`}
                <Text color={colors.muted}>{`╚════██║ ██║`}</Text>
            </Text>
            <Text>
                {`  ██║  ██║██║  ██║██║██║  ██║`}
                <Text color={colors.muted}>{`███████║ ██║`}</Text>
            </Text>
            <Text>
                {`  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝`}
                <Text color={colors.muted}>{`╚══════╝ ╚═╝`}</Text>
            </Text>
            {url && (
                <>
                    <Text>{` `}</Text>
                    <Text>
                        <Text color={colors.muted}>{`  ${urlLabel}: `}</Text>
                        <Text>{url}</Text>
                    </Text>
                </>
            )}
        </Box>
    );
};
