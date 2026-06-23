"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import slugify from "slugify";

export default function Step1Basic({ next, tourId: existingTourId }: any) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [holidayTypes, setHolidayTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  // Pre-populated values (used when returning to this step)
  const [defaults, setDefaults] = useState<Record<string, any>>({});
  const [checkedCountries, setCheckedCountries] = useState<string[]>([]);
  const [checkedDestinations, setCheckedDestinations] = useState<string[]>([]);
  const [checkedHolidayTypes, setCheckedHolidayTypes] = useState<string[]>([]);

  // Load dropdown options + existing tour data in parallel
  useEffect(() => {
    async function loadData() {
      setFetching(true);

      const [
        { data: destinationData },
        { data: typeData },
        { data: countryData },
      ] = await Promise.all([
        supabase.from("destinations").select("id,name,country").order("name"),
        supabase.from("holiday_types").select("*").order("name"),
        supabase.from("countries").select("id,name").order("name"),
      ]);

      setDestinations(destinationData || []);
      setHolidayTypes(typeData || []);
      setCountries(countryData || []);

      // If we already have a tourId (user came back), load existing data
      if (existingTourId) {
        const [
          { data: tour },
          { data: tourCountries },
          { data: tourDestinations },
          { data: tourHolidayTypes },
        ] = await Promise.all([
          supabase.from("tours").select("*").eq("id", existingTourId).single(),
          supabase.from("tour_countries").select("country_id").eq("tour_id", existingTourId),
          supabase.from("tour_destinations").select("destination_id").eq("tour_id", existingTourId),
          supabase.from("tour_holiday_types").select("holiday_type_id").eq("tour_id", existingTourId),
        ]);

        if (tour) setDefaults(tour);
        setCheckedCountries((tourCountries || []).map((r: any) => r.country_id));
        setCheckedDestinations((tourDestinations || []).map((r: any) => r.destination_id));
        setCheckedHolidayTypes((tourHolidayTypes || []).map((r: any) => r.holiday_type_id));
      }

      setFetching(false);
    }

    loadData();
  }, [existingTourId]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);
    const title = form.get("title") as string;
    const slug = slugify(title, { lower: true, strict: true });

    const payload = {
      title,
      slug,
      description: form.get("description"),
      duration: form.get("duration"),
      price: Number(form.get("price")),
      tagline: form.get("tagline") || null,
      meta_description: form.get("meta_description") || null,
      why_choose_safari: form.get("why_choose_safari"),
    };

    const selectedCountries = form.getAll("countries") as string[];
    const selectedDestinations = form.getAll("destinations") as string[];
    const selectedHolidayTypes = form.getAll("holiday_types") as string[];

    let tourId = existingTourId;

    if (existingTourId) {
      // ── EDIT MODE: update the existing tour ──
      const { error } = await supabase
        .from("tours")
        .update(payload)
        .eq("id", existingTourId);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Replace all junction table rows (delete + re-insert)
      await Promise.all([
        supabase.from("tour_countries").delete().eq("tour_id", existingTourId),
        supabase.from("tour_destinations").delete().eq("tour_id", existingTourId),
        supabase.from("tour_holiday_types").delete().eq("tour_id", existingTourId),
      ]);
    } else {
      // ── CREATE MODE: check slug uniqueness then insert ──
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

      tourId = tour.id;
    }

    // Re-insert all junction rows
    await Promise.all([
      selectedCountries.length > 0 &&
        supabase.from("tour_countries").insert(
          selectedCountries.map((id) => ({ tour_id: tourId, country_id: id }))
        ),
      selectedDestinations.length > 0 &&
        supabase.from("tour_destinations").insert(
          selectedDestinations.map((id) => ({ tour_id: tourId, destination_id: id }))
        ),
      selectedHolidayTypes.length > 0 &&
        supabase.from("tour_holiday_types").insert(
          selectedHolidayTypes.map((id) => ({ tour_id: tourId, holiday_type_id: id }))
        ),
    ]);

    setLoading(false);
    next(form, tourId);
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10">

        <h1 className="text-3xl font-bold mb-6">
          {existingTourId ? "Edit Tour" : "Create Tour"}
        </h1>
        <p className="text-gray-600 mb-8">Step 1: Basic Information</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block mb-2 text-sm text-gray-500">Title</label>
            <input
              name="title"
              required
              defaultValue={defaults.title}
              placeholder="e.g. Maasai Mara Safari"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Tagline
              <span className="ml-2 text-gray-600 font-normal">— short headline shown on cards &amp; hero</span>
            </label>
            <input
              name="tagline"
              defaultValue={defaults.tagline}
              placeholder="e.g. Witness the Great Migration up close"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={defaults.description}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">
              Meta Description
              <span className="ml-2 text-gray-600 font-normal">— used for SEO (150–160 chars)</span>
            </label>
            <textarea
              name="meta_description"
              rows={2}
              maxLength={160}
              defaultValue={defaults.meta_description}
              placeholder="e.g. Join our 7-day Maasai Mara safari and witness the Great Migration..."
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-500">Duration</label>
              <input
                name="duration"
                defaultValue={defaults.duration}
                placeholder="e.g. 7 Days"
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-500">Price (USD)</label>
              <input
                type="number"
                name="price"
                defaultValue={defaults.price}
                className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              />
            </div>
          </div>

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
                    defaultChecked={checkedCountries.includes(country.id)}
                    className="accent-amber-500"
                  />
                  <span>{country.name}</span>
                </label>
              ))}
            </div>
          </div>

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
                    defaultChecked={checkedDestinations.includes(destination.id)}
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
                    defaultChecked={checkedHolidayTypes.includes(type.id)}
                    className="accent-amber-500"
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-500">Why Choose This Safari</label>
            <textarea
              name="why_choose_safari"
              rows={4}
              defaultValue={defaults.why_choose_safari}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {loading
              ? existingTourId ? "Saving..." : "Creating..."
              : existingTourId ? "Save Changes →" : "Next Step →"}
          </button>

        </form>
      </div>
    </div>
  );
}