/**
 * Truncates a CSS selector to a manageable length for display
 * Keeps the last few parts of the selector as they are usually most relevant
 */
export function truncateSelector(selector: string, maxLength: number = 60): string {
    if (!selector || selector.length <= maxLength) {
        return selector;
    }

    // Split by common separators to try to keep meaningful chunks
    // We want to keep the end of the selector
    const parts = selector.split(' > ');

    if (parts.length === 1) {
        // Just one long string, truncate the beginning
        return '...' + selector.slice(-(maxLength - 3));
    }

    let result = parts[parts.length - 1];
    let i = parts.length - 2;

    // Add parts from right to left until we exceed length
    while (i >= 0) {
        const nextPart = parts[i] + ' > ';
        if ((nextPart + result).length + 3 > maxLength) {
            return '... > ' + result;
        }
        result = nextPart + result;
        i--;
    }

    return '... > ' + result;
}
