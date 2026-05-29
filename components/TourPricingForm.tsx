"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FaCrown } from "react-icons/fa";
import { IoStarSharp, IoStarOutline } from "react-icons/io5";
import { MdHotelClass } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────
type Season = "LOW" | "MID" | "HIGH";
type Classification = "economy" | "comfort" | "luxury" | "superior_luxury";

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

interface ClassificationMeta {
  key: Classification;
  label: string;
  icon: any;
  description: string;
  color: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  inactiveBg: string;
  inactiveBorder: string;
  inactiveText: string;
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

// ─── Classification metadata ──────────────────────────────────────────────────
const CLASSIFICATIONS: ClassificationMeta[] = [
  {
    key: "economy",
    label: "Economy",
    icon: <IoStarOutline />,
    description: "Budget-friendly camps & lodges",
    color: "#6b7280",
    activeBg: "bg-[#f3f4f6]",
    activeText: "text-[#374151]",
    activeBorder: "border-[#6b7280]",
    inactiveBg: "bg-white",
    inactiveBorder: "border-[#e5e7eb]",
    inactiveText: "text-[#9ca3af]",
  },
  {
    key: "comfort",
    label: "Comfort",
    icon: <IoStarSharp />,
    description: "Mid-range tented camps",
    color: "#b8830a",
    activeBg: "bg-[#fffbeb]",
    activeText: "text-[#92400e]",
    activeBorder: "border-[#b8830a]",
    inactiveBg: "bg-white",
    inactiveBorder: "border-[#e5e7eb]",
    inactiveText: "text-[#9ca3af]",
  },
  {
    key: "luxury",
    label: "Luxury",
    icon: <MdHotelClass />,
    description: "Premium safari lodges",
    color: "#7c3aed",
    activeBg: "bg-[#f5f3ff]",
    activeText: "text-[#5b21b6]",
    activeBorder: "border-[#7c3aed]",
    inactiveBg: "bg-white",
    inactiveBorder: "border-[#e5e7eb]",
    inactiveText: "text-[#9ca3af]",
  },
  {
    key: "superior_luxury",
    label: "Superior Luxury",
    icon: <FaCrown />,
    description: "Ultra-premium exclusive camps",
    color: "#b45309",
    activeBg: "bg-[#fef3c7]",
    activeText: "text-[#78350f]",
    activeBorder: "border-[#b45309]",
    inactiveBg: "bg-white",
    inactiveBorder: "border-[#e5e7eb]",
    inactiveText: "text-[#9ca3af]",
  },
];

const PERSONS = [2, 4, 6];

// ─── Helper ───────────────────────────────────────────────────────────────────
const emptyPricing = (): Record<string, string> => {
  const init: Record<string, string> = {};
  SEASONS.forEach((s) => PERSONS.forEach((p) => (init[`${s.key}_${p}`] = "")));
  return init;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TourPricingForm() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [tourId, setTourId] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [classification, setClassification] = useState<Classification>("economy");
  const [pricing, setPricing] = useState<Record<string, string>>(emptyPricing);
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

  // When tour or classification changes, pre-fill existing prices
  useEffect(() => {
    if (!tourId) return;
    (async () => {
      const { data } = await supabase
        .from("tour_pricing")
        .select("season, persons, price")
        .eq("tour_id", tourId)
        .eq("classification", classification);

      const loaded = emptyPricing();
      if (data) {
        data.forEach((row: { season: string; persons: number; price: number }) => {
          loaded[`${row.season}_${row.persons}`] = String(row.price);
        });
      }
      setPricing(loaded);
    })();
  }, [tourId, classification]);

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
          setToast({
            type: "error",
            msg: `Enter a valid price for ${s.label} – ${p} persons.`,
          });
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
        classification,
      }));

      const { error } = await supabase
        .from("tour_pricing")
        .upsert(upsertData, { onConflict: "tour_id,season,persons,classification" });

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
    setPricing(emptyPricing());
  };

  const activeClass = CLASSIFICATIONS.find((c) => c.key === classification)!;

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)" }}
    >
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

          {/* ── Tour + Currency ─────────────────────────────────────── */}
          <div className="px-8 pt-8 pb-6 border-b border-[#f0e0c0] bg-[#fffdf7]">
            <div className="flex flex-col sm:flex-row gap-4">
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

          {/* ── Classification Picker ───────────────────────────────── */}
          <div className="px-8 py-6 border-b border-[#f0e0c0] bg-white">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#7a5c2e] mb-3">
              Price Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CLASSIFICATIONS.map((c) => {
                const isActive = classification === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setClassification(c.key)}
                    className={`
                      relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2
                      transition-all duration-150 text-center
                      ${isActive
                        ? `${c.activeBg} ${c.activeBorder} ${c.activeText} shadow-md scale-[1.02]`
                        : `${c.inactiveBg} ${c.inactiveBorder} ${c.inactiveText} hover:border-[#e8d5b0] hover:shadow-sm`
                      }
                    `}
                  >
                    {isActive && (
                      <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full"
                        style={{ background: c.color }}
                      />
                    )}
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-xs font-bold leading-tight">{c.label}</span>
                    <span className={`text-[10px] leading-tight ${isActive ? "opacity-70" : "opacity-50"}`}>
                      {c.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active classification banner */}
            <div
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold"
              style={{
                background: `${activeClass.color}15`,
                border: `1px solid ${activeClass.color}40`,
                color: activeClass.color,
              }}
            >
              <span>{activeClass.icon}</span>
              <span>
                Editing prices for{" "}
                <span className="font-bold">{activeClass.label}</span> classification
                {tourId ? " — existing prices pre-filled if available." : "."}
              </span>
            </div>
          </div>

          {/* ── Season Pricing ──────────────────────────────────────── */}
          <div className="p-8 space-y-6">
            {SEASONS.map((season) => (
              <div
                key={season.key}
                className={`rounded-xl overflow-hidden border-2 ${season.border}`}
              >
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

          {/* ── Actions ─────────────────────────────────────────────── */}
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
                <>{activeClass.icon} Save {activeClass.label} Pricing</>
              )}
            </button>
          </div>
        </div>

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
          <button
            onClick={() => setToast(null)}
            className="ml-auto opacity-70 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}