'use client';
import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export function VoiceSearch() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                await handleUpload(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setTranscript(null);
            setError(null);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleUpload = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setError(null); // Clear previous errors
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com';
            const token = localStorage.getItem('token')
            if (!token) {
                setError("Please login to use voice search")
                setIsProcessing(false); // Stop processing state if no token
                return
            }

            const res = await fetch(`${apiUrl}/api/search/voice`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            })

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Voice search failed');
            }

            setTranscript(data.text);
        } catch (error: any) {
            console.error('Voice search failed:', error);
            setTranscript(null);
            setError(error.message || "Voice search failed");
        } finally {
            setIsProcessing(false);
        }

    };

    return (
        <div className="p-6 bg-gray-900 border border-white/10 rounded-xl text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
                {isRecording && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative z-10 p-4 rounded-full transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/80'
                        }`}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : isRecording ? (
                        <Square className="w-8 h-8 text-white fill-current" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}
                </button>
            </div>

            <div className="min-h-[3rem]">
                {isRecording && <p className="text-red-400 animate-pulse">Recording... Click to stop</p>}
                {isProcessing && <p className="text-primary">Transcribing...</p>}
                {!isRecording && !isProcessing && !transcript && (
                    <p className="text-gray-400">Click microphone to start speaking</p>
                )}
                {transcript && (
                    <div className="mt-2 bg-white/5 p-3 rounded-lg border border-white/10">
                        <p className="text-white text-lg">"{transcript}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
