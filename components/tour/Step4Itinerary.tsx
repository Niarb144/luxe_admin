"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Step4Itinerary({ tourId, next, back }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    day_number: 1,
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetched, setFetched] = useState(false);

  // Reset when tourId changes
  useEffect(() => {
    setFetched(false);
    setItems([]);
    setFetching(true);
  }, [tourId]);

  // Fetch once per tourId
  useEffect(() => {
    if (!tourId || fetched) {
      setFetching(false);
      return;
    }

    supabase
      .from("tour_itinerary")
      .select("*")
      .eq("tour_id", tourId)
      .order("day_number", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data);
        setFetched(true);
        setFetching(false);
      });
  }, [tourId, fetched]);

  function addItem() {
    if (!form.title.trim() || !form.description.trim()) return;

    const dayItems = items.filter((i) => i.day_number === form.day_number);

    setItems((prev) => [
      ...prev,
      {
        ...form,
        // No `id` — marks it as a new unsaved item
        sort_order: dayItems.length + 1,
      },
    ]);

    setForm({ ...form, title: "", description: "", start_time: "", end_time: "" });
  }

  // Remove by stable identity: db items have an `id`, new items matched by flat index
  function removeItem(item: any, index: number) {
    if (item.id) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function save() {
    if (!tourId) return;
    if (items.length === 0) {
      alert("Add at least one itinerary item");
      return;
    }

    setLoading(true);

    const { error: deleteError } = await supabase
      .from("tour_itinerary")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      alert("Failed to update itinerary. Please try again.");
      setLoading(false);
      return;
    }

    const rows = items.map((item) => ({
      tour_id: tourId,
      title: item.title,
      description: item.description,
      start_time: item.start_time || null,
      end_time: item.end_time || null,
      sort_order: item.sort_order,
      day_number: item.day_number,
    }));

    const { error: insertError } = await supabase
      .from("tour_itinerary")
      .insert(rows);

    if (insertError) {
      console.error("Insert failed:", insertError);
      alert("Failed to save itinerary. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    next(items);
  }

  const grouped: Record<number, any[]> = items.reduce((acc: any, item, index) => {
    const day = item.day_number;
    if (!acc[day]) acc[day] = [];
    // Carry the flat index so removeItem can reference it for new items
    acc[day].push({ ...item, _flatIndex: index });
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading itinerary...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-400/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-500 mb-6">Step 4: Itinerary</p>

        {/* Add activity form */}
        <div className="space-y-4 mb-8 p-4 rounded-xl bg-black/20 border border-white/5">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Add Activity</p>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500 shrink-0">Day</label>
            <input
              type="number"
              min="1"
              value={form.day_number}
              onChange={(e) => setForm({ ...form, day_number: Number(e.target.value) })}
              className="w-24 p-2 rounded bg-black/40 border border-white/10"
            />
          </div>

          <input
            placeholder="Title (e.g. Morning Game Drive)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start time (optional)</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End time (optional)</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="px-6 py-2 rounded-lg bg-amber-500 text-black font-semibold cursor-pointer hover:bg-amber-600 transition"
          >
            + Add Activity
          </button>
        </div>

        {/* Grouped itinerary display */}
        <div className="space-y-6 mb-6 max-h-96 overflow-y-auto pr-1">
          {sortedDays.length === 0 ? (
            <p className="text-gray-500 text-sm">No itinerary added yet</p>
          ) : (
            sortedDays.map((day) => (
              <div key={`day-${day}`}>
                <h2 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-sm">
                    Day {day}
                  </span>
                  <span className="text-xs text-gray-500 font-normal">
                    {grouped[day].length}{" "}
                    {grouped[day].length === 1 ? "activity" : "activities"}
                  </span>
                </h2>

                <div className="space-y-2 pl-2 border-l border-amber-500/20">
                  {grouped[day].map((item: any) => (
                    <div
                      key={item.id ? `db-${item.id}` : `new-${item._flatIndex}`}
                      className="bg-black/40 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-100">{item.title}</p>
                          <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                          {(item.start_time || item.end_time) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.start_time && `${item.start_time}`}
                              {item.start_time && item.end_time && " – "}
                              {item.end_time && `${item.end_time}`}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item, item._flatIndex)}
                          className="text-red-400 hover:text-red-300 text-xs shrink-0 cursor-pointer mt-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
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
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>

      </div>
    </div>
  );
}