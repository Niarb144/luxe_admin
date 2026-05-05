"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Step6Route({ tourId, next }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [mapUrl, setMapUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSave() {
    if (!tourId) {
      console.error("Missing tourId");
      return;
    }

    setUploading(true);

    let finalUrl = "";

    // ✅ OPTION 1: If user provided a URL
    if (mapUrl.trim()) {
      finalUrl = mapUrl;
    }

    // ✅ OPTION 2: If user uploaded a file
    else if (file) {
      const fileName = `${tourId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tour_route_maps")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("tour_route_maps")
        .getPublicUrl(fileName);

      finalUrl = data.publicUrl;
    }

    // ❌ Nothing provided
    else {
      console.error("Provide either a file or a map URL");
      setUploading(false);
      return;
    }

    // ✅ Save to DB
    const { error: dbError } = await supabase
      .from("tour_route_maps")
      .insert({
        tour_id: tourId,
        map_url: finalUrl,
      });

    if (dbError) {
      console.error("DB error:", dbError);
      setUploading(false);
      return;
    }

    setUploading(false);
    next(finalUrl);
  }

  return (
    <div>
      <h1>Step 6: Route (Map or File)</h1>

      {/* 🔗 Map URL Input */}
      <input
        type="text"
        placeholder="Paste Google Maps link"
        value={mapUrl}
        onChange={(e) => setMapUrl(e.target.value)}
        className="input"
      />

      <p className="text-sm text-gray-500">OR</p>

      {/* 📁 File Upload */}
      <input
        type="file"
        accept="image/*,.gpx,.kml"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />

      <button
        onClick={handleSave}
        className="btn cursor-pointer"
        disabled={uploading}
      >
        {uploading ? "Saving..." : "Next"}
      </button>
    </div>
  );
}