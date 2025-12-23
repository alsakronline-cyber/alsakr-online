'use client';
import { useState } from 'react';
import { ImageUpload } from '@/components/search/ImageUpload';
import { VoiceSearch } from '@/components/search/VoiceSearch';

export default function BuyerDashboard() {
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [showVoiceSearch, setShowVoiceSearch] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Find Parts</h1>
            <div className="max-w-2xl mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Search by part number, description..."
                    className="w-full p-4 text-lg border border-white/20 rounded-lg shadow-sm bg-white/5 focus:bg-white/10 transition-colors"
                />

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
                <div className="space-y-4 mt-4">
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
            </div>
        </div>
    )
}
