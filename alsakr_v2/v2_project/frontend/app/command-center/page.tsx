"use client";

import React, { useState, useEffect } from 'react';
import {
  Camera, ShoppingCart, Scale, Shield, FileText, Mic,
  MapPin, Activity, Wrench, Users, Bell, Settings, HelpCircle,
  MoreVertical, ChevronRight, Zap
} from 'lucide-react';

const AGENTS = [
  { id: 1, name: 'VisualMatch', icon: Camera, status: 'active', color: 'cyan' },
  { id: 2, name: 'MultiVendor', icon: ShoppingCart, status: 'active', color: 'cyan' },
  { id: 3, name: 'QuoteCompare', icon: Scale, status: 'negotiating', color: 'amber' },
  { id: 4, name: 'InventoryVoice', icon: Mic, status: 'idle', color: 'gray' },
  { id: 5, name: 'TechDoc + Asset', icon: FileText, status: 'idle', color: 'gray' },
  { id: 6, name: 'ComplianceGuide', icon: Shield, status: 'idle', color: 'gray' },
  { id: 7, name: 'Service & DeadStock', icon: Wrench, status: 'negotiating', color: 'amber' },
  { id: 8, name: 'AutoReplenish', icon: Activity, status: 'active', color: 'cyan' },
  { id: 9, name: 'Troubleshooter', icon: Wrench, status: 'negotiating', color: 'amber' },
  { id: 10, name: 'SupplierHub', icon: Users, status: 'idle', color: 'gray' },
];

const PROJECTS = [
  { name: 'Project Riyadh', team: '500 Valves - Negotiating with 3 Vendors', status: 'Sindear' },
  { name: 'Project Riyadh', team: '500 Valves - Negotiating', status: 'Safety' },
  { name: 'Project Riyadh', team: '500 Valves - Negotiating', status: 'Supplier' },
  { name: 'Project Riyadh', team: '500 Valves - Receiving 3 quotes', status: 'Safety' },
  { name: 'Project Riyadh', team: '500 Valves - Supplier', status: 'Sales' },
];

export default function CommandCenter() {
  const [logs, setLogs] = useState([
    '> [14:02:11] VISUAL_MATCH: Image analyzed. 98% match for SKF 6205 Bearing.',
    '> [14:02:15] MULTI_VENDOR: Querying 45 local suppliers via WhatsApp API...',
    '> [14:02:30] QUOTE_COMPARE: Received 3 quotes. Lowest landed cost: Supplier B.',
  ]);

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex">
      {/* Left Navbar */}
      <div className="w-12 bg-slate-950 flex flex-col items-center py-4 gap-4 border-r border-slate-800">
        <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
          <Zap className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <button className="w-8 h-8 text-amber-500 hover:bg-slate-800 rounded flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
              <div className="w-1.5 h-1.5 bg-current rounded-sm" />
            </div>
          </button>
          <button className="w-8 h-8 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded flex items-center justify-center">
            <Users className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <button className="w-8 h-8 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 text-slate-500 hover:bg-slate-800 hover:text-slate-300 rounded flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-slate-300">Al Sakr Online: Industrial AI Command Center</h1>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 text-slate-400 hover:text-slate-300 rounded flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 text-slate-400 hover:text-slate-300 rounded flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-slate-700 rounded-full" />
          </div>
        </div>

        {/* Command Input */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/50 border border-amber-500/30 rounded-lg px-4 py-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <input
              type="text"
              placeholder="Command your agents... (e.g., 'Find 50 DN50 Valves' or 'Upload broken gear photo')"
              className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none"
            />
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300">⌘K</button>
          </div>
        </div>

        {/* 3-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Agent Dock */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium text-slate-400">Agent Dock</h2>
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-2">
              {AGENTS.map(agent => (
                <div
                  key={agent.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${agent.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300' :
                      agent.color === 'amber' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  <agent.icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium flex-1">{agent.name}</span>
                  {agent.color !== 'gray' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.color === 'cyan' ? 'bg-cyan-400' : 'bg-amber-400'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bento Box */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-300">Bento Box</h2>
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* MTD Savings */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-xs text-slate-400 mb-2">MTD Savings:</div>
                <div className="text-4xl font-bold text-cyan-400">$14,500</div>
              </div>

              {/* Critical Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                <div className="text-xs text-amber-400 font-medium mb-1">CRITICAL ALERT:</div>
                <div className="text-sm text-amber-300 mb-3">Pump #4 Vibration - Order Replacement</div>
                {/* Waveform Graph */}
                <svg className="w-full h-16" viewBox="0 0 200 40">
                  <path
                    d="M0,20 L10,20 L15,10 L20,30 L25,5 L30,35 L35,15 L40,25 L50,20 L60,15 L65,25 L70,10 L75,30 L80,20 L90,18 L100,22 L110,15 L115,25 L120,10 L125,30 L130,20 L140,25 L150,15 L160,20 L170,18 L180,22 L190,20 L200,20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-400"
                  />
                </svg>
              </div>
            </div>

            {/* Active Sourcing Projects */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700">
                <h3 className="text-sm font-medium text-slate-300">Active Sourcing Projects</h3>
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-700">
                    <th className="text-left px-6 py-2 font-medium">Project</th>
                    <th className="text-left px-6 py-2 font-medium">Team</th>
                    <th className="text-left px-6 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PROJECTS.map((project, i) => (
                    <tr key={i} className={`text-xs ${i === 0 ? 'bg-amber-500/5' : ''} hover:bg-slate-800/30 transition-colors`}>
                      <td className="px-6 py-3 text-slate-400">
                        <span className={`inline-block w-12 text-center py-0.5 rounded text-[10px] ${i === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'
                          }`}>Project</span>
                      </td>
                      <td className="px-6 py-3 text-slate-300">{project.team}</td>
                      <td className="px-6 py-3 text-slate-400">{project.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Neural Log */}
          <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h2 className="text-xs font-medium text-slate-400">Neural Log</h2>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
