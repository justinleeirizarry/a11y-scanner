/**
 * In-memory store for audit sessions
 * Note: Use Redis/DB in production
 */

export interface AuditSession {
    id: string;
    url: string;
    sessionId: string;
    liveViewUrl: string;
    status: 'pending' | 'running' | 'completed' | 'error';
    findings: AuditFinding[];
    createdAt: Date;
}

export interface AuditFinding {
    criterion: {
        id: string;
        title: string;
        level: string;
    };
    status: 'fail' | 'pass' | 'manual';
    description: string;
    impact: string;
    element?: string;
}

// In-memory store (use Redis/DB in production)
export const auditStore = new Map<string, AuditSession>();

export function getAudit(id: string): AuditSession | undefined {
    return auditStore.get(id);
}

export function setAudit(id: string, audit: AuditSession): void {
    auditStore.set(id, audit);
}

export function getAllAudits(): AuditSession[] {
    return Array.from(auditStore.values());
}
