"use client";

import React, { useState } from 'react';
import {
  Camera, ShoppingCart, Scale, Shield, FileText, Mic,
  MapPin, Activity, Wrench, Users, Bell, Settings, HelpCircle,
  MoreVertical, ChevronRight, Zap, Send, TrendingUp, DollarSign,
  Package, AlertTriangle
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

export default function CommandCenter() {
  const [command, setCommand] = useState('');

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex overflow-hidden">
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
              placeholder="Command your agents... (e.g., 'Find 50 DN50 Valves' or 'Upload broken gear photo')"
              className="w-full bg-slate-800/50 border border-orange-500/30 rounded-xl pl-11 pr-20 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-xs text-slate-300 font-medium transition-colors">
                ⌘K
              </button>
              <button className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors">
                <Send className="w-3.5 h-3.5 text-white" />
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

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* MTD Savings */}
              <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">MTD Savings:</p>
                    <p className="text-4xl font-bold text-cyan-400">$14,500</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">Auto-Haggle saved 18% on 47 transactions</p>
              </div>

              {/* Critical Alert */}
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-orange-400 mb-1 uppercase tracking-wide font-bold">CRITICAL ALERT:</p>
                    <p className="text-sm text-orange-300 font-medium">Pump #4 Vibration - Order Replacement</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>

                {/* Waveform */}
                <div className="mt-4 h-16">
                  <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                    <path
                      d="M0,20 Q10,15 20,20 T40,20 Q50,10 60,20 T80,20 Q90,5 100,20 T120,20 Q130,15 140,20 T160,20 Q170,10 180,20 T200,20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-orange-400"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Sourcing Projects Table */}
            <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300">Active Sourcing Projects</h3>
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Team</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { project: 'Project', team: 'Riyadh: 500 Valves - Negotiating with 3 Vendors', status: 'Sindear', highlight: true },
                      { project: 'Project', team: 'Riyadh: 500 Valves - Negotiating', status: 'Safety', highlight: false },
                      { project: 'Project', team: 'Riyadh: 500 Valves - Negotiating', status: 'Supplier', highlight: false },
                      { project: 'Project', team: 'Riyadh: 500 Valves - Receiving 3 quotes', status: 'Safety', highlight: false },
                      { project: 'Project', team: 'Riyadh: 500 Valves - Supplier', status: 'Sales', highlight: false },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${row.highlight ? 'bg-orange-500/5' : ''}`}>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${row.highlight ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-700 text-slate-400'
                            }`}>
                            {row.project}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-300">{row.team}</td>
                        <td className="px-6 py-3 text-sm text-slate-400">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Neural Log */}
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Neural Log</h2>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2 font-mono text-xs text-emerald-400">
                <p>&gt; [14:02:11] VISUAL_MATCH:</p>
                <p className="text-emerald-300/70 ml-4">Image analyzed. 98% match for SKF 6205 Bearing.</p>

                <p className="mt-3">&gt; [14:02:15] MULTI_VENDOR:</p>
                <p className="text-emerald-300/70 ml-4">Querying 45 local suppliers via WhatsApp API...</p>

                <p className="mt-3">&gt; [14:02:30] QUOTE_COMPARE:</p>
                <p className="text-emerald-300/70 ml-4">Received 3 quotes. Lowest landed cost: Supplier B.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
