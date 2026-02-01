/**
 * Utility functions for HTML snippet extraction
 */

/**
 * Extract a readable HTML snippet from an element
 */
export function extractHtmlSnippet(html: string, maxLength: number = 200): string {
    // Remove excessive whitespace
    let snippet = html.replace(/\s+/g, ' ').trim();

    if (snippet.length > maxLength) {
        snippet = snippet.substring(0, maxLength) + '...';
    }

    return snippet;
}
