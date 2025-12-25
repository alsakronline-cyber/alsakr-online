"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token')
        if (!userId || !token) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/notifications?user_id=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            const notifs = data.notifications || []
            setNotifications(notifs)
            setUnreadCount(notifs.filter((n: any) => !n.is_read).length)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000) // Poll every 60s
        return () => clearInterval(interval)
    }, [userId])

    const markAsRead = async (id: string) => {
        const token = localStorage.getItem('token')
        if (!token) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            fetchNotifications()
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const clearAll = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.app.alsakronline.com'}/api/notifications/clear?user_id=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setNotifications([])
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to clear notifications:', error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-sm font-bold">Notifications</span>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs text-zinc-500 hover:text-red-500">
                        Clear all
                    </Button>
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={`flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                                onClick={() => markAsRead(n.id)}
                            >
                                <div className="flex justify-between w-full">
                                    <Badge variant="outline" className="text-[10px] uppercase">{n.type.replace('_', ' ')}</Badge>
                                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium leading-tight">{n.message}</p>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
