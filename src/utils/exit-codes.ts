/**
 * Standardized exit codes for the application
 */

export const EXIT_CODES = {
    /** Successful execution */
    SUCCESS: 0,
    /** General runtime error */
    RUNTIME_ERROR: 1,
    /** Input validation error (invalid URL, flags, etc.) */
    VALIDATION_ERROR: 2,
    /** Accessibility violations found (CI mode) */
    VIOLATIONS_FOUND: 1,
} as const;

export type ExitCode = typeof EXIT_CODES[keyof typeof EXIT_CODES];

/**
 * Set the process exit code without immediately exiting.
 * This allows cleanup code to run before the process exits.
 */
export function setExitCode(code: ExitCode): void {
    process.exitCode = code;
}

/**
 * Exit the process immediately with the given code.
 * Use sparingly - prefer setExitCode() to allow cleanup.
 */
export function exitWithCode(code: ExitCode): never {
    process.exit(code);
}
