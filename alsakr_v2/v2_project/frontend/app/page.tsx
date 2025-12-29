"use client";

import React from 'react';
import {
    Sparkles,
    ArrowRight,
    Zap,
    Shield,
    Globe
} from 'lucide-react';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Al Sakr <span className="text-blue-500">AI</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a href="/command-center" className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors">
                            Sign In
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full text-sm text-blue-600 dark:text-blue-400 mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>Powered by 10 AI Agents</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    Industrial Procurement,
                    <br />
                    <span className="text-blue-500">Powered by AI</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Find parts, compare prices, and manage your supply chain with intelligent agents that work 24/7.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <a
                        href="/command-center"
                        className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Start Searching
                        <ArrowRight className="w-5 h-5" />
                    </a>
                    <a
                        href="/vendor/marketplace"
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-medium border border-gray-200 dark:border-slate-700 transition-all"
                    >
                        For Vendors
                    </a>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-20">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instant Quotes</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                            Get real-time pricing from verified suppliers in seconds
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verified Network</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                            Access our curated network of industrial suppliers
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                            <Globe className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Global Reach</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm">
                            Source from local and international suppliers seamlessly
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-200 dark:border-slate-800 mt-20">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-gray-500 dark:text-slate-500">
                    <div>© 2025 Al Sakr Online. All rights reserved.</div>
                    <div className="flex gap-6">
                        <a href="https://crm.app.alsakronline.com" className="hover:text-blue-500 transition-colors">Admin</a>
                        <a href="https://workflows.app.alsakronline.com" className="hover:text-blue-500 transition-colors">Workflows</a>
                        <a href="https://api.app.alsakronline.com" className="hover:text-blue-500 transition-colors">API</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
