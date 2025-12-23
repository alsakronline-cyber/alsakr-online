"use client";

import React, { useState } from 'react';
import { Upload, X, Search, Loader2 } from 'lucide-react';

export const ImageUpload = () => {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/search/image`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${preview ? 'border-primary/50' : 'border-slate-300 hover:border-primary'} dark:border-slate-700`}>

                {preview ? (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg shadow-md" />
                        <button
                            onClick={() => { setPreview(null); setResults(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Snap or Upload Photo
                        </label>
                        <p className="text-xs text-slate-500 mb-4">Identify parts instantly with AI</p>
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                    </>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium text-primary">Analyzing Component...</p>
                        </div>
                    </div>
                )}
            </div>

            {results && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Search size={18} className="text-primary" />
                            AI Analysis
                        </h3>
                        {results.llm_analysis ? (
                            <div className="space-y-2 text-sm">
                                <p><strong>Part:</strong> {results.llm_analysis.part_name || "Unknown"}</p>
                                <p><strong>Manufacturer:</strong> {results.llm_analysis.manufacturer || "Unknown"}</p>
                                <details className="mt-2">
                                    <summary className="cursor-pointer text-primary text-xs font-medium">View Specs</summary>
                                    <pre className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded text-xs overflow-auto">
                                        {JSON.stringify(results.llm_analysis.technical_specifications, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No detailed analysis returned.</p>
                        )}
                    </div>
                </div>
            )}

            {results?.similar_parts?.length > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-5">
                    <h3 className="font-semibold text-lg mb-2 text-white">Similar Products Found</h3>
                    <div className="space-y-2">
                        {results.similar_parts.map((part: any, idx: number) => (
                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-white">{part.payload.part_number}</p>
                                    <p className="text-xs text-slate-400">{part.payload.manufacturer}</p>
                                </div>
                                <span className="text-xs text-green-400 font-mono">{(part.score * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
