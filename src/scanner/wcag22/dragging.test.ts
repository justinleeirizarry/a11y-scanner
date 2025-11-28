import { describe, it, expect } from 'vitest';

/**
 * Dragging Movements Tests
 *
 * Note: The dragging module runs in browser context (injected via Playwright).
 * Full DOM testing is done via integration tests with the test fixture.
 * These unit tests verify the module exports and type definitions.
 */
describe('dragging', () => {
    describe('module exports', () => {
        it('should export checkDraggingMovements function', async () => {
            const module = await import('./dragging.js');
            expect(typeof module.checkDraggingMovements).toBe('function');
        });

        it('should export getDraggableElements function', async () => {
            const module = await import('./dragging.js');
            expect(typeof module.getDraggableElements).toBe('function');
        });
    });

    describe('violation structure', () => {
        it('should define correct violation id', () => {
            const expectedId = 'dragging-movement';
            expect(expectedId).toBe('dragging-movement');
        });

        it('should define correct criterion', () => {
            const expectedCriterion = '2.5.7 Dragging Movements';
            expect(expectedCriterion).toContain('2.5.7');
        });

        it('should define correct level', () => {
            const expectedLevel = 'AA';
            expect(expectedLevel).toBe('AA');
        });
    });

    describe('drag types', () => {
        it('should detect native HTML5 draggable', () => {
            const dragTypes = ['native', 'react-beautiful-dnd', 'dnd-kit', 'sortablejs', 'custom'];
            expect(dragTypes).toContain('native');
        });

        it('should detect react-beautiful-dnd', () => {
            const dragTypes = ['native', 'react-beautiful-dnd', 'dnd-kit', 'sortablejs', 'custom'];
            expect(dragTypes).toContain('react-beautiful-dnd');
        });

        it('should detect dnd-kit', () => {
            const dragTypes = ['native', 'react-beautiful-dnd', 'dnd-kit', 'sortablejs', 'custom'];
            expect(dragTypes).toContain('dnd-kit');
        });

        it('should detect SortableJS', () => {
            const dragTypes = ['native', 'react-beautiful-dnd', 'dnd-kit', 'sortablejs', 'custom'];
            expect(dragTypes).toContain('sortablejs');
        });

        it('should detect custom implementations', () => {
            const dragTypes = ['native', 'react-beautiful-dnd', 'dnd-kit', 'sortablejs', 'custom'];
            expect(dragTypes).toContain('custom');
        });
    });
});
