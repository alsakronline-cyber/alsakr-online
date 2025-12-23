'use client';
import { useState } from 'react';
import { Play, Square, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<string>('idle');
    const [loading, setLoading] = useState(false);

    const handleScrape = async () => {
        if (!url) return;
        setLoading(true);
        setStatus('Scraping...');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const res = await fetch(`${apiUrl}/api/admin/scraper/scrape-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brand: 'SICK', url: url })
            });
            const data = await res.json();
            setStatus(res.ok ? `Success: ${data.message}` : `Error: ${data.detail}`);
        } catch (error) {
            setStatus('Error: Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 text-white">
            <h1 className="text-3xl font-bold mb-8">System Admin</h1>
            <div className="max-w-2xl space-y-6">

                {/* Manual Scraper Control */}
                <div className="p-6 bg-gray-900 rounded-xl border border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-blue-400">🕷️</span> Scraper Control
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Target URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://www.sick.com/..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                                />
                                <button
                                    onClick={handleScrape}
                                    disabled={loading || !url}
                                    className="bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    Scrape
                                </button>
                            </div>
                        </div>

                        {/* Status Output */}
                        <div className="bg-black/20 rounded-lg p-4 font-mono text-sm">
                            <p className="text-gray-500 mb-1">Status Log:</p>
                            <p className={status.startsWith('Error') ? 'text-red-400' : 'text-green-400'}>
                                &gt; {status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bulk Controls */}
                <div className="p-6 bg-gray-900 rounded-xl border border-white/10 shadow-xl opacity-50 pointer-events-none">
                    <h3 className="text-xl font-bold mb-4">Bulk Operations (Coming Soon)</h3>
                    <div className="flex gap-4">
                        <button className="bg-blue-600/50 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Play className="w-4 h-4" /> Start Full Scrape
                        </button>
                        <button className="bg-red-600/50 text-white px-4 py-2 rounded flex items-center gap-2">
                            <Square className="w-4 h-4" /> Stop All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
