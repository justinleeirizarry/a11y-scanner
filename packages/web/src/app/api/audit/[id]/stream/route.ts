import { auditStore } from '@/lib/audit-store';

/**
 * GET /api/audit/[id]/stream - SSE stream for real-time audit updates
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const audit = auditStore.get(params.id);

    if (!audit) {
        return new Response('Audit not found', { status: 404 });
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    let lastFindingIndex = 0;

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial progress
            controller.enqueue(
                encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'Starting audit...' })}\n\n`)
            );

            // Poll for updates
            const interval = setInterval(() => {
                const currentAudit = auditStore.get(params.id);

                if (!currentAudit) {
                    controller.enqueue(
                        encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Audit not found' })}\n\n`)
                    );
                    clearInterval(interval);
                    controller.close();
                    return;
                }

                // Send new findings
                while (lastFindingIndex < currentAudit.findings.length) {
                    const finding = currentAudit.findings[lastFindingIndex];
                    controller.enqueue(
                        encoder.encode(`event: finding\ndata: ${JSON.stringify(finding)}\n\n`)
                    );
                    lastFindingIndex++;
                }

                // Send progress updates
                if (currentAudit.status === 'running') {
                    controller.enqueue(
                        encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: `Analyzing page... Found ${currentAudit.findings.length} issues` })}\n\n`)
                    );
                }

                // Check if complete
                if (currentAudit.status === 'completed') {
                    controller.enqueue(
                        encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'Audit complete' })}\n\n`)
                    );
                    controller.enqueue(
                        encoder.encode(`event: complete\ndata: ${JSON.stringify({ totalFindings: currentAudit.findings.length })}\n\n`)
                    );
                    clearInterval(interval);
                    controller.close();
                }

                // Check if error
                if (currentAudit.status === 'error') {
                    controller.enqueue(
                        encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Audit failed' })}\n\n`)
                    );
                    clearInterval(interval);
                    controller.close();
                }
            }, 500);

            // Handle client disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
