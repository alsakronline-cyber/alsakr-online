import React from 'react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
            <div className="max-w-4xl text-center">
                <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
                    AL SAKR ONLINE V2
                </h1>
                <p className="text-xl text-slate-400 mb-12">
                    Industrial AI Command Center. 10 Agents. Zero Latency.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="/command-center" className="p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition-all group">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400">Command Center</h2>
                        <p className="text-slate-500">Access the 10-Agent Swarm for Sourcing, RFQs, and Tech Specs.</p>
                    </a>

                    <a href="/vendor/marketplace" className="p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500 transition-all group">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-indigo-400">Vendor Portal</h2>
                        <p className="text-slate-500">Manage inventory and respond to live industrial inquiries.</p>
                    </a>
                </div>

                <div className="mt-12 text-slate-600 flex gap-8 justify-center">
                    <a href="https://crm.app.alsakronline.com/_/" className="hover:text-slate-400">Admin CRM</a>
                    <a href="https://workflows.app.alsakronline.com/" className="hover:text-slate-400">Flow Engine</a>
                    <a href="https://api.app.alsakronline.com/api/health" className="hover:text-slate-400">System Health</a>
                </div>
            </div>
        </div>
    );
}
