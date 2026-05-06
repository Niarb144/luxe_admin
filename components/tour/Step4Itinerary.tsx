"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step4Itinerary({ tourId, next }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    day_number: 1,
    title: "",
    description: "",
    start_time: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(false);

  function addItem() {
    if (!form.title.trim() || !form.description.trim()) return;

    const dayItems = items.filter(
      (i) => i.day_number === form.day_number
    );

    setItems([
      ...items,
      {
        ...form,
        sort_order: dayItems.length + 1,
      },
    ]);

    setForm({
      ...form,
      title: "",
      description: "",
      start_time: "",
      end_time: "",
    });
  }

  function removeItem(index: number) {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  }

  async function save() {
    if (!tourId) return;

    if (items.length === 0) {
      alert("Add at least one itinerary item");
      return;
    }

    setLoading(true);

    const rows = items.map((item) => ({
      tour_id: tourId,
      title: item.title,
      description: item.description,
      start_time: item.start_time,
      end_time: item.end_time,
      sort_order: item.sort_order,
      day_number: item.day_number,
    }));

    const { error } = await supabase
      .from("tour_itinerary")
      .insert(rows);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setLoading(false);
    next(items);
  }

  // group by day
  const grouped = items.reduce((acc: any, item) => {
    if (!acc[item.day_number]) acc[item.day_number] = [];
    acc[item.day_number].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-400 mb-6">Step 4: Itinerary</p>

        {/* Form */}
        <div className="space-y-4 mb-6">

          {/* Day Selector */}
          <div>
            <label className="text-sm text-gray-300">Day</label>
            <input
              type="number"
              min="1"
              value={form.day_number}
              onChange={(e) =>
                setForm({ ...form, day_number: Number(e.target.value) })
              }
              className="w-24 p-2 rounded bg-black/40 border border-white/10"
            />
          </div>

          <input
            placeholder="Title (e.g. Morning Game Drive)"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={form.start_time}
              onChange={(e) =>
                setForm({ ...form, start_time: e.target.value })
              }
              className="p-3 rounded-lg bg-black/40 border border-white/10"
            />

            <input
              type="time"
              value={form.end_time}
              onChange={(e) =>
                setForm({ ...form, end_time: e.target.value })
              }
              className="p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <button
            type="button"
            onClick={addItem}
            className="px-6 py-2 rounded-lg bg-amber-500 text-black font-semibold cursor-pointer"
          >
            Add Activity
          </button>
        </div>

        {/* Display grouped itinerary */}
        <div className="space-y-6 mb-6 max-h-64 overflow-y-auto">
          {Object.keys(grouped).length === 0 && (
            <p className="text-gray-500 text-sm">
              No itinerary added yet
            </p>
          )}

          {Object.entries(grouped).map(([day, activities]: any) => (
            <div key={day}>
              <h2 className="font-bold mb-2">Day {day}</h2>

              <div className="space-y-2">
                {activities.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="bg-black/40 border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.title}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 text-sm cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="text-sm text-gray-300">
                      {item.description}
                    </p>

                    <p className="text-xs text-gray-500">
                      {item.start_time} - {item.end_time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <button
          onClick={save}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold cursor-pointer"
        >
          {loading ? "Saving..." : "Next Step"}
        </button>

      </div>
    </div>
  );
}