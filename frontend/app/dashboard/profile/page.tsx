"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Building, Phone, Mail, Globe, Save, Loader2 } from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null

    useEffect(() => {
        if (userId) {
            fetchProfile()
        }
    }, [userId])

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/users/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            setProfile(data)
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null) // Assuming setSuccessMessage was meant to clear the existing message state

        const token = localStorage.getItem('token')
        if (!token) {
            setSaving(false)
            setMessage({ type: 'error', text: 'Authentication token not found.' })
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/users/profile/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile),
            })

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                if (typeof window !== 'undefined') {
                    localStorage.setItem("userName", profile.full_name)
                }
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving.' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Account Profile</h1>
                    <p className="text-zinc-500">Manage your personal and company information</p>
                </header>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-600" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Your basic identification details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={profile.full_name || ""}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        value={profile.email || ""}
                                        disabled
                                        className="bg-zinc-100 dark:bg-zinc-800"
                                    />
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> Email cannot be changed
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={profile.phone_number || ""}
                                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-indigo-600" />
                                Business Information
                            </CardTitle>
                            <CardDescription>Details about your organization</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input
                                    id="company"
                                    value={profile.company_name || ""}
                                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry Type</Label>
                                <Input
                                    id="industry"
                                    value={profile.industry_type || ""}
                                    onChange={(e) => setProfile({ ...profile, industry_type: e.target.value })}
                                    placeholder="e.g. Manufacturing, Logistics, Retail"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-indigo-600" />
                                Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="language">Preferred Language</Label>
                                <select
                                    id="language"
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    value={profile.preferred_language || "en"}
                                    onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                                >
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
