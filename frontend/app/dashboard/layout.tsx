import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white p-6">
                <h2 className="text-xl font-bold mb-8">Alsakr Online</h2>
                <nav className="space-y-4">
                    <Link href="/dashboard/buyer" className="block hover:text-blue-400">Buyer Dashboard</Link>
                    <Link href="/dashboard/vendor" className="block hover:text-blue-400">Vendor Portal</Link>
                    <Link href="/dashboard/admin" className="block hover:text-blue-400">Admin Panel</Link>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50">
                {children}
            </main>
        </div>
    )
}
