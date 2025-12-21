import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link className="flex items-center justify-center font-bold text-xl text-primary" href="#">
                    Alsakr Online
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        Pricing
                    </Link>
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                        Contact
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-600 to-teal-500">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                                    Find Any Industrial Part in Seconds
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                                    AI-powered multimodal search for 100,000+ spare parts from SICK, ABB, Siemens, and more.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Link
                                    className="inline-flex h-9 items-center justify-center rounded-md bg-white text-blue-600 px-4 py-2 text-sm font-medium shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                                    href="#"
                                >
                                    Start Searching
                                </Link>
                                <Link
                                    className="inline-flex h-9 items-center justify-center rounded-md border border-white text-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                                    href="#"
                                >
                                    Watch Demo
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Features Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
                    <div className="container px-4 md:px-6">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">How It Works</h2>
                        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="p-4 bg-white rounded-full shadow-lg">
                                    📷
                                </div>
                                <h3 className="text-xl font-bold">Multimodal Search</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Upload photos, speak in Arabic, or type descriptions. Our AI understands it all.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="p-4 bg-white rounded-full shadow-lg">
                                    ⚡
                                </div>
                                <h3 className="text-xl font-bold">Automated RFQ</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Get quotes from verified vendors automatically.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="p-4 bg-white rounded-full shadow-lg">
                                    📦
                                </div>
                                <h3 className="text-xl font-bold">Smart Catalog</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Access 100,000+ parts with AI recommendations for obsolete items.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Alsakr Online. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    )
}
