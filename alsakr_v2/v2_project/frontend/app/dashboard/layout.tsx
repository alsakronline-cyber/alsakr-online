"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, MessageSquare, ShoppingBag, LogOut, Package } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Inquiries', href: '/dashboard/inquiries', icon: MessageSquare },
        { label: 'Saved Products', href: '/dashboard/saved', icon: ShoppingBag }, // Future feature
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Package className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">Al Sakr</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            {session?.user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {session?.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
