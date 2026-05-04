"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/supabase-storage";

export default function ImageUpload({ onUpload }: any) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={handleUpload} />

      {loading && <p>Uploading...</p>}
    </div>
  );
}