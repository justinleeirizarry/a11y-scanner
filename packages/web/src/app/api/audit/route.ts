import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auditStore, type AuditSession } from '@/lib/audit-store';

/**
 * POST /api/audit - Start a new accessibility audit
 */
export async function POST(request: Request) {
    try {
        const { url, level = 'AA' } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Check for Browserbase API key
        const apiKey = process.env.BROWSERBASE_API_KEY;
        const projectId = process.env.BROWSERBASE_PROJECT_ID;

        if (!apiKey || !projectId) {
            // Return a mock session for development/testing
            const auditId = randomUUID();
            const sessionId = `mock-${randomUUID()}`;

            const audit: AuditSession = {
                id: auditId,
                url,
                sessionId,
                liveViewUrl: `https://www.browserbase.com/sessions/${sessionId}/live`,
                status: 'pending',
                findings: [],
                createdAt: new Date(),
            };

            auditStore.set(auditId, audit);

            // Start mock audit in background
            startMockAudit(auditId, url);

            return NextResponse.json({
                auditId,
                sessionId,
                liveViewUrl: `https://www.browserbase.com/sessions/${sessionId}/live`,
            });
        }

        // Real Browserbase session
        // Note: In production, you'd use the BrowserbaseClient here
        const auditId = randomUUID();
        const sessionId = `bb-${randomUUID()}`;

        const audit: AuditSession = {
            id: auditId,
            url,
            sessionId,
            liveViewUrl: `https://www.browserbase.com/sessions/${sessionId}/live`,
            status: 'pending',
            findings: [],
            createdAt: new Date(),
        };

        auditStore.set(auditId, audit);

        // Start real audit in background
        // startBrowserbaseAudit(auditId, url, apiKey, projectId);

        return NextResponse.json({
            auditId,
            sessionId,
            liveViewUrl: `https://www.browserbase.com/sessions/${sessionId}/live`,
        });
    } catch (error) {
        console.error('Failed to start audit:', error);
        return NextResponse.json(
            { error: 'Failed to start audit' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/audit - List all audits
 */
export async function GET() {
    const audits = Array.from(auditStore.values()).map(a => ({
        id: a.id,
        url: a.url,
        status: a.status,
        createdAt: a.createdAt,
    }));

    return NextResponse.json({ audits });
}

// Mock audit for development
async function startMockAudit(auditId: string, _url: string) {
    const audit = auditStore.get(auditId);
    if (!audit) return;

    audit.status = 'running';

    // Simulate finding issues over time
    const mockFindings = [
        {
            criterion: { id: '1.1.1', title: 'Non-text Content', level: 'A' },
            status: 'fail' as const,
            description: 'Image missing alt text',
            impact: 'critical',
            element: '<img src="/hero.jpg">',
        },
        {
            criterion: { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA' },
            status: 'fail' as const,
            description: 'Text has insufficient color contrast',
            impact: 'serious',
            element: '<p style="color: #999">Light text</p>',
        },
        {
            criterion: { id: '2.4.4', title: 'Link Purpose', level: 'A' },
            status: 'fail' as const,
            description: 'Link text is not descriptive',
            impact: 'moderate',
            element: '<a href="/page">Click here</a>',
        },
    ];

    for (const finding of mockFindings) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        audit.findings.push(finding);
    }

    audit.status = 'completed';
}
