'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LiveView } from '@/components/LiveView';
import { IssuesFeed } from '@/components/IssuesFeed';

interface AuditInfo {
    sessionId: string;
    liveViewUrl: string;
    url: string;
    status: 'running' | 'completed' | 'error';
}

export default function AuditPage() {
    const params = useParams();
    const auditId = params.id as string;
    const [auditInfo, setAuditInfo] = useState<AuditInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAuditInfo() {
            try {
                const response = await fetch(`/api/audit/${auditId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch audit information');
                }
                const data = await response.json();
                setAuditInfo(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchAuditInfo();
    }, [auditId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !auditInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 max-w-md">
                    {error || 'Audit not found'}
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">Accessibility Audit</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {auditInfo.url}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Browser View */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Live Browser View</h2>
                        <LiveView sessionId={auditInfo.sessionId} />
                    </div>

                    {/* Issues Feed */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Issues Found</h2>
                        <IssuesFeed auditId={auditId} />
                    </div>
                </div>
            </div>
        </main>
    );
}
