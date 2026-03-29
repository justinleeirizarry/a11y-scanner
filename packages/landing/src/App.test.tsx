import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { App } from './App';

describe('Landing page accessibility', () => {
  it('all aria-labelledby references resolve to real IDs', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('[aria-labelledby]');

    expect(sections.length).toBeGreaterThan(0);

    sections.forEach((section) => {
      const labelId = section.getAttribute('aria-labelledby')!;
      const target = container.querySelector(`#${labelId}`);
      expect(target).not.toBeNull();
      expect(target?.tagName).toBe('H2');
    });
  });

  it('has correct landmark structure (banner, main, contentinfo, navigation)', () => {
    const { container } = render(<App />);

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(container.querySelector('nav[aria-label="External links"]')).toBeInTheDocument();
  });

  it('skip link points to #main and target exists', () => {
    const { container } = render(<App />);
    const skipLink = container.querySelector('a.skip-link');

    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
    expect(container.querySelector('#main')).toBeInTheDocument();
  });

  it('footer contains a nav landmark', () => {
    const { container } = render(<App />);
    const footer = container.querySelector('footer');
    const nav = footer?.querySelector('nav');

    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'External links');
  });

  it('external links indicate they open in a new tab', () => {
    const { container } = render(<App />);
    const externalLinks = container.querySelectorAll('a[target="_blank"]');

    expect(externalLinks.length).toBeGreaterThan(0);

    externalLinks.forEach((link) => {
      const srOnly = link.querySelector('.sr-only');
      expect(srOnly).not.toBeNull();
      expect(srOnly?.textContent).toContain('opens in new tab');
    });
  });

  it('heading hierarchy is sequential with no skipped levels', () => {
    const { container } = render(<App />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const levels = Array.from(headings).map((h) => parseInt(h.tagName[1]));

    expect(levels[0]).toBe(1);

    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });

  it('all sections have unique aria-labelledby values', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('[aria-labelledby]');
    const ids = Array.from(sections).map((s) => s.getAttribute('aria-labelledby'));
    const unique = new Set(ids);

    expect(unique.size).toBe(ids.length);
  });

  it('decorative terminal dots are hidden from screen readers', () => {
    const { container } = render(<App />);
    const terminalHeaders = container.querySelectorAll('.terminal-header');

    terminalHeaders.forEach((header) => {
      expect(header).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('MCP workflow step numbers are decorative', () => {
    const { container } = render(<App />);
    const stepNums = container.querySelectorAll('.mcp-step-num');

    stepNums.forEach((num) => {
      expect(num).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('confidence grid and MCP tools have accessible list roles', () => {
    const { container } = render(<App />);

    const confidenceGrid = container.querySelector('[aria-label="Confidence levels"]');
    expect(confidenceGrid).toBeInTheDocument();
    expect(confidenceGrid).toHaveAttribute('role', 'list');

    const mcpToolsList = container.querySelector('[aria-label="Available MCP tools"]');
    expect(mcpToolsList).toBeInTheDocument();
    expect(mcpToolsList).toHaveAttribute('role', 'list');
  });
});
