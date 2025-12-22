import Link from "next/link"
import { LucideCamera, LucideMic, LucideSearch, LucidePackage, LucideZap, LucideDatabase, LucideArrowRight } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background font-sans">
            {/* Transparent Glass Header */}
            <header className="fixed top-0 w-full z-50 px-4 lg:px-6 h-20 flex items-center backdrop-blur-md bg-background/50 border-b border-white/10 transition-all">
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center justify-center gap-2 font-heading font-bold text-2xl tracking-tight text-white" href="#">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                            N
                        </div>
                        Nexus Industrial
                    </Link>
                    <nav className="hidden md:flex gap-8">
                        <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/features">
                            Features
                        </Link>
                        <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/dashboard/vendor">
                            Vendor Portal
                        </Link>
                        <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/pricing">
                            Pricing
                        </Link>
                        <Link className="text-sm font-medium text-gray-300 hover:text-white transition-colors" href="/contact">
                            Contact
                        </Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link
                            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            href="/login"
                        >
                            Log In
                        </Link>
                        <Link
                            className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-secondary to-orange-600 px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                            href="/dashboard/buyer"
                        >
                            Start Searching
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-20">
                {/* Hero Section */}
                <section className="relative w-full py-24 md:py-32 lg:py-48 overflow-hidden">
                    {/* Background Gradient Blob */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

                    <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
                        <div className="space-y-4 max-w-4xl">
                            <h1 className="text-4xl font-heading font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">
                                Find Any Industrial Part in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">Seconds</span>
                            </h1>
                            <p className="mx-auto max-w-[800px] text-gray-400 md:text-xl font-light leading-relaxed">
                                AI-powered multimodal search for 100,000+ spare parts from ABB, Siemens, Schneider Electric, and more.
                            </p>
                        </div>

                        {/* Magical Search Bar */}
                        <div className="w-full max-w-3xl relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative flex items-center bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl">
                                <div className="pl-4 text-gray-400">
                                    <LucideSearch className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by part number, description, or upload image..."
                                    className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 text-lg px-4 h-12"
                                />
                                <div className="flex gap-2 pr-2">
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Upload Image">
                                        <LucideCamera className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Voice Search">
                                        <LucideMic className="w-5 h-5" />
                                    </button>
                                    <Link href="/dashboard/buyer" className="bg-primary hover:bg-blue-600 text-white p-3 rounded-lg transition-colors">
                                        <LucideArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Brand Logos */}
                        <div className="pt-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholders for logos (Text for now) */}
                            <span className="text-xl font-bold text-white">ABB</span>
                            <span className="text-xl font-bold text-white">SIEMENS</span>
                            <span className="text-xl font-bold text-white">Schneider</span>
                            <span className="text-xl font-bold text-white">SICK</span>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full py-24 bg-gray-900/50 relative">
                    <div className="container px-4 md:px-6">
                        <div className="text-center mb-16">
                            <span className="text-accent font-medium tracking-wider uppercase text-sm">Features</span>
                            <h2 className="text-3xl font-heading font-bold tracking-tight sm:text-4xl text-white mt-2">How Nexus Industrial Works</h2>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="glass-dark p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <LucideCamera className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">Multimodal Search</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Upload a photo of worn parts, speak in Arabic, or type descriptions. Our AI understands all formats.
                                </p>
                            </div>

                            <div className="glass-dark p-8 rounded-2xl relative overflow-hidden group hover:border-secondary/50 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-secondary/20 transition-all" />
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
                                    <LucideZap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">Automated RFQ</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Get quotes from 5+ verified vendors automatically. Compare prices, lead times, and reliability scores instantly.
                                </p>
                            </div>

                            <div className="glass-dark p-8 rounded-2xl relative overflow-hidden group hover:border-accent/50 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-all" />
                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                                    <LucideDatabase className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">Smart Catalog</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Access 100,000+ parts from global brands. Find obsolete part replacements with AI-powered recommendations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="w-full py-20 bg-black border-y border-white/5">
                    <div className="container px-4 md:px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                            <div className="space-y-2">
                                <h4 className="text-4xl font-bold text-white">100k+</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Industrial Parts</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-4xl font-bold text-white">5+</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Major Brands</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-4xl font-bold text-white">&lt; 2s</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Search Time</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-4xl font-bold text-white">AR/EN</h4>
                                <p className="text-sm text-gray-500 uppercase tracking-wider">Bilingual Support</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 w-full shrink-0 border-t border-white/10 bg-black">
                <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2025 Nexus Industrial (Alsakr Online). All rights reserved.</p>
                    <nav className="flex gap-6">
                        <Link className="text-sm text-gray-500 hover:text-white transition-colors" href="#">
                            Terms
                        </Link>
                        <Link className="text-sm text-gray-500 hover:text-white transition-colors" href="#">
                            Privacy
                        </Link>
                        <Link className="text-sm text-gray-500 hover:text-white transition-colors" href="#">
                            Contact
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
