"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MapPin, Phone, Send, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/LanguageProvider"

export default function ContactPage() {
    const { language } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.app.alsakronline.com"}/api/contact/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                throw new Error("Failed to send message")
            }

            setSuccess(true)
            setFormData({ name: "", email: "", subject: "", message: "" })
        } catch (err) {
            setError("Failed to send message. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Contact Us</h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Get in touch with the Nexus Industrial team. We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-indigo-500" />
                                    Email Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-zinc-600 dark:text-zinc-400">
                                <p>support@alsakronline.com</p>
                                <p>sales@alsakronline.com</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-indigo-500" />
                                    Call Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-zinc-600 dark:text-zinc-400">
                                <p>+971 4 123 4567 (UAE)</p>
                                <p>+966 1 234 5678 (KSA)</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-indigo-500" />
                                    Visit Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-zinc-600 dark:text-zinc-400">
                                <p>123 Industrial Area</p>
                                <p>Dubai, UAE</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <CardTitle>Send a Message</CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you within 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-8 rounded-lg text-center"
                                >
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="h-6 w-6 text-green-600 dark:text-green-300" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                    <p>Thank you for contacting us. We will be in touch shortly.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-6"
                                        onClick={() => setSuccess(false)}
                                    >
                                        Send Another Message
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@company.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Inquiry about..."
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="How can we help you?"
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-sm">{error}</div>
                                    )}

                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Message <Send className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
