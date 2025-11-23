/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
    validateUrl,
    validateTags,
    validateThreshold,
    validateBrowser,
} from './validation.js';

describe('validateUrl', () => {
    it('should accept valid http URLs', () => {
        const result = validateUrl('http://example.com');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid https URLs', () => {
        const result = validateUrl('https://example.com');
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept localhost URLs', () => {
        const result = validateUrl('http://localhost:3000');
        expect(result.valid).toBe(true);
    });

    it('should reject file:// protocol', () => {
        const result = validateUrl('file:///etc/passwd');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported protocol "file:"');
    });

    it('should reject javascript: protocol', () => {
        const result = validateUrl('javascript:alert(1)');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported protocol "javascript:"');
    });

    it('should reject data: protocol', () => {
        const result = validateUrl('data:text/html,<script>alert(1)</script>');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported protocol "data:"');
    });

    it('should reject malformed URLs', () => {
        const result = validateUrl('not a url');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid URL format');
    });

    it('should reject empty URLs', () => {
        const result = validateUrl('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid URL format');
    });
});

describe('validateBrowser', () => {
    it('should accept chromium', () => {
        const result = validateBrowser('chromium');
        expect(result.valid).toBe(true);
    });

    it('should accept firefox', () => {
        const result = validateBrowser('firefox');
        expect(result.valid).toBe(true);
    });

    it('should accept webkit', () => {
        const result = validateBrowser('webkit');
        expect(result.valid).toBe(true);
    });

    it('should reject invalid browser', () => {
        const result = validateBrowser('invalid');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid browser "invalid"');
        expect(result.error).toContain('chromium, firefox, webkit');
    });

    it('should reject empty browser', () => {
        const result = validateBrowser('');
        expect(result.valid).toBe(false);
    });
});

describe('validateTags', () => {
    it('should accept valid single tag', () => {
        const result = validateTags('wcag2a');
        expect(result.valid).toBe(true);
    });

    it('should accept valid multiple tags', () => {
        const result = validateTags('wcag2a,wcag2aa,best-practice');
        expect(result.valid).toBe(true);
    });

    it('should accept tags with spaces', () => {
        const result = validateTags('wcag2a, wcag2aa, best-practice');
        expect(result.valid).toBe(true);
    });

    it('should accept category tags', () => {
        const result = validateTags('cat.aria,cat.color,cat.forms');
        expect(result.valid).toBe(true);
    });

    it('should reject invalid tags', () => {
        const result = validateTags('invalid-tag');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid tags: invalid-tag');
    });

    it('should reject mixed valid and invalid tags', () => {
        const result = validateTags('wcag2a,invalid-tag,best-practice');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid tags: invalid-tag');
    });

    it('should handle empty tags', () => {
        const result = validateTags('');
        expect(result.valid).toBe(true); // Empty is valid (no filtering)
    });

    it('should handle tags with only commas', () => {
        const result = validateTags(',,,');
        expect(result.valid).toBe(true); // Filters to empty array
    });
});

describe('validateThreshold', () => {
    it('should accept zero', () => {
        const result = validateThreshold(0);
        expect(result.valid).toBe(true);
    });

    it('should accept positive integers', () => {
        const result = validateThreshold(10);
        expect(result.valid).toBe(true);
    });

    it('should accept large numbers', () => {
        const result = validateThreshold(1000);
        expect(result.valid).toBe(true);
    });

    it('should reject negative numbers', () => {
        const result = validateThreshold(-5);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Threshold must be non-negative');
    });

    it('should reject decimal numbers', () => {
        const result = validateThreshold(5.5);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Threshold must be an integer');
    });

    it('should reject unreasonably high numbers', () => {
        const result = validateThreshold(99999);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('unreasonably high');
    });
});
