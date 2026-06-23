"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type SavedImage = {
  id: string;
  image_url: string;
  is_main: boolean;
};

export default function Step5Images({ tourId, next, back }: any) {
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [fetching, setFetching] = useState(true);

  // New files the user just selected (not yet uploaded)
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);

  // mainKey is either `saved-{id}` or `new-{index}`
  // so we can track the cover across both saved and new images
  const [mainKey, setMainKey] = useState<string | null>(null);

  // Load already-saved images on mount
  useEffect(() => {
    if (!tourId) { setFetching(false); return; }

    supabase
      .from("tour_images")
      .select("id, image_url, is_main")
      .eq("tour_id", tourId)
      .order("is_main", { ascending: false }) // main image first
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSavedImages(data);
          const main = data.find((img) => img.is_main);
          if (main) setMainKey(`saved-${main.id}`);
        }
        setFetching(false);
      });
  }, [tourId]);

  function handleFileChange(e: any) {
    const selected: File[] = Array.from(e.target.files || []);
    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));

    // Default cover to first saved image if none set, else first new file
    if (!mainKey) {
      setMainKey(savedImages.length > 0 ? `saved-${savedImages[0].id}` : "new-0");
    }
  }

  function removeSaved(id: string) {
    setSavedImages((prev) => prev.filter((img) => img.id !== id));
    if (mainKey === `saved-${id}`) setMainKey(null);
  }

  function removeNew(index: number) {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    const updatedPreviews = newPreviews.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    setNewPreviews(updatedPreviews);
    if (mainKey === `new-${index}`) setMainKey(null);
  }

  async function handleUpload() {
    if (!tourId) return;
    if (savedImages.length === 0 && newFiles.length === 0) {
      alert("Add at least one image");
      return;
    }

    setUploading(true);

    // 1. Update is_main on all existing saved images
    await Promise.all(
      savedImages.map((img) =>
        supabase
          .from("tour_images")
          .update({ is_main: mainKey === `saved-${img.id}` })
          .eq("id", img.id)
      )
    );

    // 2. Delete saved images that were removed by the user
    // (we fetch fresh IDs from DB and delete ones not in savedImages)
    const { data: currentDbImages } = await supabase
      .from("tour_images")
      .select("id")
      .eq("tour_id", tourId);

    const keptIds = savedImages.map((img) => img.id);
    const toDelete = (currentDbImages || [])
      .map((r: any) => r.id)
      .filter((id: string) => !keptIds.includes(id));

    if (toDelete.length > 0) {
      await supabase.from("tour_images").delete().in("id", toDelete);
    }

    // 3. Upload new files
    const uploadedRows: any[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileName = `${tourId}/${Date.now()}-${file.name}`;

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
        is_main: mainKey === `new-${i}`,
      });
    }

    if (uploadedRows.length > 0) {
      const { error: dbError } = await supabase
        .from("tour_images")
        .insert(uploadedRows);

      if (dbError) {
        console.error(dbError);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    next();
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading images...
      </div>
    );
  }

  const totalCount = savedImages.length + newFiles.length;

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-400/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-2">Create Tour</h1>
        <p className="text-gray-500 mb-6">Step 5: Upload Images</p>

        {/* File picker */}
        <div className="mb-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-gray-500 mt-2">
            Click an image to set it as the cover photo. ✕ to remove.
          </p>
        </div>

        {totalCount === 0 && (
          <p className="text-sm text-gray-500 mb-6">No images added yet.</p>
        )}

        {/* Saved images */}
        {savedImages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              Saved images
            </p>
            <div className="grid grid-cols-2 gap-4">
              {savedImages.map((img) => {
                const key = `saved-${img.id}`;
                const isMain = mainKey === key;
                return (
                  <div
                    key={img.id}
                    onClick={() => setMainKey(key)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      isMain ? "border-amber-500" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      className="w-full h-40 object-cover"
                      alt=""
                    />
                    {isMain && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded font-medium">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeSaved(img.id); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center transition"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New (not yet uploaded) images */}
        {newPreviews.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
              New images
            </p>
            <div className="grid grid-cols-2 gap-4">
              {newPreviews.map((src, index) => {
                const key = `new-${index}`;
                const isMain = mainKey === key;
                return (
                  <div
                    key={index}
                    onClick={() => setMainKey(key)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      isMain ? "border-amber-500" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img src={src} className="w-full h-40 object-cover" alt="" />
                    {isMain && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-1 rounded font-medium">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeNew(index); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center transition"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={back}
            className="py-3 px-6 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm text-gray-400 cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {uploading ? "Uploading..." : `Save & Continue →`}
          </button>
        </div>

      </div>
    </div>
  );
}