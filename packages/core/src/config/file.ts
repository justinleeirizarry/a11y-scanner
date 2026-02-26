/**
 * Config file loading via cosmiconfig
 *
 * Searches for config in the following places:
 * - `a11y` field in package.json
 * - .a11yrc (JSON or YAML)
 * - .a11yrc.json, .a11yrc.yaml, .a11yrc.yml
 * - a11y.config.js, a11y.config.cjs, a11y.config.mjs
 */
import { cosmiconfig } from 'cosmiconfig';
import type { DeepPartial } from '../utils/deep-merge.js';
import type { ScannerConfig } from './defaults.js';

const explorer = cosmiconfig('a11y');

/**
 * Search for and load a config file from the given directory (or CWD).
 * Returns null if no config file is found.
 */
export async function loadConfigFile(
    searchFrom?: string
): Promise<{ config: DeepPartial<ScannerConfig>; filepath: string } | null> {
    const result = await explorer.search(searchFrom);
    if (!result || result.isEmpty) return null;
    return { config: result.config, filepath: result.filepath };
}
