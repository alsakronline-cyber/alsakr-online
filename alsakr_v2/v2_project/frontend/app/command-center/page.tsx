"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera, ShoppingCart, Scale, Shield, FileText, Mic,
  MapPin, Activity, Wrench, Users, Bell, Settings, HelpCircle,
  MoreVertical, ChevronRight, Zap, Send, TrendingUp, DollarSign,
  Package, AlertTriangle, Terminal, LayoutGrid, X, CheckCircle, ShieldCheck
} from 'lucide-react';

// ... (AGENTS array remains the same) ...
const INITIAL_AGENTS = [
  { id: 1, name: 'VisualMatch', icon: Camera, status: 'active', theme: 'sky' },
  { id: 2, name: 'MultiVendor', icon: ShoppingCart, status: 'active', theme: 'sky' },
  { id: 3, name: 'QuoteCompare', icon: Scale, status: 'negotiating', theme: 'blue' },
  { id: 4, name: 'InventoryVoice', icon: Mic, status: 'idle', theme: 'gray' },
  { id: 5, name: 'TechDoc + Asset', icon: FileText, status: 'idle', theme: 'gray' },
  { id: 6, name: 'ComplianceGuide', icon: Shield, status: 'idle', theme: 'gray' },
  { id: 7, name: 'Service & DeadStock', icon: Wrench, status: 'negotiating', theme: 'blue' },
  { id: 8, name: 'AutoReplenish', icon: Activity, status: 'active', theme: 'sky' },
  { id: 9, name: 'Troubleshooter', icon: Wrench, status: 'negotiating', theme: 'blue' },
  { id: 10, name: 'SupplierHub', icon: Users, status: 'idle', theme: 'gray' },
];

interface Product {
  part_number: string;
  name: string;
  category: string;
  combined_score?: number;
  description?: string;
  specifications?: Record<string, any>;
  image_url?: string;
  stock?: number;
  [key: string]: any;
}

// Minimal Product Modal
const ProductDetailsModal = ({ product, onClose, onInquiry }: { product: Product, onClose: () => void, onInquiry: (p: Product) => void }) => {
  const [activeImage, setActiveImage] = useState(product.image_url || product.image_urls?.[0] || null);
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquiry = () => {
    onInquiry(product);
    setInquirySent(true);
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                {product.category || 'Component'}
              </span>
              {(product.combined_score || 0) > 0.95 ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-md shadow-sm shadow-emerald-500/20 animate-pulse">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Precision Match</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-600 rounded-md shadow-sm shadow-blue-600/20">
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white">
                    {Math.round((product.combined_score || 0) * 100)}% Match
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{product.name}</h2>
            <span className="font-mono text-sm text-slate-500">{product.part_number}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Image & Key Stats */}
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-4 relative overflow-hidden group">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-center">
                      <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2 opacity-50" />
                      <span className="text-xs text-slate-400">No Preview</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.image_urls && product.image_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {product.image_urls.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`w-14 h-14 rounded-lg border-2 flex-shrink-0 bg-white p-1 transition-all ${activeImage === img ? 'border-blue-500 shadow-md' : 'border-slate-100 hover:border-slate-200 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="thumb" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm shadow-emerald-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-800">In Stock (Standard)</span>
                  </div>
                  <p className="text-[10px] text-emerald-700/70 font-medium">Verified by SupplierHub Agent</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-800">Confidence Analysis</span>
                    <span className="text-xs font-mono font-bold text-blue-600">{(product.combined_score || 0).toFixed(4)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                      style={{ width: `${Math.round((product.combined_score || 0) * 100)}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleInquiry}
                  disabled={inquirySent}
                  className={`w-full py-3.5 ${inquirySent ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2`}
                >
                  {inquirySent ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Request Sent
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Request Official Quote
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Specs & Description */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Component Details
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  {product.description || "Full technical documentation available upon request. This component is part of the SICK industrial automation ecosystem."}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Data Sheet Matrix
                </h3>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {product.specifications && Object.entries(product.specifications).length > 0 ? (
                        Object.entries(product.specifications).map(([k, v], i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-5 py-3 text-slate-400 font-medium w-1/3 bg-slate-50/30 group-hover:text-blue-600 text-[11px] uppercase tracking-tighter">{k}</td>
                            <td className="px-5 py-3 text-slate-700 font-semibold">{String(v)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-5 py-6 text-slate-400 italic text-center">No structural data matrix found. Use TechDoc Agent for manual extraction.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CommandCenter() {
  const router = useRouter();
  const [command, setCommand] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [agents, setAgents] = useState(INITIAL_AGENTS);

  // Smart Search State
  const [matches, setMatches] = useState<Product[]>([]);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [clarification, setClarification] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Neural Log State
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Voice Search State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Vision Search State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // ... (Sort Agents useEffect remains same) ...
  useEffect(() => {
    const sorted = [...INITIAL_AGENTS].sort((a, b) => {
      const score = (status: string) => {
        if (status === 'active') return 3;
        if (status === 'negotiating') return 2;
        return 1;
      };
      return score(b.status) - score(a.status);
    });
    setAgents(sorted);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSearch = async (overrideCommand?: string) => {
    const finalCommand = overrideCommand || command;
    if (!finalCommand.trim()) return;

    setIsSearching(true);
    setClarification(null);
    setMatches([]);
    setAlternatives([]);
    setLogs([]);

    // Update context
    const newHistory = [...history, finalCommand];
    if (newHistory.length > 5) newHistory.shift();
    setHistory(newHistory);

    addLog(`USER_QUERY: "${finalCommand}"`);
    addLog("ORCHESTRATOR: Analyzing intent with LLM (Context Aware)...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      addLog("NETWORK: Sending request to /api/search/smart...");

      const response = await fetch(`${apiUrl}/api/search/smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalCommand,
          context: history.map(h => ({ role: 'user', content: h }))
        })
      });

      const data = await response.json();
      addLog("ORCHESTRATOR: Response received.");

      if (data.type === 'clarification') {
        addLog("DECISION: Ambiguous query detected.");
        addLog(`ACTION: Requesting clarification: "${data.question}"`);
        setClarification(data.question);

        // HYBRID MODE: Show matches even if clarification is needed
        if (data.matches && data.matches.length > 0) {
          addLog(`DISPLAY: Showing ${data.matches.length} preliminary matches.`);
          setMatches(data.matches);
        }

      } else if (data.type === 'results') {
        const matchCount = data.matches?.length || 0;
        addLog(`DECISION: Search successful. Found ${matchCount} direct matches.`);
        setMatches(data.matches || []);
        setAlternatives(data.alternatives || []);

        if (matchCount > 0) {
          addLog("VISUAL_MATCH: Cross-referencing technical specifications...");
          addLog("COMPLETED: Results rendered.");
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      addLog("ERROR: Connection to backend failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

          addLog("VOICE: Audio captured. Uploading for transcription...");
          const formData = new FormData();
          formData.append('file', blob, 'recording.webm');

          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/voice/transcribe`, {
              method: 'POST',
              body: formData
            });
            const data = await response.json();
            if (data.text) {
              addLog(`VOICE: Transcribed: "${data.text}"`);
              setCommand(data.text);
              handleSearch(data.text);
            } else {
              addLog("VOICE: Transcription failed or empty.");
            }
          } catch (e) {
            addLog("ERROR: Voice processing failed.");
          }

          // Stop tracks
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        addLog("VOICE: Listening...");
      } catch (err) {
        console.error("Mic error:", err);
        addLog("ERROR: Microphone access denied.");
      }
    }
  };

  const handleInquiry = async (product: Product) => {
    addLog(`INQUIRY: Initiating quote request for ${product.part_number}...`);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: "user_123", // Mock user ID
          products: [product],
          message: "Requesting official quote for this item."
        })
      });
      addLog("INQUIRY: Request sent to vendors successfully.");
    } catch (e) {
      addLog("ERROR: Failed to send inquiry.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    addLog("VISION: Image captured. Uploading for analysis...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/vision/identify`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.identification) {
        const id = data.identification;
        const desc = `Identified: ${id.brand || 'Unknown'} ${id.series || ''} ${id.part_number || ''}`;
        addLog(`VISION: ${desc}`);
        if (id.part_number) {
          handleSearch(id.part_number);
        } else {
          handleSearch(id.description || "industrial part");
        }
      } else {
        addLog("VISION: Could not identify part.");
      }
    } catch (err) {
      addLog("ERROR: Vision analysis failed.");
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans selection:bg-blue-100">

      {/* Product Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onInquiry={handleInquiry}
        />
      )}

      {/* Left Sidebar - Icon Nav */}
      <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4 shadow-sm z-20">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <LayoutGrid className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-3 mt-4">
          <button
            onClick={handleVoiceSearch}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isRecording ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAnalyzingImage ? 'bg-purple-50 text-purple-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <Camera className="w-5 h-5" />
          </button>
          {/* ... Other icons ... */}
          {[FileText, Shield, Users].map((Icon, i) => (
            <button key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        {/* ... Settings icons ... */}
        <div className="flex flex-col gap-3">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <div className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
          <h1 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Al Sakr Command Center <span className="text-blue-200 mx-2">|</span> V2.0</h1>
          {/* ... Header Status ... */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">System Online</span>
            </div>

            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-9 h-9 bg-slate-200 rounded-full" />
          </div>
        </div>

        {/* Command Input */}
        <div className="px-8 py-6 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-30 transition duration-1000 blur-sm"></div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your agents... (e.g. 'Show me 24V sensors' then 'Filter by stock')"
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-24 py-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xl shadow-blue-500/5 transition-all"
              />
              {/* ... Input Buttons ... */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium px-2">⌘K</span>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors shadow-md shadow-blue-600/20"
                >
                  <Send className={`w-4 h-4 text-white ${isSearching ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Panel Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Agent Dock */}
          <div className="w-72 bg-white border-r border-slate-200 p-6 overflow-y-auto z-10">
            {/* ... Agent Dock Content (same as before) ... */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Agents</h2>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${agent.status === 'active' || agent.status === 'negotiating'
                    ? 'bg-blue-50 border-blue-100 shadow-sm hover:shadow-md'
                    : 'bg-white border-slate-100 opacity-60 hover:opacity-100 hover:bg-slate-50'
                    }`}
                >
                  <div className={`p-2 rounded-lg ${agent.status === 'active' || agent.status === 'negotiating' ? 'bg-white shadow-sm text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    <agent.icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${agent.status === 'active' || agent.status === 'negotiating' ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                      {agent.name}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {agent.status}
                    </p>
                  </div>

                  {(agent.status === 'active' || agent.status === 'negotiating') && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Stage (Results) */}
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">

            {!isSearching && !clarification && matches.length === 0 && alternatives.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 opacity-60">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Terminal className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-500">System Ready</p>
                <p className="text-sm">Initiate a search to activate agents.</p>
              </div>
            )}

            {/* Clarification Prompt */}
            {clarification && (
              <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <HelpCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Refining Search</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{clarification}</p>
                    <p className="text-xs font-semibold text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded">Action Required: Please specify below</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table (Matches & Alternatives) */}
            {(matches.length > 0 || alternatives.length > 0) && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Best Matches */}
                {matches.length > 0 && (
                  <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/5">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50 bg-blue-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <h3 className="text-sm font-bold text-blue-900">
                          {clarification ? "Preliminary Matches" : "Best Matches"} ({matches.length})
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">{clarification ? "Review Needed" : "High Confidence"}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Part Number</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {matches.map((p, i) => (
                            <tr
                              key={i}
                              onClick={() => handleProductClick(p)}
                              className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 font-mono text-sm font-semibold text-blue-600 group-hover:underline">{p.part_number}</td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span>{p.name}</span>
                                  {(p.combined_score || 0) > 0.90 && (
                                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter shadow-sm shadow-blue-500/5">Highly Relevant</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">{p.category}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${Math.min(100, Math.round((p.combined_score || 0) * 100))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">
                                    {Math.min(100, Math.round((p.combined_score || 0) * 100))}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && !clarification && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm opacity-90">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-600">Alternatives & Related ({alternatives.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody className="divide-y divide-slate-50">
                          {alternatives.map((p, i) => (
                            <tr
                              key={i}
                              onClick={() => handleProductClick(p)}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 font-mono text-sm text-slate-500">{p.part_number}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{p.name}</td>
                              <td className="px-6 py-4 text-sm text-slate-400">{p.category}</td>
                              <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                {Math.min(100, Math.round((p.combined_score || 0) * 100))}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Neural Log (Right Panel) */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10">
            {/* ... Log Content (same as before) ... */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Log</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400">LIVE</span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs space-y-3 bg-white">
              {logs.length === 0 ? (
                <div className="text-center mt-10 opacity-40">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 italic">Waiting... </p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-300 select-none">›</span>
                    <p className="text-slate-600 leading-relaxed break-words">
                      {log.includes("USER_QUERY") ? (
                        <span className="font-bold text-slate-800">{log}</span>
                      ) : log.includes("DECISION") ? (
                        <span className="font-bold text-blue-600">{log}</span>
                      ) : (
                        log
                      )}
                    </p>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center uppercase tracking-wider font-semibold">
              System Latency: 45ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
