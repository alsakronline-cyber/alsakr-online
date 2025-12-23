import VendorSidebar from "./_components/VendorSidebar"
import VendorHeader from "./_components/VendorHeader"
import VendorKPICards from "./_components/VendorKPICards"
import RecentInquiriesTable from "./_components/RecentInquiriesTable"

export default function VendorDashboard() {
    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <VendorSidebar />

            <main className="flex-1 overflow-auto bg-black/20">
                <VendorHeader />

                <div className="p-8 space-y-8">
                    <VendorKPICards />
                    <RecentInquiriesTable />
                </div>
            </main>
        </div>
    )
}
