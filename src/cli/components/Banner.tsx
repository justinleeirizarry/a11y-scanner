import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../colors.js';

interface BannerProps {
    url?: string;
}

// Accessible banner color - works on both light and dark backgrounds
// #1976D2 (Material Blue 700) has 4.5:1+ contrast on white and good visibility on black
const BANNER_COLOR = '#1976D2';

export const Banner: React.FC<BannerProps> = ({ url }) => {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██████╗ ███████╗ █████╗  ██████╗████████╗     █████╗  ██╗ ██╗██╗   ██╗`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝    ██╔══██╗███║███║╚██╗ ██╔╝`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██████╔╝█████╗  ███████║██║        ██║       ███████║╚██║╚██║ ╚████╔╝ `}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██╔══██╗██╔══╝  ██╔══██║██║        ██║       ██╔══██║ ██║ ██║  ╚██╔╝  `}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██║  ██║███████╗██║  ██║╚██████╗   ██║       ██║  ██║ ██║ ██║   ██║   `}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝       ╚═╝  ╚═╝ ╚═╝ ╚═╝   ╚═╝   `}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ███████╗ ██████╗ █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗ `}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ██╔════╝██╔════╝██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ███████╗██║     ███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ╚════██║██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ███████║╚██████╗██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║`}
                </Text>
            </Text>
            <Text>
                <Text color={BANNER_COLOR}>
                    {`  ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝`}
                </Text>
            </Text>
            {url && (
                <>
                    <Text>{` `}</Text>
                    <Text>
                        <Text color={colors.muted}>{`  Scanning: `}</Text>
                        <Text color={colors.accent}>{url}</Text>
                    </Text>
                </>
            )}
        </Box>
    );
};
