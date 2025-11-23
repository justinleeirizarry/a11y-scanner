import React from 'react';
import { render, Box, Text } from 'ink';
import { TreeViewer } from '../src/cli/components/TreeViewer.js';
import { ViolationCard } from '../src/cli/components/ViolationCard.js';
import type { AttributedViolation } from '../src/types.js';

const mockViolations: AttributedViolation[] = [
    {
        id: 'button-name',
        impact: 'critical',
        description: 'Ensure buttons have discernible text',
        help: 'Buttons must have discernible text',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
        nodes: [
            {
                component: 'Button',
                componentPath: ['App', 'c', 'h', 'Layout', 'p', 'Header', 'Button'],
                userComponentPath: ['App', 'Layout', 'Header', 'Button'],
                componentType: 'component',
                html: '<button></button>',
                htmlSnippet: '<button>',
                cssSelector: 'button',
                target: ['button'],
                failureSummary: 'Fix any of the following:\n  Element does not have inner text that is visible to screen readers',
                isFrameworkComponent: false
            }
        ]
    },
    {
        id: 'image-alt',
        impact: 'serious',
        description: 'Images must have alternate text',
        help: 'Images must have alternate text',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
        nodes: [
            {
                component: 'Image',
                componentPath: ['App', 'Layout', '__next_internal', 'Sidebar', 'Anonymous', 'UserProfile', 'Image'],
                userComponentPath: ['App', 'Layout', 'Sidebar', 'UserProfile', 'Image'],
                componentType: 'component',
                html: '<img>',
                htmlSnippet: '<img>',
                cssSelector: 'img',
                target: ['img'],
                failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute',
                isFrameworkComponent: false
            }
        ]
    }
];

const App = () => {
    return (
        <Box flexDirection="column" padding={1}>
            <Box borderStyle="single" borderColor="gray" padding={1} marginBottom={1}>
                <Text>Component Hierarchy</Text>
                <TreeViewer violations={mockViolations} />
            </Box>

            <Box borderStyle="single" borderColor="gray" padding={1}>
                <Text>Violation Cards</Text>
                {mockViolations.map((v, i) => (
                    <ViolationCard key={i} violation={v} index={i + 1} />
                ))}
            </Box>
        </Box>
    );
};

render(<App />);
