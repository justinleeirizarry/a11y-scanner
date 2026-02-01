import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import { Banner } from './Banner.js';

describe('Banner Component', () => {
    it('should render title', () => {
        const { lastFrame } = render(<Banner />);
        expect(lastFrame()).toContain('██████╗');
    });
});
