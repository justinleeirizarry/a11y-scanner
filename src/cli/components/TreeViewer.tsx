import React, { useState } from 'react';
import { Box, Text } from 'ink';
import type { AttributedViolation } from '../../types.js';

interface TreeViewerProps {
    violations: AttributedViolation[];
}

interface TreeNode {
    name: string;
    children: Map<string, TreeNode>;
    violations: Array<{
        id: string;
        impact: string;
        description: string;
        element: string;
    }>;
}

// Helper to build the tree structure from violations
const buildTree = (violations: AttributedViolation[]): TreeNode => {
    const root: TreeNode = { name: 'root', children: new Map(), violations: [] };

    violations.forEach(violation => {
        violation.nodes.forEach(node => {
            let current = root;

            // Use component path if available, otherwise fallback to "Unknown Component"
            const rawPath = node.componentPath && node.componentPath.length > 0
                ? node.componentPath
                : ['Unknown Component'];

            // Filter out minified components (single letters) and internal Next.js wrappers
            const path = rawPath.filter(name => {
                // Keep meaningful names (longer than 2 chars)
                if (name.length > 2) return true;
                // Filter out single/double letter minified names
                return false;
            }).filter(name =>
                // Filter out common internal wrappers
                !name.includes('Anonymous') &&
                !name.startsWith('__')
            );

            // If path becomes empty after filtering, use a fallback
            const finalPath = path.length > 0 ? path : ['Unknown Component'];

            // Traverse/Build the tree
            finalPath.forEach(componentName => {
                if (!current.children.has(componentName)) {
                    current.children.set(componentName, {
                        name: componentName,
                        children: new Map(),
                        violations: []
                    });
                }
                current = current.children.get(componentName)!;
            });

            // Add violation to the leaf component
            current.violations.push({
                id: violation.id,
                impact: violation.impact,
                description: violation.description,
                element: node.target[0] || 'element'
            });
        });
    });

    return root;
};

const TreeNodeView: React.FC<{ node: TreeNode; depth?: number; isLast?: boolean }> = ({ node, depth = 0, isLast = false }) => {
    const hasChildren = node.children.size > 0;
    const hasViolations = node.violations.length > 0;

    // Don't render the artificial root
    if (node.name === 'root') {
        return (
            <Box flexDirection="column">
                {Array.from(node.children.values()).map((child, i, arr) => (
                    <TreeNodeView
                        key={child.name}
                        node={child}
                        depth={0}
                        isLast={i === arr.length - 1}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box flexDirection="column">
            {/* Component Node */}
            <Box>
                <Text color="gray">{' '.repeat(depth)}</Text>
                <Text color="gray">{hasChildren ? '▼ ' : '▶ '}</Text>

                {/* Highlight React Components (Capitalized) differently from HTML elements */}
                {/^[A-Z]/.test(node.name) ? (
                    <Text color="yellow" bold>{node.name}</Text>
                ) : (
                    <Text color="blue">{node.name}</Text>
                )}

                {hasViolations && (
                    <Text color="red" bold> ({node.violations.length})</Text>
                )}
            </Box>

            {/* Violations */}
            {hasViolations && node.violations.map((v, i) => (
                <Box key={`${v.id}-${i}`} marginLeft={depth + 2}>
                    <Text color="red">⚠ </Text>
                    <Text bold>{v.id}: </Text>
                    <Text dimColor>{v.description}</Text>
                </Box>
            ))}

            {/* Children */}
            {Array.from(node.children.values()).map((child, i, arr) => (
                <TreeNodeView
                    key={child.name}
                    node={child}
                    depth={depth + 1}
                    isLast={i === arr.length - 1}
                />
            ))}
        </Box>
    );
};

export const TreeViewer: React.FC<TreeViewerProps> = ({ violations }) => {
    if (!violations || violations.length === 0) return null;

    const root = buildTree(violations);

    return (
        <Box flexDirection="column" marginTop={1} marginBottom={1} borderStyle="round" borderColor="gray" padding={1}>
            <Text bold underline>Component Hierarchy</Text>
            <Box marginTop={1} flexDirection="column">
                <TreeNodeView node={root} />
            </Box>
        </Box>
    );
};
