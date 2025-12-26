"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VendorStats } from "@/components/dashboard/VendorStats";
import { RFQProvider } from "@/context/RFQContext";
import { OpenRFQs } from "@/components/dashboard/vendor/OpenRFQs";
import { MyQuotes } from "@/components/dashboard/vendor/MyQuotes";
import { LayoutDashboard, Package, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'marketplace' | 'my-quotes' | 'stats'>('marketplace');

    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        if (userRole && !["vendor", "both", "admin"].includes(userRole)) {
            router.push("/dashboard");
        }
    }, [router]);

    return (
        <RFQProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 -mx-8 -mt-8 px-8 py-4 sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Vendor Portal</h1>
                            <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-2"></div>

                            {/* Navigation Tabs */}
                            <div className="flex space-x-1">
                                <Button
                                    variant={activeTab === 'marketplace' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setActiveTab('marketplace')}
                                    className={activeTab === 'marketplace' ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : ""}
                                >
                                    Marketplace
                                </Button>
                                <Button
                                    variant={activeTab === 'my-quotes' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setActiveTab('my-quotes')}
                                    className={activeTab === 'my-quotes' ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : ""}
                                >
                                    My Quotes
                                </Button>
                                <Button
                                    variant={activeTab === 'stats' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setActiveTab('stats')}
                                    className={activeTab === 'stats' ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : ""}
                                >
                                    Statistics
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/profile')} className="gap-2 text-zinc-600">
                                <User className="h-4 w-4" />
                                Profile
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        localStorage.clear()
                                        window.location.href = "/login"
                                    }
                                }}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {activeTab === 'marketplace' && <OpenRFQs />}
                        {activeTab === 'my-quotes' && <MyQuotes />}
                        {activeTab === 'stats' && <VendorStats />}
                    </div>
                </div>
            </div>
        </RFQProvider>
    );
}
