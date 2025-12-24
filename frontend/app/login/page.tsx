"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const formDataBody = new URLSearchParams()
            formDataBody.append("username", formData.username)
            formDataBody.append("password", formData.password)

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.app.alsakronline.com"}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formDataBody,
            })

            if (!res.ok) {
                throw new Error("Invalid email or password")
            }

            const data = await res.json()
            localStorage.setItem("token", data.access_token)
            router.push("/dashboard")
        } catch (err) {
            setError("Invalid email or password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col relative bg-zinc-900 text-white p-10 justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-900/20" />
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">N</div>
                        Nexus Ind.
                    </Link>
                </div>
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-bold mb-4">Empowering Industrial Procurement</h1>
                    <p className="text-zinc-400 text-lg">
                        Access millions of parts, automate your RFQs, and streamline your supply chain with AI-driven intelligence.
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
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h2>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>Enter your email and password to login</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            className="pl-9 bg-white dark:bg-zinc-950"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-9 bg-white dark:bg-zinc-950"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
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
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <div className="text-center text-sm text-zinc-500">
                                Don't have an account?{" "}
                                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Create an account
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
