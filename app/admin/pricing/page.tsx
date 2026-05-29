import Link from "next/link";
import TourPricingForm from "@/components/TourPricingForm";
import TourPricingView from "@/components/TourPricingView";

export default function TourPricingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-900">
        <div className="max-w-5xl mx-auto p-10">
            <h1 className="text-3xl font-bold mb-6">Tour Pricing Management</h1>
            <p className="text-lg text-gray-700 mb-4">
                Manage your tour pricing tiers and details here.
            </p>
            <div>
                <Link
                    href="/admin/pricing/create"
                    className="inline-block mb-6 px-4 py-2 bg-amber-500 text-black font-semibold rounded hover:bg-amber-600 transition"
                >
                    Create New Pricing Tier
                </Link>
            </div>
            {/* Placeholder content */}
            {/* <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
                Tour pricing management interface coming soon!
            </div> */}
            <div className="mb-10">
                <TourPricingView />
            </div>
        </div>
    </div>
    );
}   