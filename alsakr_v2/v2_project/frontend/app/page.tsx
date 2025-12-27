"use client";

import React from 'react';
import {
    Zap,
    ShieldCheck,
    Cpu,
    LayoutDashboard,
    Database,
    Network,
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    const stats = [
        { label: "Active Agents", value: "10", icon: <Cpu className="w-4 h-4" /> },
        { label: "System Latency", value: "< 50ms", icon: <Zap className="w-4 h-4" /> },
        { label: "Uptime", value: "99.99%", icon: <ShieldCheck className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

            <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">
                {/* Navbar-ish Header */}
                <header className="flex justify-between items-center mb-24">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <Network className="text-white w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">AL SAKR <span className="text-blue-500">V2</span></span>
                    </div>

                    <div className="hidden md:flex gap-6 items-center">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] uppercase tracking-widest text-slate-400">
                                <span className="text-blue-400">{stat.icon}</span>
                                <span>{stat.label}:</span>
                                <span className="text-white font-bold">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </header>

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                            The <span className="text-gradient">Industrial Swarm</span> <br />
                            is Now Operational.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-12">
                            Next-generation agentic infrastructure for the global industrial marketplace.
                            Powered by a 10-agent orchestrator for unmatched precision in sourcing and procurement.
                        </p>
                    </motion.div>

                    <div className="flex flex-center flex-wrap gap-4">
                        <a href="/command-center" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all">
                            Initialize Command Center <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="https://api.app.alsakronline.com/api/health" className="px-8 py-4 glass text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
                            System Health
                        </a>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid-2">
                    {/* Main App Card */}
                    <motion.a
                        href="/command-center"
                        className="group glass p-8 rounded-[2rem] glass-hover flex flex-col justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div>
                            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex-center mb-6 group-hover:scale-110 transition-transform">
                                <LayoutDashboard className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Commander Console</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Connect to the Agent Swarm. Identify parts via image, generate RFQs, and cross-reference multi-vendor catalogs instantly.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-bold text-blue-400">Launch Swarm</span>
                            <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.a>

                    {/* Vendor Card */}
                    <motion.a
                        href="/vendor/marketplace"
                        className="group glass p-8 rounded-[2rem] glass-hover flex flex-col justify-between"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div>
                            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 rounded-2xl flex-center mb-6 group-hover:scale-110 transition-transform">
                                <Database className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-white">Vendor Portal</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Seamlessly upload inventory and respond to autonomous procurement agents. Scalable marketplace infrastructure for verified suppliers.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-bold text-indigo-400">Access Marketplace</span>
                            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.a>
                </div>

                {/* Footer Connections */}
                <footer className="mt-32 pt-12 border-t border-slate-900 flex flex-wrap justify-between items-center gap-8">
                    <div className="text-slate-500 text-sm">
                        © 2025 AL SAKR ONLINE V2. PRODUCTION READY.
                    </div>
                    <div className="flex gap-6">
                        <a href="https://crm.app.alsakronline.com/_/" className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                            Management Plane <ExternalLink className="w-3 h-3" />
                        </a>
                        <a href="https://workflows.app.alsakronline.com/" className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                            n8n Automation <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </footer>
            </main>

            <style jsx global>{`
        /* Inline CSS for immediate impact without complex tailwind build in docker for now */
        .flex-center { display: flex; align-items: center; justify-content: center; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        
        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(51, 65, 85, 0.3);
        }
        
        .glass-hover:hover {
          background: rgba(30, 41, 59, 0.5);
          border-color: #3b82f6;
          transform: translateY(-4px);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Simplified Tailwind-like utility classes for this page */
        .mx-auto { margin-left: auto; margin-right: auto; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .mb-24 { margin-bottom: 6rem; }
        .mb-12 { margin-bottom: 3rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mt-12 { margin-top: 3rem; }
        .mt-32 { margin-top: 8rem; }
        .max-w-6xl { max-width: 72rem; }
        .max-w-4xl { max-width: 56rem; }
        .max-w-2xl { max-width: 42rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-full { border-radius: 9999px; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-5xl { font-size: 3rem; }
        .text-7xl { font-size: 4.5rem; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .leading-tight { line-height: 1.25; }
        .leading-relaxed { line-height: 1.625; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .uppercase { text-transform: uppercase; }
        .fixed { position: fixed; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .overflow-hidden { overflow: hidden; }
        .z-10 { z-index: 10; }
        .blur-[120px] { filter: blur(120px); }
        .text-center { text-align: center; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .flex-wrap { flex-wrap: wrap; }
        .w-10 { width: 2.5rem; }
        .h-10 { height: 2.5rem; }
        .w-14 { width: 3.5rem; }
        .h-14 { height: 3.5rem; }
        .w-5 { width: 1.25rem; }
        .h-5 { height: 1.25rem; }
      `}</style>
        </div>
    );
}
