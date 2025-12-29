"use client";

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { InquiryService, Inquiry, Message } from '../../../services/InquiryService';
import { Send, CheckCircle, Package, DollarSign, Calendar, MessageSquare } from 'lucide-react';

export default function VendorInquiryPage() {
    const { data: session } = useSession();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const scrollRef = useRef<HTMLDivElement>(null);

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Quote Form State
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [validUntil, setValidUntil] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (session?.user && id) {
            const token = (session as any).accessToken || "";

            Promise.all([
                InquiryService.getInquiry(id, token),
                InquiryService.getChatHistory(id, token)
            ]).then(([inqData, chatData]) => {
                setInquiry(inqData);
                setMessages(chatData);
            });
        }
    }, [session, id]);

    const handleSubmitQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || !session) return;

        setSubmitting(true);
        const token = (session as any).accessToken || "";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://app.alsakronline.com";

        try {
            const res = await fetch(`${API_URL}/api/quotes`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inquiry_id: id,
                    vendor_id: (session.user as any).id || 'vendor_1',
                    items: inquiry?.products, // Quoting for all items as bundle for now
                    total_price: parseFloat(price),
                    currency: currency,
                    valid_until: validUntil,
                    notes: notes
                })
            });

            if (res.ok) {
                alert("Quote submitted successfully!");
                router.push('/vendor/dashboard');
            } else {
                alert("Failed to submit quote.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session) return;

        const token = (session as any).accessToken || "";
        await InquiryService.sendMessage({
            inquiry_id: id,
            sender_id: (session.user as any).id || 'vendor_1',
            sender_role: 'vendor',
            content: newMessage
        }, token);

        setNewMessage('');
        const updatedChat = await InquiryService.getChatHistory(id, token);
        setMessages(updatedChat);
    };

    if (!inquiry) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className='flex items-center gap-4 mb-6'>
                <h1 className="text-2xl font-bold text-slate-900">Inquiry Request #{inquiry.id.substring(0, 8)}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold bg-slate-100`}>
                    {inquiry.status.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">

                {/* LEFT: Quote Form & Details */}
                <div className="overflow-y-auto pr-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" /> Requested Items
                        </h3>
                        <div className="space-y-3">
                            {inquiry.products.map((p, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                    <span className="font-medium text-slate-700">{p.name || p.part_number}</span>
                                    <span className="text-sm bg-slate-100 px-2 py-1 rounded">Qty: {p.quantity || 1}</span>
                                </div>
                            ))}
                        </div>
                        {inquiry.message && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                                "{inquiry.message}"
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5" /> Submit Quotation
                        </h3>
                        <form onSubmit={handleSubmitQuote} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Total Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            required
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="w-full pl-7 pr-4 py-2 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Currency</label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>SAR</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Valid Until</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <input
                                        type="date"
                                        value={validUntil}
                                        onChange={e => setValidUntil(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Notes / Terms</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Include shipping, 2 weeks lead time..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                {submitting ? 'Sending...' : 'Send Quote'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT: Chat */}
                <div className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Discussion with Buyer
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                        {messages.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-8">No messages from buyer yet.</p>
                        )}
                        {messages.map(msg => {
                            const isMe = msg.sender_role === 'vendor';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                        }`}>
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Reply to buyer..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
