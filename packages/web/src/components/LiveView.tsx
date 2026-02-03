'use client';

interface LiveViewProps {
    sessionId: string;
}

/**
 * LiveView - Embedded Browserbase live view iframe
 *
 * Shows real-time browser activity during the audit.
 */
export function LiveView({ sessionId }: LiveViewProps) {
    const liveViewUrl = `https://www.browserbase.com/sessions/${sessionId}/live`;

    return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-2 bg-gray-200 dark:bg-gray-700 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                    {liveViewUrl}
                </span>
            </div>
            <iframe
                src={liveViewUrl}
                className="w-full h-[500px] border-0"
                allow="clipboard-read; clipboard-write"
                title="Live browser view"
            />
        </div>
    );
}
