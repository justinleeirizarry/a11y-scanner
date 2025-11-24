import { describe, it, expect } from 'vitest';
import { truncateSelector } from './formatters.js';

describe('CLI Formatters', () => {
    describe('truncateSelector', () => {
        it('should return selector as is if short enough', () => {
            const selector = 'div > span';
            expect(truncateSelector(selector, 20)).toBe('div > span');
        });

        it('should truncate long selector from the beginning', () => {
            const selector = 'body > div > main > section > article > p > span';
            // Length is 48
            const result = truncateSelector(selector, 20);
            expect(result.length).toBeLessThanOrEqual(20);
            expect(result).toContain('... > ');
            expect(result).toContain('span');
        });

        it('should handle single long selector', () => {
            const selector = 'very-long-class-name-that-exceeds-the-limit';
            const result = truncateSelector(selector, 20);
            expect(result).toBe('...exceeds-the-limit');
        });

        it('should handle empty selector', () => {
            expect(truncateSelector('')).toBe('');
        });
    });
});
