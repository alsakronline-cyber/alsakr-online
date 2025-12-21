export default function VendorDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-gray-500">New RFQs</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-gray-500">Active Quotes</h3>
                    <p className="text-3xl font-bold text-orange-500">5</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-gray-500">Win Rate</h3>
                    <p className="text-3xl font-bold text-green-600">65%</p>
                </div>
            </div>
        </div>
    )
}
