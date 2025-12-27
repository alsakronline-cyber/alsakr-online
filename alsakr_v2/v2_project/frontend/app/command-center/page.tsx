"use client";

import React, { useState } from 'react';
import { Send, Sparkles, Terminal, Package, DollarSign, FileText } from 'lucide-react';

const AGENTS = [
  { id: 1, name: 'VisualMatch', status: 'idle', color: 'zinc' },
  { id: 2, name: 'MultiVendor', status: 'thinking', color: 'blue' },
  { id: 3, name: 'QuoteCompare', status: 'idle', color: 'zinc' },
  { id: 4, name: 'SafeGuard', status: 'idle', color: 'zinc' },
  { id: 5, name: 'TechAssistant', status: 'idle', color: 'zinc' },
  { id: 6, name: 'InventoryVoice', status: 'idle', color: 'zinc' },
  { id: 7, name: 'LocalSourcer', status: 'active', color: 'emerald' },
  { id: 8, name: 'Troubleshoot', status: 'idle', color: 'zinc' },
  { id: 9, name: 'AutoReplenish', status: 'idle', color: 'zinc' },
  { id: 10, name: 'SupplierHub', status: 'idle', color: 'zinc' },
];

const ACTIVITY_LOG = [
  '[MultiVendor] Querying 8 verified suppliers for SKF-6205-2RS1',
  '[LocalSourcer] Found service provider 12km away - Certified SKF installer',
  '[QuoteCompare] Best price: $24.50 USD | Lead time: 3 days',
  '[SafeGuard] HS Code verified: 8482.10.50 | Compliance: OK',
];

export default function CommandCenter() {
  const [message, setMessage] = useState('');
  const [activePanel, setActivePanel] = useState<'chat' | 'log' | 'data'>('chat');

  return (
    <div className="h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Al Sakr AI</div>
              <div className="text-[10px] text-zinc-500 font-mono">COMMAND CENTER</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider mb-3 px-2">Active Agents</div>
          <div className="space-y-1">
            {AGENTS.map(agent => (
              <div key={agent.id} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-zinc-800 transition-colors cursor-pointer group">
                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 animate-pulse-dot' :
                    agent.status === 'thinking' ? 'bg-blue-500 animate-pulse-dot' :
                      'bg-zinc-700'
                  }`} />
                <span className="text-xs text-zinc-400 group-hover:text-white transition-colors font-mono">
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-zinc-800">
          <div className="text-[9px] text-zinc-600 font-mono text-center">
            LATENCY: <span className="text-emerald-500">47ms</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActivePanel('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activePanel === 'chat' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActivePanel('log')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${activePanel === 'log' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                }`}
            >
              <Terminal className="w-3 h-3" />
              Activity Log
            </button>
            <button
              onClick={() => setActivePanel('data')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activePanel === 'data' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                }`}
            >
              Data View
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            <span>All systems operational</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activePanel === 'chat' && <ChatView message={message} setMessage={setMessage} />}
          {activePanel === 'log' && <LogView />}
          {activePanel === 'data' && <DataView />}
        </div>
      </div>
    </div>
  );
}

function ChatView({ message, setMessage }: { message: string; setMessage: (m: string) => void }) {
  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex gap-3 animate-slide-in">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Hello! I can help you source industrial parts, compare prices, and manage your supply chain. What are you looking for?
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4 bg-zinc-900">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about parts, pricing, or inventory..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-blue-600 transition-colors"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-zinc-600 text-center mt-2 font-mono">
          Press Cmd+K for quick actions
        </div>
      </div>
    </div>
  );
}

function LogView() {
  return (
    <div className="h-full bg-zinc-950 p-6 overflow-y-auto font-mono">
      <div className="max-w-4xl mx-auto space-y-1 text-xs">
        {ACTIVITY_LOG.map((log, i) => (
          <div key={i} className="text-zinc-400 hover:text-emerald-400 transition-colors animate-slide-in flex gap-3">
            <span className="text-zinc-700">{String(i + 1).padStart(3, '0')}</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataView() {
  return (
    <div className="h-full bg-zinc-950 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-white">SKF-6205-2RS1</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Material</span>
              <span className="text-white font-mono">Chrome Steel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">HS Code</span>
              <span className="text-white font-mono">8482.10.50</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-white">Best Quote</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Price</span>
              <span className="text-emerald-500 font-mono font-bold">$24.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Lead Time</span>
              <span className="text-white font-mono">3 days</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">Documents</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="text-zinc-400 hover:text-blue-500 cursor-pointer transition-colors">
              SKF_Manual.pdf
            </div>
            <div className="text-zinc-400 hover:text-blue-500 cursor-pointer transition-colors">
              Technical_Specs.dwg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
