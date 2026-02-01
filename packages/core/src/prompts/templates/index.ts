import type { PromptTemplate } from '../../types.js';
import { fixAllTemplate } from './fix-all.js';
import { explainTemplate } from './explain.js';
import { quickWinsTemplate } from './quick-wins.js';
import { criticalOnlyTemplate } from './critical-only.js';

export const templates: Record<string, PromptTemplate> = {
    'fix-all': fixAllTemplate,
    'explain': explainTemplate,
    'quick-wins': quickWinsTemplate,
    'critical-only': criticalOnlyTemplate,
};

export function getTemplate(name: string): PromptTemplate | null {
    return templates[name] || null;
}

export function listTemplates(): PromptTemplate[] {
    return Object.values(templates);
}
