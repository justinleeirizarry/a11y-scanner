/**
 * Error serialization utility for consistent error handling and logging
 */

export interface SerializedError {
    message: string;
    name: string;
    stack?: string;
    code?: string;
    cause?: SerializedError;
}

/**
 * Serialize an error into a plain object that can be safely JSON-stringified.
 *
 * @param error - The error to serialize (can be any type)
 * @returns A SerializedError object
 */
export function serializeError(error: unknown): SerializedError {
    if (error instanceof Error) {
        const serialized: SerializedError = {
            message: error.message,
            name: error.name,
            stack: error.stack,
        };

        // Handle Node.js system errors with error codes
        if ('code' in error && typeof (error as NodeJS.ErrnoException).code === 'string') {
            serialized.code = (error as NodeJS.ErrnoException).code;
        }

        // Recursively serialize cause if present (ES2022 Error.cause)
        if (error.cause !== undefined) {
            serialized.cause = serializeError(error.cause);
        }

        return serialized;
    }

    // Handle non-Error values
    return {
        message: String(error),
        name: 'UnknownError',
    };
}

/**
 * Convert an error to a JSON string for logging or API responses.
 *
 * @param error - The error to convert
 * @param pretty - Whether to pretty-print the JSON (default: false)
 * @returns JSON string representation of the error
 */
export function errorToJSON(error: unknown, pretty = false): string {
    return JSON.stringify(serializeError(error), null, pretty ? 2 : undefined);
}

/**
 * Extract a user-friendly message from an error.
 * This strips stack traces and technical details.
 *
 * @param error - The error to get a message from
 * @returns A string message suitable for user display
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Check if an error has a specific error code (for Node.js system errors).
 *
 * @param error - The error to check
 * @param code - The error code to look for (e.g., 'ENOENT', 'EEXIST')
 * @returns True if the error has the specified code
 */
export function hasErrorCode(error: unknown, code: string): boolean {
    return (
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === code
    );
}
