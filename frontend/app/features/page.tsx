"use client"

import { motion } from "framer-motion"
import { Search, Zap, Globe, Shield, Cpu, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
    {
        icon: Search,
        title: "Multimodal Search",
        description: "Search for parts using text, voice, or even images. Our AI identifies technical drawings and specifications instantly.",
    },
    {
        icon: Zap,
        title: "Instant RFQ Automation",
        description: "Upload your BOM (Bill of Materials) and get automated quotes from multiple verified vendors in minutes, not days.",
    },
    {
        icon: Cpu,
        title: "AI-Powered Intelligence",
        description: "Nexus AI analyzes market trends, pricing history, and vendor reliability to ensure you get the best deal every time.",
    },
    {
        icon: Globe,
        title: "Global Vendor Network",
        description: "Connect with certified suppliers from across the globe. We handle the logistics so you can focus on production.",
    },
    {
        icon: Shield,
        title: "Verified Quality",
        description: "Every part is sourced from authorized distributors. We guarantee authenticity and compliance with industrial standards.",
    },
    {
        icon: BarChart3,
        title: "Procurement Analytics",
        description: "Track your spending, analyze lead times, and optimize your supply chain with our advanced dashboard.",
    },
]

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-zinc-50 to-indigo-500/10 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-indigo-950/20" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6"
                    >
                        The Future of <span className="text-indigo-600 dark:text-indigo-400">Industrial Sourcing</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10"
                    >
                        Nexus Industrial combines cutting-edge AI with a vast supplier network to revolutionize how you buy and sell spare parts.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8">
                            <Link href="/register">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to streamline your procurement?</h2>
                    <p className="text-zinc-400 mb-10 text-lg">
                        Join thousands of engineers and procurement managers who trust Nexus Industrial for their spare parts needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Link href="/register">Create Free Account</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-white">
                            <Link href="/contact">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
