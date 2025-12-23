'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/search/ImageUpload';
import { VoiceSearch } from '@/components/search/VoiceSearch';

function BuyerDashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);

    // Initial Search Effect
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const res = await fetch(`${apiUrl}/api/search/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            router.push(`/dashboard/buyer?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Find Parts</h1>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        placeholder="Search by part number, description..."
                        className="flex-1 p-4 text-lg border border-white/20 rounded-lg shadow-sm bg-white/5 focus:bg-white/10 transition-colors"
                    />
                    <button
                        onClick={handleSearchSubmit}
                        className="bg-primary hover:bg-blue-600 px-6 rounded-lg font-bold"
                    >
                        Search
                    </button>
                </div>

                {/* Search Toggles */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setShowImageSearch(!showImageSearch)}
                        className={`flex items-center gap-2 border border-white/20 px-4 py-2 rounded transition-colors ${showImageSearch ? 'bg-primary border-primary' : 'hover:bg-white/10'}`}
                    >
                        📸 Upload Image
                    </button>
                    <button
                        onClick={() => setShowVoiceSearch(!showVoiceSearch)}
                        className={`flex items-center gap-2 border border-white/20 px-4 py-2 rounded transition-colors ${showVoiceSearch ? 'bg-primary border-primary' : 'hover:bg-white/10'}`}
                    >
                        🎙️ Voice Search
                    </button>
                </div>

                {/* Active Search Component Panels */}
                <div className="space-y-4">
                    {showImageSearch && (
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-400">Image Search</h3>
                                <button onClick={() => setShowImageSearch(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>
                            <ImageUpload />
                        </div>
                    )}

                    {showVoiceSearch && (
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-gray-400">Voice Search</h3>
                                <button onClick={() => setShowVoiceSearch(false)} className="text-gray-500 hover:text-white">✕</button>
                            </div>
                            <VoiceSearch />
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-300">Results</h2>
                    {loading ? (
                        <div className="text-center py-12 text-gray-500 animate-pulse">Searching global inventory...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.length > 0 ? (
                                results.map((part, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors group">
                                        <div className="aspect-square bg-white/5 rounded-lg mb-4 overflow-hidden flex items-center justify-center relative">
                                            {part.payload.image_url ? (
                                                <img src={part.payload.image_url} alt={part.payload.part_number} className="object-contain w-full h-full" />
                                            ) : (
                                                <span className="text-4xl text-gray-700">📦</span>
                                            )}
                                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-green-400 font-mono">
                                                {(part.score * 100).toFixed(0)}% Match
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">{part.payload.part_number || "Unknown Part"}</h3>
                                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{part.payload.description_en}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{part.payload.manufacturer || "Generic"}</span>
                                            <button
                                                onClick={() => alert(JSON.stringify(part.payload, null, 2))}
                                                className="text-primary hover:text-blue-400 text-sm font-medium"
                                            >
                                                View Details →
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 col-span-full text-center py-8">No parts found matching your query.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function BuyerDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 flex items-center justify-center">Loading search...</div>}>
            <BuyerDashboardContent />
        </Suspense>
    )
}
