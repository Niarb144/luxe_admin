"use client";

import { useState } from "react";
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

export default function Step2Inclusions({ tourId, next }: any) {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function addItem(value: string) {
    const clean = value.trim();
    if (!clean) return;

    // prevent duplicates
    if (items.includes(clean)) return;

    setItems([...items, clean]);
    setInput("");
  }

  function removeItem(item: string) {
    setItems(items.filter((i) => i !== item));
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(input);
    }
  }

  async function save() {
    if (!tourId) return;

    if (items.length === 0) {
      alert("Add at least one inclusion");
      return;
    }

    setLoading(true);

    const rows = items.map((item) => ({
      tour_id: tourId,
      item,
    }));

    const { error } = await supabase.from("tour_inclusions").insert(rows);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setLoading(false);
    next(items);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-400 mb-6">Step 2: Inclusions</p>

        {/* Tag Input */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-black/40 border border-white/10">
            
            {items.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button
                  onClick={() => removeItem(item)}
                  className="text-black font-bold"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addItem(s)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm"
            >
              + {s}
            </button>
          ))}
        </div>

        {/* Action */}
        <button
          onClick={save}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer"
        >
          {loading ? "Saving..." : "Next Step"}
        </button>

      </div>
    </div>
  );
}