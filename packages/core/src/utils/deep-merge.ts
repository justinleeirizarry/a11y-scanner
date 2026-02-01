/**
 * Deep merge utility for configuration objects
 */

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object
        ? T[P] extends Array<any>
            ? T[P]
            : DeepPartial<T[P]>
        : T[P];
};

/**
 * Check if a value is a plain object (not null, not array, not function)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep merge two objects, with source values overriding target values.
 * Arrays are replaced entirely (not merged).
 *
 * @param target - The base object
 * @param source - The object with values to merge in
 * @returns A new object with merged values
 */
export function deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: DeepPartial<T>
): T {
    const result = { ...target };

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (sourceValue === undefined) {
                // Skip undefined values in source
                continue;
            }

            if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
                // Recursively merge nested objects
                result[key] = deepMerge(
                    targetValue as Record<string, unknown>,
                    sourceValue as DeepPartial<Record<string, unknown>>
                ) as T[Extract<keyof T, string>];
            } else {
                // Replace value (including arrays)
                result[key] = sourceValue as T[Extract<keyof T, string>];
            }
        }
    }

    return result;
}
