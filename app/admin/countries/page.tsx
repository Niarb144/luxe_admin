"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CountriesPage() {
  const [name, setName] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCountries() {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("name");

    if (!error) setCountries(data || []);
    console.log("COUNTRIES:", data, "ERROR:", error);
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("countries")
      .insert([{ name: name.trim() }]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setName("");
    await fetchCountries();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this country?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("countries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setCountries((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Manage Countries
        </h1>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-3 mb-8"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter country name (e.g. Kenya)"
            className="flex-1 p-3 rounded-lg bg-white/10 border border-white/10"
          />

          <button
            disabled={loading}
            className="px-5 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>

        {/* LIST */}
        <div className="space-y-3">
          {countries.map((country) => (
            <div
              key={country.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <span>{country.name}</span>

              <button
                onClick={() => handleDelete(country.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}