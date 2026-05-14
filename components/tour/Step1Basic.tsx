"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import slugify from "slugify";

export default function Step1Basic({ next }: any) {
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);

  useEffect(() => {
    async function loadDestinations() {
      const { data, error } = await supabase
        .from("destinations")
        .select("id,name,country")
        .order("name");

      if (error) {
        console.error(error);
        return;
      }

      setDestinations(data || []);
    }

    loadDestinations();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    const title = form.get("title") as string;

    const slug = slugify(title, {
      lower: true,
      strict: true,
    });

    const payload = {
      title,
      slug,
      description: form.get("description"),
      duration: form.get("duration"),
      location: form.get("location"),
      price: Number(form.get("price")),
      main_image: form.get("main_image") || undefined,
    };

    // get selected destinations
    const selectedDestinations =
      form.getAll("destinations");

    // check slug exists
    const { data: existingTour } = await supabase
      .from("tours")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingTour) {
      alert("A tour with this title already exists.");
      setLoading(false);
      return;
    }

    // create tour
    const { data: tour, error } = await supabase
      .from("tours")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // insert destination relations
    if (selectedDestinations.length > 0) {
      const relations = selectedDestinations.map(
        (destinationId) => ({
          tour_id: tour.id,
          destination_id: destinationId,
        })
      );

      const { error: relationError } =
        await supabase
          .from("tour_destinations")
          .insert(relations);

      if (relationError) {
        console.error(relationError);
      }
    }

    console.log("NEW TOUR:", tour);

    setLoading(false);

    next(form, tour.id);
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">
          Create Tour
        </h1>

        <p className="text-gray-600 mb-8">
          Step 1: Basic Information
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Title
            </label>

            <input
              name="title"
              required
              placeholder="e.g. Maasai Mara Safari"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Description
            </label>

            <textarea
              name="description"
              rows={4}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Duration + Location */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block mb-2 text-sm text-gray-500">
                Duration
              </label>

              <input
                name="duration"
                placeholder="3 Days"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-500">
                Location
              </label>

              <input
                name="location"
                placeholder="Kenya"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>

          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Price (USD)
            </label>

            <input
              type="number"
              name="price"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Destinations */}
          <div>
            <label className="block mb-4 text-sm text-gray-500">
              Destinations
            </label>

            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-2 rounded-xl bg-black/20">

              {destinations.map((destination) => (
                <label
                  key={destination.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/30 hover:bg-black/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    name="destinations"
                    value={destination.id}
                    className="accent-amber-500"
                  />

                  <div>
                    <p className="font-medium">
                      {destination.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      {destination.country}
                    </p>
                  </div>
                </label>
              ))}

            </div>
          </div>

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