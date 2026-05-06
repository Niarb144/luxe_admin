"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Step6Route({ tourId, next }: any) {
  const [mapUrl, setMapUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave() {
    if (!tourId) return;

    if (!mapUrl.trim()) {
      alert("Please add a map URL");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("tour_route_maps")
      .insert({
        tour_id: tourId,
        map_url: mapUrl.trim(),
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setLoading(false);
     router.push(`/tours/${tourId}/preview`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-2">Create Tour</h1>
        <p className="text-gray-400 mb-6">Step 6: Route Map</p>

        {/* Input */}
        <div className="mb-4">
          <label className="text-sm text-gray-300">
            Google Maps Embed URL
          </label>

          <input
            type="text"
            placeholder="Paste Google Maps embed link..."
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Helper */}
        <p className="text-xs text-gray-500 mb-6">
          Example: https://www.google.com/maps/embed?pb=...
        </p>

        {/* Preview (optional but powerful) */}
        {mapUrl.includes("http") && (
          <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
            <iframe
              src={mapUrl}
              className="w-full h-64"
              loading="lazy"
            ></iframe>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold cursor-pointer"
        >
          {loading ? "Saving..." : "Complete Tour"}
        </button>

      </div>
    </div>
  );
}