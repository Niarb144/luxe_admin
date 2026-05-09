"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Step1Basic({ next }: any) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    const { data: userData } = await supabase.auth.getUser();
    console.log("USER:", userData.user);

    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      duration: form.get("duration"),
      location: form.get("location"),
      price: Number(form.get("price")),
      main_image: form.get("main_image") || undefined, // fallback to DB default
    };

    const { data, error } = await supabase
      .from("tours")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    console.log("NEW TOUR:", data);

    setLoading(false);
    next(form, data.id);
  }

  return (
    <div className="min-h-screen  text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">
        
        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-400 mb-8">
          Step 1: Basic Information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Maasai Mara Safari"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the experience..."
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Duration + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Duration</label>
              <input
                name="duration"
                placeholder="e.g. 3 Days"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-500">Location</label>
              <input
                name="location"
                placeholder="e.g. Kenya"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Price (USD)</label>
            <input
              name="price"
              type="number"
              placeholder="e.g. 1200"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Button */}
          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer"
          >
            {loading ? "Creating..." : "Next Step"}
          </button>

        </form>
      </div>
    </div>
  );
}