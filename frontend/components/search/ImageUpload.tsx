'use client';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export function ImageUpload() {
    const [uploading, setUploading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<any>(null);
    const [analysis, setAnalysis] = useState<string>("");

    const handleUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const response = await fetch(`${apiUrl}/api/search/image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setResults(data.results || []);
            setAnalysis(data.analysis || "");
        } catch (error) {
            console.error('Upload failed:', error);
            // Fallback for demo if API is unreachable
            setResults([{ id: 1, name: "Sample Part (Offline Mode)", score: 0.95 }]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-800 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-medium text-white">Upload an image</p>
                    <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                />
                <label htmlFor="image-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>

            {uploading && <p className="mt-4 text-primary animate-pulse">Analyzing image...</p>}

            {results && results.length > 0 ? (
                <div className="mt-6 text-left bg-gray-900/50 p-4 rounded-lg space-y-4">
                    <div className="border-b border-white/10 pb-2 mb-2">
                        <p className="text-blue-400 font-semibold mb-1">🤖 AI Analysis</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {analysis || "Analyzing image features..."}
                        </p>
                    </div>

                    <div>
                        <p className="text-green-400 font-medium mb-2">Found Parts:</p>
                        {results.map((result: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center text-sm text-gray-300 bg-black/20 p-2 rounded">
                                <span className="font-mono bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">{(result.score * 100).toFixed(0)}% Match</span>
                                <span className="font-medium text-white">{result.name || result.payload?.name || "Unknown Part"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : results && (
                <p className="mt-4 text-gray-400">No matching parts found.</p>
            )}

            {results && results.error && (
                <p className="mt-4 text-red-400">Error: {results.error}</p>
            )}
        </div>
    );
}
