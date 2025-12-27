"use client";

import React, { useState, useEffect } from 'react';
import {
  Camera, ShoppingCart, Scale, Shield, FileText, Mic,
  Package, Wrench, Activity, Users, Zap, AlertTriangle,
  DollarSign, TrendingUp, MapPin, Send
} from 'lucide-react';

const AGENTS = [
  { id: 1, name: 'VisualMatch', icon: Camera, status: 'idle', label: 'Image Recognition' },
  { id: 2, name: 'MultiVendor', icon: ShoppingCart, status: 'active', label: 'Supplier Search' },
  { id: 3, name: 'QuoteCompare', icon: Scale, status: 'negotiating', label: 'Price Comparison' },
  { id: 4, name: 'SafeGuard', icon: Shield, status: 'idle', label: 'Compliance Check' },
  { id: 5, name: 'TechAssistant', icon: FileText, status: 'idle', label: 'Documentation' },
  { id: 6, name: 'InventoryVoice', icon: Mic, status: 'idle', label: 'Voice Control' },
  { id: 7, name: 'LocalSourcer', icon: MapPin, status: 'idle', label: 'Local Services' },
  { id: 8, name: 'AutoReplenish', icon: Activity, status: 'monitoring', label: 'IoT Watchdog' },
  { id: 9, name: 'Troubleshoot', icon: Wrench, status: 'idle', label: 'Diagnostics' },
  { id: 10, name: 'SupplierHub', icon: Users, status: 'idle', label: 'CRM Manager' },
];

const NEURAL_LOGS = [
  { time: '10:45:22', agent: 'VISUAL_MATCH', message: 'Image analyzed. 98% match for SKF 6205 Bearing', type: 'success' },
  { time: '10:45:25', agent: 'MULTI_VENDOR', message: 'Querying 45 local suppliers via WhatsApp API...', type: 'info' },
  { time: '10:45:40', agent: 'QUOTE_COMPARE', message: 'Received 3 quotes. Lowest landed cost: Supplier B ($24.50)', type: 'success' },
  { time: '10:45:55', agent: 'SAFEGUARD', message: 'HS Code verified: 8482.10.50 | Compliance: OK', type: 'success' },
  { time: '10:46:10', agent: 'HAGGLE_AGENT', message: 'Negotiating with Vendor X - Requesting 8% discount', type: 'warn' },
  { time: '10:46:25', agent: 'AUTO_REPLENISH', message: 'IoT Alert: Pump #4 Vibration High - Flagging for replacement', type: 'warn' },
];

export default function CommandCenter() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState(NEURAL_LOGS);

  useEffect(() => {
    // Simulate new logs
    const interval = setInterval(() => {
      const newLog = {
        time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8),
        agent: AGENTS[Math.floor(Math.random() * AGENTS.length)].name.toUpperCase(),
        message: 'Processing query...',
        type: 'info' as const
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Command Bar */}
      <div className="h-16 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">AL SAKR</span>
        </div>

        <div className="flex-1 max-w-3xl">
          <div className="relative command-input">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Command your agents... (e.g., 'Find 50 DN50 Valves' or 'Upload broken gear photo')"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 pr-20 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors">
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse-cyan" />
              </button>
              <button className="w-8 h-8 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center transition-colors">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-zinc-400" />
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Agent Dock (15%) */}
        <div className="w-[15%] bg-zinc-900 border-r border-zinc-800 overflow-y-auto">
          <div className="p-4">
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-4">AGENT STATUS</div>
            <div className="space-y-2">
              {AGENTS.map(agent => (
                <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer group">
                  <div className="relative">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${agent.status === 'active' ? 'bg-cyan-900/50' :
                        agent.status === 'negotiating' ? 'bg-amber-900/50' :
                          agent.status === 'monitoring' ? 'bg-cyan-900/50' :
                            'bg-zinc-800'
                      }`}>
                      <agent.icon className={`w-3.5 h-3.5 ${agent.status === 'active' || agent.status === 'monitoring' ? 'text-cyan-400' :
                          agent.status === 'negotiating' ? 'text-amber-500' :
                            'text-zinc-500'
                        }`} />
                    </div>
                    {agent.status !== 'idle' && (
                      <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${agent.status === 'negotiating' ? 'bg-amber-500 animate-pulse-amber' :
                          'bg-cyan-400 animate-pulse-cyan'
                        }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                      {agent.name}
                    </div>
                    <div className="text-[9px] text-zinc-600 font-mono truncate">{agent.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Operational Workspace (55%) */}
        <div className="w-[55%] overflow-y-auto p-6">
          <div className="bento-grid">
            {/* Card 1: MTD Savings */}
            <div className="glass-card rounded-xl p-6 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono mb-1">MTD Savings</div>
                  <div className="text-4xl font-bold text-cyan-400">$14,500</div>
                </div>
                <div className="w-12 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Auto-Haggle Agent saved 18% on 47 transactions
              </div>
            </div>

            {/* Card 2: Critical Alerts */}
            <div className="glass-card rounded-xl p-6 border-amber-900/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono mb-1">Critical Alerts</div>
                  <div className="text-xl font-bold text-amber-500 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Pump #4
                  </div>
                </div>
                <div className="w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                High vibration detected - Replacement bearing needed
              </div>
            </div>

            {/* Card 3: Active Sourcing (Full Width) */}
            <div className="col-span-2 glass-card rounded-xl p-6 transition-all">
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono mb-4">Active Sourcing Projects</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Project Riyadh</div>
                      <div className="text-xs text-zinc-500 font-mono">500 DN50 Valves</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Status</div>
                      <div className="text-xs text-amber-500 font-mono">Negotiating with 3 vendors</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Best Quote</div>
                      <div className="text-sm font-bold text-cyan-400">$24,500</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-zinc-500" />
                    <div>
                      <div className="text-sm font-medium text-white">Emergency Stock</div>
                      <div className="text-xs text-zinc-500 font-mono">SKF 6205 Bearings x50</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Status</div>
                      <div className="text-xs text-emerald-500 font-mono">Ready to order</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Best Quote</div>
                      <div className="text-sm font-bold text-cyan-400">$1,225</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Neural Log (30%) */}
        <div className="w-[30%] bg-zinc-900 border-l border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono flex items-center justify-between">
              <span>System Neural Log</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse-cyan" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-2 ${i === 0 ? 'animate-glow' : 'opacity-80'}`}>
                <span className="text-zinc-600">[{log.time}]</span>
                <span className={
                  log.type === 'success' ? 'text-cyan-400' :
                    log.type === 'warn' ? 'text-amber-500' :
                      'text-zinc-400'
                }>
                  {log.agent}:
                </span>
                <span className="text-zinc-300 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
