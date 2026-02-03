'use client';

import { useEffect, useState } from 'react';

interface AuditFinding {
    criterion: {
        id: string;
        title: string;
        level: string;
    };
    status: 'pass' | 'fail' | 'manual-review';
    description: string;
    impact?: string;
    element?: string;
    selector?: string;
}

interface IssuesFeedProps {
    auditId: string;
}

/**
 * IssuesFeed - Real-time issues feed via SSE
 *
 * Subscribes to the audit stream and displays findings as they're discovered.
 */
export function IssuesFeed({ auditId }: IssuesFeedProps) {
    const [issues, setIssues] = useState<AuditFinding[]>([]);
    const [progress, setProgress] = useState<string>('Connecting...');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const eventSource = new EventSource(`/api/audit/${auditId}/stream`);

        eventSource.addEventListener('progress', (e) => {
            const data = JSON.parse(e.data);
            setProgress(data.step);
        });

        eventSource.addEventListener('finding', (e) => {
            const finding = JSON.parse(e.data);
            setIssues(prev => [...prev, finding]);
        });

        eventSource.addEventListener('complete', () => {
            setIsComplete(true);
            setProgress('Audit complete');
            eventSource.close();
        });

        eventSource.addEventListener('error', () => {
            setProgress('Connection lost');
            eventSource.close();
        });

        return () => {
            eventSource.close();
        };
    }, [auditId]);

    const getImpactColor = (impact?: string) => {
        switch (impact) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'serious':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'minor':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {!isComplete && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                {isComplete && (
                    <span className="text-green-500">✓</span>
                )}
                <span>{progress}</span>
            </div>

            {/* Issues list */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {issues.length === 0 && !isComplete && (
                    <div className="text-gray-500 dark:text-gray-400 text-sm p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                        Waiting for findings...
                    </div>
                )}

                {issues.length === 0 && isComplete && (
                    <div className="text-green-600 dark:text-green-400 text-sm p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        No accessibility issues found!
                    </div>
                )}

                {issues.map((issue, index) => (
                    <div
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm">
                                {issue.criterion.title}
                            </h3>
                            {issue.impact && (
                                <span className={`text-xs px-2 py-0.5 rounded ${getImpactColor(issue.impact)}`}>
                                    {issue.impact}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {issue.description}
                        </p>

                        {issue.element && (
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                                {issue.element.substring(0, 100)}
                                {issue.element.length > 100 && '...'}
                            </pre>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>WCAG {issue.criterion.id}</span>
                            <span>•</span>
                            <span>Level {issue.criterion.level}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            {isComplete && issues.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-red-600 font-medium">{issues.filter(i => i.impact === 'critical').length}</span>
                            <span className="text-gray-600 dark:text-gray-400"> Critical</span>
                        </div>
                        <div>
                            <span className="text-orange-600 font-medium">{issues.filter(i => i.impact === 'serious').length}</span>
                            <span className="text-gray-600 dark:text-gray-400"> Serious</span>
                        </div>
                        <div>
                            <span className="text-yellow-600 font-medium">{issues.filter(i => i.impact === 'moderate').length}</span>
                            <span className="text-gray-600 dark:text-gray-400"> Moderate</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">{issues.filter(i => i.impact === 'minor').length}</span>
                            <span className="text-gray-600 dark:text-gray-400"> Minor</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
