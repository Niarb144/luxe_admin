"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { highlightIcons } from "@/lib/highlightIcons";

type Highlight = {
  id?: string;
  icon: string;
  title: string;
  description: string;
};

type HighlightField = "icon" | "title" | "description";

export default function Step8Highlights({ tourId, next, back }: any) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetched, setFetched] = useState(false);

  const [highlights, setHighlights] = useState<Highlight[]>([
    { icon: "PawPrint", title: "", description: "" },
  ]);

  // Reset when tourId changes
  useEffect(() => {
    setFetched(false);
    setHighlights([{ icon: "PawPrint", title: "", description: "" }]);
    setFetching(true);
  }, [tourId]);

  // Fetch once per tourId
  useEffect(() => {
    if (!tourId || fetched) {
      setFetching(false);
      return;
    }

    supabase
      .from("tour_highlights")
      .select("id, icon, title, description")
      .eq("tour_id", tourId)
      .order("id")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setHighlights(
            data.map((row: any) => ({
              id: row.id,
              icon: row.icon,
              title: row.title,
              description: row.description,
            }))
          );
        }
        setFetched(true);
        setFetching(false);
      });
  }, [tourId, fetched]);

  const addHighlight = () => {
    setHighlights((prev) => [
      ...prev,
      { icon: "PawPrint", title: "", description: "" },
    ]);
  };

  const updateHighlight = (index: number, field: HighlightField, value: string) => {
    setHighlights((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSave() {
    const validHighlights = highlights.filter(
      (item) => item.title.trim() && item.description.trim()
    );

    if (validHighlights.length === 0) {
      alert("Add at least one highlight");
      return;
    }

    setLoading(true);

    const { error: deleteError } = await supabase
      .from("tour_highlights")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      alert("Failed to update highlights. Please try again.");
      setLoading(false);
      return;
    }

    const payload = validHighlights.map((item) => ({
      tour_id: tourId,
      icon: item.icon,
      title: item.title,
      description: item.description,
    }));

    const { error: insertError } = await supabase
      .from("tour_highlights")
      .insert(payload);

    if (insertError) {
      console.error("Insert failed:", insertError);
      alert("Failed to save highlights. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    next();
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading highlights...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 flex justify-center p-6">
      <div className="w-full max-w-4xl bg-gray-400/20 p-8 rounded-xl">

        <h1 className="text-3xl font-bold mb-2">Tour Highlights</h1>
        <p className="text-gray-500 mb-8">Add key experiences guests should expect</p>

        {highlights.map((item, index) => (
          <div
            key={item.id ? `db-${item.id}` : `new-${index}`}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6"
          >
            {/* Icon Selection */}
            <div className="mb-4">
              <label className="text-sm text-gray-300">Select Icon</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {highlightIcons.map((iconItem) => {
                  const Icon = iconItem.icon;
                  return (
                    <button
                      key={`icon-${iconItem.name}`}
                      type="button"
                      onClick={() => updateHighlight(index, "icon", iconItem.name)}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        item.icon === iconItem.name
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-black/40 border-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto" />
                      <p className="text-xs mt-2">{iconItem.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              placeholder="Highlight title"
              value={item.title}
              onChange={(e) => updateHighlight(index, "title", e.target.value)}
              className="w-full mb-4 p-3 rounded-xl bg-black/40 border border-white/10 text-white"
            />

            {/* Description */}
            <textarea
              rows={4}
              placeholder="Highlight description"
              value={item.description}
              onChange={(e) => updateHighlight(index, "description", e.target.value)}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
            />

            <button
              type="button"
              onClick={() => removeHighlight(index)}
              className="text-red-400 mt-4 text-sm cursor-pointer hover:text-red-300 transition"
            >
              Remove Highlight
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addHighlight}
          className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-3 rounded-xl font-semibold cursor-pointer mb-6 block"
        >
          + Add Highlight
        </button>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={back}
            className="py-3 px-6 rounded-lg border border-gray-600/10 hover:bg-gray-600/5 transition text-sm text-gray-600 cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
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