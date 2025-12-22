export default function BuyerDashboard() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Find Parts</h1>
            <div className="max-w-2xl mx-auto space-y-4">
                <input
                    type="text"
                    placeholder="Search by part number, description..."
                    className="w-full p-4 text-lg border rounded-lg shadow-sm"
                />
                <div className="flex gap-4 justify-center">
                    <button className="flex items-center gap-2 text-gray-600 border px-4 py-2 rounded hover:bg-gray-50">
                        📸 Upload Image
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 border px-4 py-2 rounded hover:bg-gray-50">
                        🎙️ Voice Search
                    </button>
                </div>
            </div>
        </div>
    )
}
