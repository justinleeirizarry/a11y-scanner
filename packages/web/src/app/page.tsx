'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to start audit');
            }

            const { auditId } = await response.json();
            router.push(`/audit/${auditId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Accessibility Toolkit
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        AI-powered accessibility auditing with live browser view
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="url"
                            className="block text-sm font-medium mb-2"
                        >
                            Website URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                    >
                        {loading ? 'Starting Audit...' : 'Start Accessibility Audit'}
                    </button>
                </form>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-lg font-semibold mb-4">Features</h2>
                    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Real-time browser view via Browserbase</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>AI-powered WCAG 2.2 compliance checking</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Keyboard navigation testing</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Accessibility tree analysis</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
