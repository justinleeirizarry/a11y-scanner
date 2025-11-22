import type { TechStack } from '../types.js';

/**
 * Detect the tech stack from the page
 * This runs in the browser context to gather information
 */
export function detectTechStack(): TechStack {
    const techStack: TechStack = {
        framework: 'unknown',
        hasTypeScript: false,
        cssFramework: 'none',
    };

    // Detect framework
    if (typeof window !== 'undefined') {
        // Next.js detection
        if ((window as any).__NEXT_DATA__ || document.querySelector('[id^="__next"]')) {
            techStack.framework = 'nextjs';
            const nextData = (window as any).__NEXT_DATA__;
            if (nextData?.buildId) {
                techStack.version = 'App Router detected';
            }
        }
        // Vite detection
        else if ((window as any).__vite__ || document.querySelector('[type="module"][src*="/@vite"]')) {
            techStack.framework = 'vite';
        }
        // Create React App detection
        else if (document.querySelector('[id="root"]') && (window as any).webpackHotUpdate) {
            techStack.framework = 'cra';
        }
        // Remix detection
        else if ((window as any).__remixContext) {
            techStack.framework = 'remix';
        }
        // Gatsby detection
        else if ((window as any).___gatsby) {
            techStack.framework = 'gatsby';
        }

        // Detect CSS framework by checking class patterns
        const bodyClasses = document.body.className;
        const allElements = document.querySelectorAll('*');

        // Tailwind detection (common utility classes)
        let tailwindScore = 0;
        const tailwindPatterns = ['flex', 'grid', 'w-', 'h-', 'bg-', 'text-', 'p-', 'm-'];
        allElements.forEach(el => {
            const classes = el.className;
            if (typeof classes === 'string') {
                tailwindPatterns.forEach(pattern => {
                    if (classes.includes(pattern)) tailwindScore++;
                });
            }
        });

        if (tailwindScore > 10) {
            techStack.cssFramework = 'tailwind';
        }
        // CSS Modules detection (hashed class names)
        else if (bodyClasses.match(/[a-zA-Z]+_[a-zA-Z]+__[a-zA-Z0-9]+/)) {
            techStack.cssFramework = 'css-modules';
        }
        // Styled Components detection
        else if (document.querySelector('[class^="sc-"]')) {
            techStack.cssFramework = 'styled-components';
        }
        // Emotion detection
        else if (document.querySelector('[class^="css-"]')) {
            techStack.cssFramework = 'emotion';
        }

        // TypeScript detection (check for TS-specific attributes or patterns)
        // This is a rough heuristic - we can't definitively detect TS from the browser
        const scripts = Array.from(document.querySelectorAll('script'));
        techStack.hasTypeScript = scripts.some(script =>
            script.src.includes('.tsx') ||
            script.src.includes('.ts') ||
            script.textContent?.includes('__esModule')
        );
    }

    return techStack;
}

/**
 * Format tech stack for display in prompts
 */
export function formatTechStack(techStack: TechStack): string {
    const lines: string[] = [];

    // Framework
    const frameworkNames: Record<string, string> = {
        'nextjs': 'Next.js',
        'vite': 'Vite',
        'cra': 'Create React App',
        'remix': 'Remix',
        'gatsby': 'Gatsby',
        'unknown': 'Unknown/Custom Setup'
    };

    lines.push(`- Framework: ${frameworkNames[techStack.framework] || techStack.framework}`);
    if (techStack.version) {
        lines.push(`  Version: ${techStack.version}`);
    }

    // TypeScript
    lines.push(`- TypeScript: ${techStack.hasTypeScript ? 'Yes' : 'No'}`);

    // CSS Framework
    const cssNames: Record<string, string> = {
        'tailwind': 'Tailwind CSS',
        'css-modules': 'CSS Modules',
        'styled-components': 'Styled Components',
        'emotion': 'Emotion',
        'sass': 'Sass/SCSS',
        'none': 'Plain CSS'
    };
    lines.push(`- CSS: ${cssNames[techStack.cssFramework] || techStack.cssFramework}`);

    return lines.join('\n');
}
