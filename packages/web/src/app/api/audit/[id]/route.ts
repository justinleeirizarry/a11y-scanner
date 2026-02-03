import { NextResponse } from 'next/server';
import { auditStore } from '@/lib/audit-store';

/**
 * GET /api/audit/[id] - Get audit information
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const audit = auditStore.get(params.id);

    if (!audit) {
        return NextResponse.json(
            { error: 'Audit not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({
        id: audit.id,
        url: audit.url,
        sessionId: audit.sessionId,
        liveViewUrl: audit.liveViewUrl,
        status: audit.status,
        findingsCount: audit.findings.length,
        createdAt: audit.createdAt,
    });
}

/**
 * DELETE /api/audit/[id] - Cancel/delete an audit
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const audit = auditStore.get(params.id);

    if (!audit) {
        return NextResponse.json(
            { error: 'Audit not found' },
            { status: 404 }
        );
    }

    auditStore.delete(params.id);

    return NextResponse.json({ success: true });
}
