"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SUGGESTIONS = [
  "Gratuities (Tips)",
  "Flight to/from Nairobi",
  "Meals and Snacks not mentioned",
  "Park Fees",
  "Transport",
  "Guide",
  "Airport Transfers",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function Step3Exclusions({ tourId, next, back }: any) {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  function addItem(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setItems((prev) => {
      const isDuplicate = prev.some(
        (existing) => normalize(existing) === normalize(clean)
      );
      if (isDuplicate) return prev;
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
      e.stopPropagation();
      addItem(input);
    }
  }

  // Reset when tourId changes
  useEffect(() => {
    setFetched(false);
    setItems([]);
  }, [tourId]);

  // Fetch once per tourId
  useEffect(() => {
    if (!tourId || fetched) return;
    supabase
      .from("tour_exclusions")
      .select("item")
      .eq("tour_id", tourId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Deduplicate on load using normalization
          const seen = new Set<string>();
          const deduped: string[] = [];
          for (const item of data.map((r: any) => r.item)) {
            const key = normalize(item);
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(item);
            }
          }
          setItems(deduped);
        }
        setFetched(true);
      });
  }, [tourId, fetched]);

  async function save() {
    if (!tourId) return;

    if (items.length === 0) {
      alert("Add at least one exclusion");
      return;
    }

    setLoading(true);

    const { error: deleteError } = await supabase
      .from("tour_exclusions")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      alert("Failed to update exclusions. Please try again.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("tour_exclusions")
      .insert(items.map((item) => ({ tour_id: tourId, item })));

    if (insertError) {
      console.error("Insert failed:", insertError);
      alert("Failed to save exclusions. Please try again.");
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
        <p className="text-gray-500 mb-6">Step 3: Exclusions</p>

        {/* Tag Input */}
        <div className="mb-4">
          <div
            className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/40 border border-white/10"
            onClick={() => document.getElementById("exclusions-input")?.focus()}
          >
            {items.map((item) => (
              <span
                key={`tag-${item}`}
                className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item);
                  }}
                  className="text-black font-bold leading-none"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              id="exclusions-input"
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
          {SUGGESTIONS.map((s) => (
            <button
              key={`suggestion-${s}`}
              type="button"
              onClick={() => addItem(s)}
              className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-sm"
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
            className="py-3 px-6 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm text-gray-400 cursor-pointer"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer"
          >
            {loading ? "Saving..." : "Next Step"}
          </button>
        </div>

      </div>
    </div>
  );
}