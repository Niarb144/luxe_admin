"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step5Images({ tourId, next }: any) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mainIndex, setMainIndex] = useState<number>(0);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleFileChange(e: any) {
    const selected = e.target.files;
    setFiles(selected);

    if (selected) {
      const urls = Array.from(selected).map((file: any) =>
        URL.createObjectURL(file)
      );
      setPreviews(urls);
      setMainIndex(0);
    }
  }

  async function handleUpload() {
    if (!files || !tourId) return;

    setUploading(true);

    const uploadedRows: any[] = [];

    for (let i = 0; i < Array.from(files).length; i++) {
      const file = Array.from(files)[i];

      const fileName = `${tourId}/${Date.now()}-${file.name}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("tour-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from("tour-images")
        .getPublicUrl(fileName);

      uploadedRows.push({
        tour_id: tourId,
        image_url: data.publicUrl,
        is_main: i === mainIndex,
      });
    }

    // Save to DB
    const { error: dbError } = await supabase
      .from("tour_images")
      .insert(uploadedRows);

    if (dbError) {
      console.error(dbError);
      setUploading(false);
      return;
    }

    setUploading(false);
    next(uploadedRows);
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-400/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-2">Create Tour</h1>
        <p className="text-gray-500 mb-6">Step 5: Upload Images</p>

        {/* Upload Box */}
        <div className="mb-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Preview Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {previews.map((src, index) => (
              <div
                key={index}
                onClick={() => setMainIndex(index)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                  mainIndex === index
                    ? "border-amber-500"
                    : "border-white/10"
                }`}
              >
                <img
                  src={src}
                  className="w-full h-40 object-cover"
                />

                {/* Main badge */}
                {mainIndex === index && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Helper text */}
        <p className="text-sm text-gray-400 mb-6">
          Click an image to set it as the cover photo
        </p>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold cursor-pointer"
        >
          {uploading ? "Uploading..." : "Next Step"}
        </button>

      </div>
    </div>
  );
}