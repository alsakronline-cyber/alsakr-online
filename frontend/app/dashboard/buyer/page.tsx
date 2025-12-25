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

    // Initial Search & Role Guard
    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        if (userRole && !["buyer", "both", "admin"].includes(userRole)) {
            router.push("/dashboard");
            return;
        }

        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams, router]);

    const performSearch = async (query: string) => {
        setLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const res = await fetch(`${apiUrl}/api/search/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
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

    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const uploadFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return null;

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const res = await fetch(`${apiUrl}/api/upload-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                return data.files.map((f: any) => f.url).join(',');
            }
        } catch (error) {
            console.error("File upload failed:", error);
        }
        return null;
    };

    const handleRequestQuote = async (part: any) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            const attachmentUrls = await uploadFiles();

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const res = await fetch(`${apiUrl}/api/rfqs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    title: `Quote Request for ${part.payload.part_number}`,
                    description: `Automated request for part number ${part.payload.part_number} from manufacturer ${part.payload.manufacturer}`,
                    part_description: part.payload.description_en,
                    quantity: 1, // Default quantity
                    buyer_id: userId,
                    requirements: "Standard shipping and verification required.",
                    attachments: attachmentUrls || ""
                })
            });

            if (res.ok) {
                alert("✅ Quote request submitted successfully!");
                setSelectedPart(null);
                setSelectedFiles(null);
            } else {
                const error = await res.json();
                alert(`❌ Failed to submit request: ${error.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("RFQ submission failed:", error);
            alert("❌ Network error while submitting request.");
        } finally {
            setLoading(false);
        }
    };


    // Side Panel Component
    const ProductDetailsPanel = ({ part, onClose }: { part: any, onClose: () => void }) => (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-900 border-l border-white/10 shadow-2xl p-6 overflow-y-auto transform transition-transform animate-in slide-in-from-right z-50">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-bold mb-2">{part.payload.part_number}</h2>
            <p className="text-primary font-medium mb-6">{part.payload.manufacturer}</p>

            {part.payload.image_url && (
                <div className="bg-white p-4 rounded-xl mb-6">
                    <img src={part.payload.image_url} alt={part.payload.part_number} className="w-full h-64 object-contain" />
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2 border-b border-white/10 pb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{part.payload.description_en}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 border-b border-white/10 pb-2">Technical Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {part.payload.specifications && Object.entries(part.payload.specifications).map(([key, value]) => (
                            <div key={key} className="bg-white/5 p-3 rounded-lg">
                                <span className="text-xs text-gray-400 uppercase block mb-1">{key.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-medium break-words">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                    {!part.payload.specifications && <p className="text-gray-500 italic">No detailed specifications available.</p>}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2 border-b border-white/10 pb-2">Availability</h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${part.payload.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="capitalize">{part.payload.status || 'Unknown'}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2 border-b border-white/10 pb-2">Attachments (Optional)</h3>
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                    />
                    {selectedFiles && (
                        <ul className="mt-2 space-y-1">
                            {Array.from(selectedFiles).map((file, idx) => (
                                <li key={idx} className="text-xs text-gray-500 truncate flex items-center gap-2">
                                    <span>📎</span> {file.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => handleRequestQuote(part)}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                >
                    {loading ? 'Submitting...' : 'Request Quote'}
                </button>
            </div>
        </div>
    );

    const [selectedPart, setSelectedPart] = useState<any | null>(null);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 relative">
            <h1 className="text-3xl font-bold mb-6">Find Parts</h1>

            {/* Side Panel Overlay */}
            {selectedPart && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSelectedPart(null)} />
                    <ProductDetailsPanel part={selectedPart} onClose={() => setSelectedPart(null)} />
                </>
            )}

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
                                                onClick={() => setSelectedPart(part)}
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
