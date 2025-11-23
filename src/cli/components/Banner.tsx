import React from 'react';
import { Box, Text } from 'ink';

export const Banner: React.FC = () => {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Text>
                <Text color="#61dafb">  ____                 _        </Text>
                <Text color="#ffffff">    _    _ _       </Text>
                <Text color="#61dafb">  ____                                  </Text>
            </Text>
            <Text>
                <Text color="#61dafb"> |  _ \ ___  __ _  ___| |_      </Text>
                <Text color="#ffffff">   / \  / / |_   _ </Text>
                <Text color="#61dafb"> / ___|  ___ __ _ _ __  _ __   ___ _ __ </Text>
            </Text>
            <Text>
                <Text color="#61dafb"> | |_) / _ \/ _` |/ __| __|____</Text>
                <Text color="#ffffff">  / _ \ | | | | | |</Text>
                <Text color="#61dafb"> \___ \ / __/ _` | '_ \| '_ \ / _ \ '__|</Text>
            </Text>
            <Text>
                <Text color="#61dafb"> |  _ &lt;  __/ (_| | (__| ||_____</Text>
                <Text color="#ffffff"> / ___ \| | | |_| |</Text>
                <Text color="#61dafb">  ___) | (_| (_| | | | | | | |  __/ |   </Text>
            </Text>
            <Text>
                <Text color="#61dafb"> |_| \_\___|\__,_|\___|\__|    </Text>
                <Text color="#ffffff">/_/   \_\_|_|\__, |</Text>
                <Text color="#61dafb"> |____/ \___\__,_|_| |_|_| |_|\___|_|   </Text>
            </Text>
            <Text>
                <Text color="#ffffff">                                       |___/ </Text>
            </Text>
        </Box>
    );
};
