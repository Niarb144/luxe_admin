"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SUGGESTIONS = [
  "Game Drives",
  "Accommodation",
  "Meals",
  "Park Fees",
  "Transport",
  "Guide",
  "Airport Transfers",
];

export default function Step2Inclusions({ tourId, next, back }: any) {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false); // ← guard against double-load

  function addItem(value: string) {
    const clean = value.trim();
    if (!clean) return;
    // check against current state, not a stale closure
    setItems((prev) => {
      if (prev.includes(clean)) return prev; // already present, no change
      return [...prev, clean];
    });
    setInput("");
  }

  function removeItem(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation(); // prevent any parent form submission
      addItem(input);
    }
  }

  // Load existing inclusions once — guarded by `fetched` flag to prevent
  // re-loading on re-renders which would cause duplicates
  useEffect(() => {
    setFetched(false);
    setItems([]);
  }, [tourId]);

  useEffect(() => {
    if (!tourId || fetched) return;

    supabase
      .from("tour_inclusions")
      .select("item")
      .eq("tour_id", tourId)
      .then(({ data }) => {
        setItems(Array.from(new Set(data?.map((r: any) => r.item) ?? [])));
        setFetched(true);
      });
  }, [tourId, fetched]);

  async function save() {
    if (!tourId) return;

    if (items.length === 0) {
      alert("Add at least one inclusion");
      return;
    }

    setLoading(true);

    // Delete existing rows first (delete-then-insert pattern)
    const { error: deleteError } = await supabase
      .from("tour_inclusions")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("tour_inclusions")
      .insert(items.map((item) => ({ tour_id: tourId, item })));

    if (insertError) {
      console.error("Insert error:", insertError);
      setLoading(false);
      return;
    }

    setLoading(false);
    next(items);
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-500 mb-6">Step 2: Inclusions</p>

        {/* Tag Input */}
        <div className="mb-4">
          <div
            className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/40 border border-white/10"
            onClick={() => {
              // clicking the container focuses the input
              const el = document.getElementById("inclusions-input");
              el?.focus();
            }}
          >
            {/* Tag chips — prefix with "tag-" */}
            {items.map((item) => (
              <span
                key={`tag-${item}`}  // ← was just `key={item}`
                className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item);
                  }}
                  className="text-black font-bold leading-none cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              id="inclusions-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter..."
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Suggestion buttons — prefix with "suggestion-" */}
          {SUGGESTIONS.map((s) => (
            <button
              key={`suggestion-${s}`}  // ← was just `key={s}`
              type="button"
              onClick={() => addItem(s)}
              className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-sm cursor-pointer"
            >
              + {s}
            </button>
          ))}
        </div>

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
            type="button" // ← explicit type
            onClick={save}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer"
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}