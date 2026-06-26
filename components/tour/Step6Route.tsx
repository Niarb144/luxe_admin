"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export default function Step6Route({ tourId, next, back }: any) {
  const [mapUrl, setMapUrl] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!tourId) { setFetching(false); return; }

    supabase
      .from("tour_route_maps")
      .select("id, map_url")
      .eq("tour_id", tourId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMapUrl(data.map_url);
          setExistingId(data.id);
        }
        setFetching(false);
      });
  }, [tourId]);

  async function handleSave() {
    if (!tourId) return;

    if (!mapUrl.trim()) {
      alert("Please add a map URL");
      return;
    }

    setLoading(true);

    if (existingId) {
      // Update in place — no need to delete/re-insert for a single row
      const { error } = await supabase
        .from("tour_route_maps")
        .update({ map_url: mapUrl.trim() })
        .eq("id", existingId);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("tour_route_maps")
        .insert({ tour_id: tourId, map_url: mapUrl.trim() })
        .select("id")
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setExistingId(data.id);
    }

    setLoading(false);
    next();
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading route map...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-400/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-2">Create Tour</h1>
        <p className="text-gray-500 mb-6">Step 6: Route Map</p>

        <div className="mb-4">
          <label className="text-sm text-gray-500">Google Maps Embed URL</label>
          <input
            type="text"
            placeholder="Paste Google Maps embed link..."
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            className="w-full mt-2 p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Example: https://www.google.com/maps/embed?pb=...
        </p>

        {mapUrl.includes("http") && (
          <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
            <iframe src={mapUrl} className="w-full h-64" loading="lazy" />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={back}
            className="py-3 px-6 rounded-lg border border-gray-600/10 hover:bg-gray-600/5 transition text-sm text-gray-600 cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}