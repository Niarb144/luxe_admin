import TourPricingForm from "@/components/TourPricingForm";

export default function TourPricingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-900">
      <div className="max-w-5xl mx-auto p-10">
        <h1 className="text-3xl font-bold mb-6">Tour Pricing Management</h1>
        <p className="mb-4 text-gray-700">
          Manage tour pricing details, including base price, seasonal adjustments, and discounts.
        </p>
        <TourPricingForm />
        </div>
    </div>
    );
}