"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import slugify from "slugify";

export default function Step1Basic({ next }: any) {
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [holidayTypes, setHolidayTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: destinationData } = await supabase
        .from("destinations")
        .select("id,name,country")
        .order("name");

      const { data: typeData } = await supabase
        .from("holiday_types")
        .select("*")
        .order("name");

      const { data: countryData } = await supabase
        .from("countries")
        .select("id,name")
        .order("name");

      setCountries(countryData || []);
      setDestinations(destinationData || []);
      setHolidayTypes(typeData || []);
    }

    loadData();
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
      price: Number(form.get("price")),
      tagline: form.get("tagline") || null,
      meta_description: form.get("meta_description") || null,
      main_image: form.get("main_image") || undefined,
      why_choose_safari: form.get("why_choose_safari"),
    };

    const selectedCountries = form.getAll("countries");
    const selectedDestinations = form.getAll("destinations");
    const selectedHolidayTypes = form.getAll("holiday_types");

    // Check slug uniqueness
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

    // Create tour
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

    // Insert country relations
    if (selectedCountries.length > 0) {
      const relations = selectedCountries.map((countryId) => ({
        tour_id: tour.id,
        country_id: countryId,
      }));

      const { error: countryError } = await supabase
        .from("tour_countries")
        .insert(relations);

      if (countryError) console.error("Country relations error:", countryError);
    }

    // Insert destination relations
    if (selectedDestinations.length > 0) {
      const relations = selectedDestinations.map((destinationId) => ({
        tour_id: tour.id,
        destination_id: destinationId,
      }));

      const { error: relationError } = await supabase
        .from("tour_destinations")
        .insert(relations);

      if (relationError) console.error("Destination relations error:", relationError);
    }

    // Insert holiday type relations
    if (selectedHolidayTypes.length > 0) {
      const relations = selectedHolidayTypes.map((typeId) => ({
        tour_id: tour.id,
        holiday_type_id: typeId,
      }));

      const { error: typeError } = await supabase
        .from("tour_holiday_types")
        .insert(relations);

      if (typeError) console.error("Holiday type relations error:", typeError);
    }

    setLoading(false);
    next(form, tour.id);
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">Create Tour</h1>
        <p className="text-gray-600 mb-8">Step 1: Basic Information</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Maasai Mara Safari"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Tagline
              <span className="ml-2 text-gray-600 font-normal">
                — short headline shown on cards &amp; hero
              </span>
            </label>
            <input
              name="tagline"
              placeholder="e.g. Witness the Great Migration up close"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Meta Description
              <span className="ml-2 text-gray-600 font-normal">
                — used for SEO (150–160 chars)
              </span>
            </label>
            <textarea
              name="meta_description"
              rows={2}
              maxLength={160}
              placeholder="e.g. Join our 7-day Maasai Mara safari and witness the Great Migration..."
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          {/* Duration + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Duration</label>
              <input
                name="duration"
                placeholder="e.g. 7 Days"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-500">Price (USD)</label>
              <input
                type="number"
                name="price"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
          </div>

          {/* Countries */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Countries
              <span className="ml-2 text-gray-600 font-normal">— select all that apply</span>
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-2 rounded-xl bg-black/20">
              {countries.map((country) => (
                <label
                  key={country.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/30 hover:bg-black/50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    name="countries"
                    value={country.id}
                    className="accent-amber-500"
                  />
                  <span>{country.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Destinations</label>
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
                    <p className="font-medium">{destination.name}</p>
                    <p className="text-xs text-gray-400">{destination.country}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Holiday Types */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Holiday Types</label>
            <div className="grid grid-cols-2 gap-3">
              {holidayTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/30 cursor-pointer hover:bg-black/50 transition"
                >
                  <input
                    type="checkbox"
                    name="holiday_types"
                    value={type.id}
                    className="accent-amber-500"
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Why Choose Safari */}
          <div>
            <label className="block mb-2 text-sm text-gray-500">Why Choose This Safari</label>
            <textarea
              name="why_choose_safari"
              rows={4}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {loading ? "Creating..." : "Next Step →"}
          </button>

        </form>
      </div>
    </div>
  );
}