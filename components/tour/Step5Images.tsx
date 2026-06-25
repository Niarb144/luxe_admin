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
  const [fetched, setFetched] = useState(false);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);

  // mainKey is either `saved-{id}` or `new-{uuid}` (stable per file, not index)
  const [mainKey, setMainKey] = useState<string | null>(null);

  // Stable IDs for new files so mainKey doesn't break when files are removed
  const [newFileIds, setNewFileIds] = useState<string[]>([]);

  // Reset when tourId changes
  useEffect(() => {
    setFetched(false);
    setSavedImages([]);
    setMainKey(null);
    setNewFiles([]);
    setNewPreviews([]);
    setNewFileIds([]);
    setFetching(true);
  }, [tourId]);

  // Fetch once per tourId
  useEffect(() => {
    if (!tourId || fetched) {
      setFetching(false);
      return;
    }

    supabase
      .from("tour_images")
      .select("id, image_url, is_main")
      .eq("tour_id", tourId)
      .order("is_main", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setSavedImages(data);
          const main = data.find((img: SavedImage) => img.is_main);
          if (main) setMainKey(`saved-${main.id}`);
        }
        setFetched(true);
        setFetching(false);
      });
  }, [tourId, fetched]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected: File[] = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    // Generate a stable UUID per file so mainKey never breaks on removal
    const ids = selected.map(() => crypto.randomUUID());

    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));
    setNewFileIds(ids);

    // Auto-select cover only if none is set yet
    if (!mainKey) {
      setMainKey(
        savedImages.length > 0 ? `saved-${savedImages[0].id}` : `new-${ids[0]}`
      );
    }
  }

  function removeSaved(id: string) {
    setSavedImages((prev) => prev.filter((img) => img.id !== id));
    if (mainKey === `saved-${id}`) setMainKey(null);
  }

  function removeNew(index: number) {
    const removedId = newFileIds[index];
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewFileIds((prev) => prev.filter((_, i) => i !== index));
    // mainKey used the stable UUID so it stays correct for remaining files
    if (mainKey === `new-${removedId}`) setMainKey(null);
  }

  async function handleUpload() {
    if (!tourId) return;
    if (savedImages.length === 0 && newFiles.length === 0) {
      alert("Add at least one image");
      return;
    }

    setUploading(true);

    // 1. Fetch current DB image IDs to diff against what the user kept
    const { data: currentDbImages } = await supabase
      .from("tour_images")
      .select("id")
      .eq("tour_id", tourId);

    // 2. Delete images the user removed
    const keptIds = savedImages.map((img) => img.id);
    const toDelete = (currentDbImages || [])
      .map((r: any) => r.id)
      .filter((id: string) => !keptIds.includes(id));

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("tour_images")
        .delete()
        .in("id", toDelete);

      if (deleteError) {
        console.error("Delete failed:", deleteError);
        alert("Failed to remove old images. Please try again.");
        setUploading(false);
        return;
      }
    }

    // 3. Update is_main on all kept saved images — run sequentially to catch errors
    for (const img of savedImages) {
      const shouldBeMain = mainKey === `saved-${img.id}`;
      // Only update if value actually changed to avoid unnecessary writes
      if (img.is_main !== shouldBeMain) {
        const { error } = await supabase
          .from("tour_images")
          .update({ is_main: shouldBeMain })
          .eq("id", img.id);

        if (error) {
          console.error("is_main update failed:", error);
          alert("Failed to update cover image. Please try again.");
          setUploading(false);
          return;
        }
      }
    }

    // 4. Upload new files and insert rows
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const fileId = newFileIds[i];
      const fileName = `${tourId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("tour-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload failed:", uploadError);
        alert(`Failed to upload ${file.name}. Please try again.`);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("tour-images")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("tour_images").insert({
        tour_id: tourId,
        image_url: data.publicUrl,
        is_main: mainKey === `new-${fileId}`,
      });

      if (dbError) {
        console.error("DB insert failed:", dbError);
        alert("Failed to save image record. Please try again.");
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
                      isMain
                        ? "border-amber-500"
                        : "border-white/10 hover:border-white/30"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSaved(img.id);
                      }}
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
                const fileId = newFileIds[index];
                const key = `new-${fileId}`;
                const isMain = mainKey === key;
                return (
                  <div
                    key={fileId}
                    onClick={() => setMainKey(key)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      isMain
                        ? "border-amber-500"
                        : "border-white/10 hover:border-white/30"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNew(index);
                      }}
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
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Save & Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}