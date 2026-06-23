"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { highlightIcons } from "@/lib/highlightIcons";

export default function Step8Highlights({ tourId, next, back }: any) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [highlights, setHighlights] = useState([
    { icon: "PawPrint", title: "", description: "" },
  ]);

  // Load existing highlights on mount
  useEffect(() => {
    if (!tourId) { setFetching(false); return; }

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
        setFetching(false);
      });
  }, [tourId]);

  type HighlightField = "icon" | "title" | "description";

  const addHighlight = () => {
    setHighlights([...highlights, { icon: "PawPrint", title: "", description: "" }]);
  };

  const updateHighlight = (index: number, field: HighlightField, value: string) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setHighlights(updated);
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
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

    // Delete all existing then re-insert current list
    const { error: deleteError } = await supabase
      .from("tour_highlights")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error(deleteError);
      alert("Failed to save highlights");
      setLoading(false);
      return;
    }

    const payload = validHighlights.map((item) => ({
      tour_id: tourId,
      icon: item.icon,
      title: item.title,
      description: item.description,
    }));

    const { error } = await supabase.from("tour_highlights").insert(payload);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save highlights");
      return;
    }

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
          <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">

            {/* Icon Selection */}
            <div className="mb-4">
              <label className="text-sm text-gray-300">Select Icon</label>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {highlightIcons.map((iconItem) => {
                  const Icon = iconItem.icon;
                  return (
                    <button
                      key={iconItem.name}
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
              onClick={() => removeHighlight(index)}
              className="text-red-400 mt-4 text-sm cursor-pointer hover:text-red-300 transition"
            >
              Remove Highlight
            </button>
          </div>
        ))}

        <button
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
            className="py-3 px-6 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm text-gray-400 cursor-pointer"
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