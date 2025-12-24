"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, Loader2, User, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        email: "",
        password: "",
        role: "buyer" as "buyer" | "vendor" | "both",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.app.alsakronline.com"}/api/auth/register?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}&role=${encodeURIComponent(formData.role)}&full_name=${encodeURIComponent(formData.fullName)}&company_name=${encodeURIComponent(formData.companyName)}`, {
                method: "POST",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || "Registration failed")
            }

            // Automatically redirect to login
            router.push("/login?registered=true")
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col relative bg-zinc-900 text-white p-10 justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-indigo-950/20 to-zinc-900" />
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">N</div>
                        Nexus Ind.
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold mb-4">Join the Future of Industry</h1>
                    <p className="text-zinc-400 text-lg">
                        Create an account to access our global marketplace, request instant quotes, and manage your procurement with AI.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-zinc-500">
                    © 2024 Alsakr Online. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Create an account</h2>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Get started with Nexus Industrial today.
                        </p>
                    </div>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Sign Up</CardTitle>
                            <CardDescription>Enter your details to register</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <Label>I want to:</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: "buyer" })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.role === "buyer"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                                                }`}
                                        >
                                            <div className="text-sm font-medium">Buy</div>
                                            <div className="text-xs text-zinc-500">Parts & Equipment</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: "vendor" })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.role === "vendor"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                                                }`}
                                        >
                                            <div className="text-sm font-medium">Sell</div>
                                            <div className="text-xs text-zinc-500">Supply Products</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: "both" })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.role === "both"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300"
                                                }`}
                                        >
                                            <div className="text-sm font-medium">Both</div>
                                            <div className="text-xs text-zinc-500">Buy & Sell</div>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="fullName"
                                                placeholder="John Doe"
                                                className="pl-9 bg-white dark:bg-zinc-950"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                            <Input
                                                id="companyName"
                                                placeholder="Acme Inc."
                                                className="pl-9 bg-white dark:bg-zinc-950"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            className="pl-9 bg-white dark:bg-zinc-950"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-9 bg-white dark:bg-zinc-950"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-300"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <div className="text-center text-sm text-zinc-500">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
