export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">System Admin</h1>
            <div className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold mb-4">Scraper Control</h3>
                    <div className="flex gap-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded">Start SICK Scraper</button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded">Stop All</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
