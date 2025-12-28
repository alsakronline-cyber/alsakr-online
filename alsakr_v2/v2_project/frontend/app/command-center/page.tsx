"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, ShoppingCart, Scale, Shield, FileText, Mic,
  MapPin, Activity, Wrench, Users, Bell, Settings, HelpCircle,
  MoreVertical, ChevronRight, Zap, Send, TrendingUp, DollarSign,
  Package, AlertTriangle, Terminal
} from 'lucide-react';

const AGENTS = [
  { id: 1, name: 'VisualMatch', icon: Camera, status: 'active', theme: 'cyan' },
  { id: 2, name: 'MultiVendor', icon: ShoppingCart, status: 'active', theme: 'cyan' },
  { id: 3, name: 'QuoteCompare', icon: Scale, status: 'negotiating', theme: 'orange' },
  { id: 4, name: 'InventoryVoice', icon: Mic, status: 'idle', theme: 'gray' },
  { id: 5, name: 'TechDoc + Asset', icon: FileText, status: 'idle', theme: 'gray' },
  { id: 6, name: 'ComplianceGuide', icon: Shield, status: 'idle', theme: 'gray' },
  { id: 7, name: 'Service & DeadStock', icon: Wrench, status: 'negotiating', theme: 'orange' },
  { id: 8, name: 'AutoReplenish', icon: Activity, status: 'active', theme: 'cyan' },
  { id: 9, name: 'Troubleshooter', icon: Wrench, status: 'negotiating', theme: 'orange' },
  { id: 10, name: 'SupplierHub', icon: Users, status: 'idle', theme: 'gray' },
];

interface Product {
  part_number: string;
  name: string;
  category: string;
  [key: string]: any;
}

export default function CommandCenter() {
  const [command, setCommand] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Smart Search State
  const [matches, setMatches] = useState<Product[]>([]);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [clarification, setClarification] = useState<string | null>(null);

  // Neural Log State
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSearch = async () => {
    if (!command.trim()) return;

    setIsSearching(true);
    setClarification(null);
    setMatches([]);
    setAlternatives([]);
    setLogs([]); // Clear logs on new search

    addLog(`USER_QUERY: "${command}"`);
    addLog("ORCHESTRATOR: Analyzing intent with LLM...");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      addLog("NETWORK: Sending request to /api/search/smart...");

      const response = await fetch(`${apiUrl}/api/search/smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: command })
      });

      const data = await response.json();
      addLog("ORCHESTRATOR: Response received.");

      if (data.type === 'clarification') {
        addLog("DECISION: Ambiguous query detected.");
        addLog(`ACTION: Requesting clarification: "${data.question}"`);
        setClarification(data.question);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex overflow-hidden font-sans">
      {/* Left Sidebar - Icon Nav */}
      <div className="w-14 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-4 gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 flex flex-col gap-2 mt-4">
          <button className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500 hover:bg-orange-500/30 transition-colors">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-current rounded-sm" />
              <div className="w-2 h-2 bg-current rounded-sm" />
              <div className="w-2 h-2 bg-current rounded-sm" />
              <div className="w-2 h-2 bg-current rounded-sm" />
            </div>
          </button>

          {[FileText, Shield, Users].map((Icon, i) => (
            <button key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors">
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between flex-shrink-0">
          <h1 className="text-sm font-semibold text-slate-200">Al Sakr Online: Industrial AI Command Center</h1>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full" />
          </div>
        </div>

        {/* Command Input */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Command your agents... (e.g., 'Find 50 DN50 Valves' or 'Upload broken gear photo')"
              className="w-full bg-slate-800/50 border border-orange-500/30 rounded-xl pl-11 pr-20 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-xs text-slate-300 font-medium transition-colors">
                ⌘K
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-8 h-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 rounded-lg flex items-center justify-center transition-colors"
              >
                <Send className={`w-3.5 h-3.5 text-white ${isSearching ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Panel Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Agent Dock */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Dock</h2>
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-2">
              {AGENTS.map(agent => (
                <div
                  key={agent.id}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${agent.theme === 'cyan'
                    ? 'bg-cyan-500/15 border border-cyan-500/20 hover:bg-cyan-500/20'
                    : agent.theme === 'orange'
                      ? 'bg-orange-500/15 border border-orange-500/20 hover:bg-orange-500/20'
                      : 'bg-slate-800/50 border border-transparent hover:bg-slate-800'
                    }`}
                >
                  <div className={`p-1.5 rounded ${agent.theme === 'cyan' ? 'bg-cyan-500/20' :
                    agent.theme === 'orange' ? 'bg-orange-500/20' :
                      'bg-slate-700'
                    }`}>
                    <agent.icon className={`w-3.5 h-3.5 ${agent.theme === 'cyan' ? 'text-cyan-400' :
                      agent.theme === 'orange' ? 'text-orange-400' :
                        'text-slate-400'
                      }`} />
                  </div>

                  <span className={`text-xs font-medium flex-1 ${agent.theme === 'cyan' ? 'text-cyan-300' :
                    agent.theme === 'orange' ? 'text-orange-300' :
                      'text-slate-400'
                    }`}>
                    {agent.name}
                  </span>

                  {agent.theme !== 'gray' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.theme === 'cyan' ? 'bg-cyan-400 animate-pulse' :
                      'bg-orange-400 animate-pulse'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bento Box Center */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Bento Box</h2>
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </div>

            {/* Empty State / Initial Instructions */}
            {!isSearching && !clarification && matches.length === 0 && alternatives.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                <Terminal className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">System Ready</p>
                <p className="text-sm">Initiate a search to activate agents.</p>
              </div>
            )}

            {/* Clarification Prompt */}
            {clarification && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">Clarification Needed</h3>
                    <p className="text-slate-300 text-sm mb-4">{clarification}</p>
                    <p className="text-xs text-slate-500">Please type a more specific query in the command bar above.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table (Matches & Alternatives) */}
            {(matches.length > 0 || alternatives.length > 0) && (
              <div className="space-y-6 animate-in fade-in duration-500">

                {/* Best Matches */}
                {matches.length > 0 && (
                  <div className="bg-amber-500/5 backdrop-blur border border-amber-500/20 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-amber-500/20 bg-amber-500/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        <h3 className="text-sm font-semibold text-amber-300">Best Matches ({matches.length})</h3>
                      </div>
                      <span className="text-xs text-amber-400/70 font-mono">High Confidence</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-amber-500/10 text-left">
                            <th className="px-6 py-3 text-xs font-semibold text-amber-400/70 uppercase">Part Number</th>
                            <th className="px-6 py-3 text-xs font-semibold text-amber-400/70 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-amber-400/70 uppercase">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matches.map((p, i) => (
                            <tr key={i} className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors">
                              <td className="px-6 py-3 font-mono text-sm text-amber-300">{p.part_number}</td>
                              <td className="px-6 py-3 text-sm text-slate-300">{p.name}</td>
                              <td className="px-6 py-3 text-xs font-mono text-amber-500">
                                {Math.min(100, Math.round((p.combined_score || 0) * 100))}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Alternatives */}
                {alternatives.length > 0 && (
                  <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
                      <h3 className="text-sm font-semibold text-amber-200/80">Alternatives & Related ({alternatives.length})</h3>
                      <MoreVertical className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {alternatives.map((p, i) => (
                            <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                              <td className="px-6 py-3 font-mono text-sm text-slate-400">{p.part_number}</td>
                              <td className="px-6 py-3 text-sm text-slate-400">{p.name}</td>
                              <td className="px-6 py-3 text-xs font-mono text-slate-600">
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

          {/* Neural Log */}
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Neural Log</h2>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 font-mono text-xs text-emerald-500/80">
              {logs.length === 0 ? (
                <p className="text-slate-700 italic">Waiting for input triggers...</p>
              ) : (
                logs.map((log, i) => (
                  <p key={i} className="mb-1 break-words animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-slate-600 mr-2">&gt;</span>
                    {log}
                  </p>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
