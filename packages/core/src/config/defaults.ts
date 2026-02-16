/**
 * Default configuration values for the scanner
 */

export const DEFAULT_CONFIG = {
    browser: {
        headless: true,
        timeout: 30000,
        stabilizationDelay: 3000,
        maxNavigationWaits: 3,
        navigationCheckInterval: 1000,
        networkIdleTimeout: 5000,
        postNavigationDelay: 2000,
    },
    scan: {
        maxRetries: 3,
        retryDelayBase: 2000,
        maxElementsToCheck: 100, // For React detection
    },
    framework: {
        // Framework component patterns to filter out
        patterns: [
            // Next.js
            'ServerRoot',
            'AppRouter',
            'RootErrorBoundary',
            'ErrorBoundary',
            'ErrorBoundaryHandler',
            'NotFoundErrorBoundary',
            'RedirectErrorBoundary',
            'RedirectBoundary',
            'InnerLayoutRouter',
            'OuterLayoutRouter',
            'ScrollAndFocusHandler',
            'StaticGenerationSearchParamsBailoutProvider',

            // React Router
            'RouterProvider',
            'DataRouterContext',
            'LocationContext',
            'RouteContext',

            // Common HOCs
            'Context.Provider',
            'Context.Consumer',
            'ForwardRef',
            'Memo',

            // Generic
            'Root',
            'App',
            'Fragment',
        ],
    },
} as const;

export type ScannerConfig = typeof DEFAULT_CONFIG;
