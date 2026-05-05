"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step3Images({ tourId, next }: any) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!files || !tourId) {
      console.error("Missing files or tourId");
      return;
    }

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileName = `${tourId}/${Date.now()}-${file.name}`;

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("tour-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // 2. Get public URL
      const { data } = supabase.storage
        .from("tour-images")
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      uploadedUrls.push(publicUrl);
    }

    // 3. Save URLs in DB
    const rows = uploadedUrls.map((url) => ({
      tour_id: tourId,
      image_url: url,
    }));

    const { error: dbError } = await supabase
      .from("tour_images")
      .insert(rows);

    if (dbError) {
      console.error("DB error:", dbError);
      setUploading(false);
      return;
    }

    setUploading(false);
    next(uploadedUrls);
  }

  return (
    <div>
      <h1>Step 3: Upload Images</h1>

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="btn cursor-pointer"
      >
        {uploading ? "Uploading..." : "Next"}
      </button>
    </div>
  );
}