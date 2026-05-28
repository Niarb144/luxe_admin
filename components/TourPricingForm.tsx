"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";


// ─── Types ────────────────────────────────────────────────────────────────────
type Season = "LOW" | "MID" | "HIGH";

interface Tour {
  id: string;
  title: string;
}

interface SeasonMeta {
  key: Season;
  label: string;
  subtitle: string;
  bg: string;
  border: string;
  badge: string;
  text: string;
  accent: string;
}

interface PricingRow {
  season: Season;
  persons: number;
  price: string;
}

// ─── Season metadata ──────────────────────────────────────────────────────────
const SEASONS: SeasonMeta[] = [
  {
    key: "LOW",
    label: "LOW SEASON",
    subtitle: "March, April, May & Nov 1 – Dec 19",
    bg: "bg-[#3d2008]",
    border: "border-[#5c3010]",
    badge: "bg-[#5c3010] text-[#f5e6c8]",
    text: "text-[#f5e6c8]",
    accent: "text-[#f5c97a]",
  },
  {
    key: "MID",
    label: "MID SEASON",
    subtitle: "Rest of the year",
    bg: "bg-[#b8830a]",
    border: "border-[#d49a10]",
    badge: "bg-[#d49a10] text-[#fff8e8]",
    text: "text-[#fff8e8]",
    accent: "text-white",
  },
  {
    key: "HIGH",
    label: "HIGH SEASON",
    subtitle: "January, July, Aug, Sep & Dec 20–31",
    bg: "bg-[#1c0d00]",
    border: "border-[#3d2008]",
    badge: "bg-[#3d2008] text-[#f5e6c8]",
    text: "text-[#f5e6c8]",
    accent: "text-[#f5c97a]",
  },
];

const PERSONS = [2, 4, 6];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TourPricingForm() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourId, setTourId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [pricing, setPricing] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SEASONS.forEach((s) => PERSONS.forEach((p) => (init[`${s.key}_${p}`] = "")));
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [fetchingTours, setFetchingTours] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Fetch tours on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tours")
        .select("id, title")
        .order("title");
      if (!error && data) setTours(data as Tour[]);
      setFetchingTours(false);
    })();
  }, []);

  console.log("Tours fetched:", tours);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handlePriceChange = (season: Season, persons: number, val: string) => {
    setPricing((prev) => ({ ...prev, [`${season}_${persons}`]: val }));
  };

  const handleSubmit = async () => {
    if (!tourId) {
      setToast({ type: "error", msg: "Please select a tour before saving." });
      return;
    }

    const rows: PricingRow[] = [];
    for (const s of SEASONS) {
      for (const p of PERSONS) {
        const val = pricing[`${s.key}_${p}`];
        if (val === "" || isNaN(Number(val))) {
          setToast({ type: "error", msg: `Enter a valid price for ${s.label} – ${p} persons.` });
          return;
        }
        rows.push({ season: s.key, persons: p, price: val });
      }
    }

    setLoading(true);
    try {
      const upsertData = rows.map((r) => ({
        tour_id: tourId,
        season: r.season,
        persons: r.persons,
        price: parseFloat(r.price),
        currency,
      }));

      const { error } = await supabase
        .from("tour_pricing")
        .upsert(upsertData, { onConflict: "tour_id,season,persons" });

      if (error) throw error;
      setToast({ type: "success", msg: "Pricing saved successfully!" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setToast({ type: "error", msg: message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTourId("");
    const reset: Record<string, string> = {};
    SEASONS.forEach((s) => PERSONS.forEach((p) => (reset[`${s.key}_${p}`] = "")));
    setPricing(reset);
  };

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { font-family: 'Lato', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#b8830a] font-bold mb-2">
            Safari Management
          </p>
          <h1 className="font-display text-4xl text-[#1c0d00] leading-tight">
            Tour Pricing Setup
          </h1>
          <div className="w-16 h-px bg-[#b8830a] mx-auto mt-4" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e8d5b0]">
          {/* Tour + Currency row */}
          <div className="px-8 pt-8 pb-6 border-b border-[#f0e0c0] bg-[#fffdf7]">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Tour select */}
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5c2e] mb-2">
                  Select Tour
                </label>
                <select
                  value={tourId}
                  onChange={(e) => setTourId(e.target.value)}
                  className="w-full border-2 border-[#e8d5b0] rounded-lg px-4 py-3 text-[#1c0d00] bg-white focus:outline-none focus:border-[#b8830a] transition-colors text-sm"
                  disabled={fetchingTours}
                >
                  <option value="">
                    {fetchingTours ? "Loading tours…" : "— Choose a tour —"}
                  </option>
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="sm:w-36">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5c2e] mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border-2 border-[#e8d5b0] rounded-lg px-4 py-3 text-[#1c0d00] bg-white focus:outline-none focus:border-[#b8830a] transition-colors text-sm"
                >
                  {["USD", "EUR", "GBP", "KES"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing sections */}
          <div className="p-8 space-y-6">
            {SEASONS.map((season) => (
              <div
                key={season.key}
                className={`rounded-xl overflow-hidden border-2 ${season.border}`}
              >
                {/* Season header */}
                <div className={`${season.bg} px-5 py-4`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`font-display text-lg font-bold ${season.text}`}>
                      {season.label}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${season.badge} font-semibold`}>
                      {season.subtitle}
                    </span>
                  </div>
                </div>

                {/* Persons grid */}
                <div className="grid grid-cols-3 divide-x divide-[#e8d5b0] bg-[#fffdf7]">
                  {PERSONS.map((p) => (
                    <div key={p} className="p-4 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#7a5c2e] text-center block">
                        {p} Persons
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8830a] font-bold text-sm select-none">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={pricing[`${season.key}_${p}`]}
                          onChange={(e) => handlePriceChange(season.key, p, e.target.value)}
                          className="w-full border-2 border-[#e8d5b0] rounded-lg pl-7 pr-3 py-2.5 text-right text-[#1c0d00] font-bold text-sm bg-white focus:outline-none focus:border-[#b8830a] transition-colors"
                        />
                      </div>
                      <p className="text-center text-[10px] text-[#a08050] tracking-wider font-semibold">
                        {currency} / person
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-lg border-2 border-[#e8d5b0] text-[#7a5c2e] text-sm font-bold uppercase tracking-widest hover:bg-[#f5e6c8] transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 rounded-lg bg-[#b8830a] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#9a6d08] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Pricing"
              )}
            </button>
          </div>
        </div>

        {/* Helper note */}
        <p className="text-center text-xs text-[#a08050] mt-5">
          * Prices are per person per night. Existing entries will be updated (upsert).
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-semibold max-w-sm transition-all
            ${toast.type === "success" ? "bg-[#1c5e2e] text-white" : "bg-[#8b1a1a] text-white"}`}
        >
          <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100 text-lg leading-none">
            ×
          </button>
        </div>
      )}
    </div>
  );
}