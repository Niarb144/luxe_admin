"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { FaCrown } from "react-icons/fa";
import { IoStarSharp, IoStarOutline } from "react-icons/io5";
import { MdHotelClass } from "react-icons/md";

// ─── Types ────────────────────────────────────────────────────────────────────
type Season = "LOW" | "MID" | "HIGH";
type Classification = "economy" | "comfort" | "luxury" | "superior_luxury";

interface PricingRecord {
  id: string;
  tour_id: string;
  season: Season;
  persons: number;
  price: number;
  currency: string;
  classification: Classification;
  created_at: string;
  tours: { title: any } | { title: any }[];
}

interface GroupedTour {
  tour_id: string;
  tour_title: string;
  classifications: Partial<Record<Classification, Partial<Record<Season, Record<number, PricingRecord>>>>>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SEASONS: { key: Season; label: string; short: string; bg: string; text: string; dot: string }[] = [
  { key: "LOW",  label: "Low Season",  short: "LOW",  bg: "bg-[#3d2008]", text: "text-[#f5e6c8]", dot: "#7a4520" },
  { key: "MID",  label: "Mid Season",  short: "MID",  bg: "bg-[#b8830a]", text: "text-white",      dot: "#b8830a" },
  { key: "HIGH", label: "High Season", short: "HIGH", bg: "bg-[#1c0d00]", text: "text-[#f5e6c8]", dot: "#3d2008" },
];

const PERSONS = [2, 4, 6];

const CLASSIFICATIONS: {
  key: Classification; label: string; icon: any;
  color: string; bg: string; text: string; border: string;
}[] = [
  { key: "economy",         label: "Economy",         icon: <IoStarOutline />, color: "#6b7280", bg: "bg-gray-100",    text: "text-gray-700",   border: "border-gray-300" },
  { key: "comfort",         label: "Comfort",         icon: <IoStarSharp />, color: "#b8830a", bg: "bg-amber-50",   text: "text-amber-800",  border: "border-amber-300" },
  { key: "luxury",          label: "Luxury",          icon: <MdHotelClass />, color: "#7c3aed", bg: "bg-violet-50",  text: "text-violet-800", border: "border-violet-300" },
  { key: "superior_luxury", label: "Superior Luxury", icon: <FaCrown />, color: "#b45309", bg: "bg-yellow-50",  text: "text-yellow-800", border: "border-yellow-400" },
];

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({
  tour,
  onClose,
}: {
  tour: GroupedTour;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#e8d5b0]">
        {/* Header */}
        <div className="sticky top-0 bg-white px-7 pt-7 pb-4 border-b border-[#f0e0c0] flex items-start justify-between z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#b8830a] font-bold mb-1">Pricing Details</p>
            <h2 className="font-display text-2xl text-[#1c0d00] leading-tight">{tour.tour_title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5e6c8] text-[#7a5c2e] transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="px-7 py-6 space-y-8">
          {CLASSIFICATIONS.map((cls) => {
            const clsData = tour.classifications[cls.key];
            if (!clsData) return null;
            return (
              <div key={cls.key}>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-4 ${cls.bg} ${cls.text} ${cls.border}`}>
                  <span>{cls.icon}</span>
                  <span>{cls.label}</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#e8d5b0]">
                  {/* Table header */}
                  <div className="grid grid-cols-4 bg-[#fffdf7] border-b border-[#e8d5b0]">
                    <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#7a5c2e]">Season</div>
                    {PERSONS.map((p) => (
                      <div key={p} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#7a5c2e] text-right">
                        {p} Persons
                      </div>
                    ))}
                  </div>
                  {SEASONS.map((s) => {
                    const seasonData = clsData[s.key];
                    if (!seasonData) return null;
                    const currency = Object.values(seasonData)[0]?.currency ?? "USD";
                    return (
                      <div key={s.key} className="grid grid-cols-4 border-b border-[#f0e0c0] last:border-0 hover:bg-[#fffdf7] transition-colors">
                        <div className={`px-4 py-3 flex items-center gap-2`}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                          <span className="text-xs font-semibold text-[#3d2008]">{s.label}</span>
                        </div>
                        {PERSONS.map((p) => {
                          const entry = seasonData[p];
                          return (
                            <div key={p} className="px-4 py-3 text-right">
                              {entry ? (
                                <span className="text-sm font-bold text-[#1c0d00]">
                                  {Number(entry.price).toLocaleString("en-US", {
                                    style: "currency", currency, minimumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-[#d0b890] text-xs">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
  tourTitle,
  classification,
  onConfirm,
  onCancel,
  loading,
}: {
  tourTitle: string;
  classification: Classification | "all";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const cls = CLASSIFICATIONS.find((c) => c.key === classification);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-red-100 p-7">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-2xl">🗑️</div>
        <h3 className="font-display text-xl text-[#1c0d00] mb-2">Delete Pricing</h3>
        <p className="text-sm text-[#7a5c2e] mb-6">
          Are you sure you want to delete{" "}
          {cls ? (
            <><span className="font-bold">{cls.icon} {cls.label}</span> pricing for</>
          ) : "all pricing for"}{" "}
          <span className="font-bold">{tourTitle}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border-2 border-[#e8d5b0] text-[#7a5c2e] text-sm font-bold hover:bg-[#f5e6c8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Deleting…</>
            ) : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TourPricingView({
  onEdit,
}: {
  /** Called with tourId + classification when user clicks Edit */
  onEdit?: (tourId: string, classification: Classification) => void;
}) {
  const [grouped, setGrouped] = useState<GroupedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<Classification | "all">("all");
  const [expandedTours, setExpandedTours] = useState<Set<string>>(new Set());

  // Modals
  const [viewTour, setViewTour] = useState<GroupedTour | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    tour: GroupedTour; classification: Classification | "all";
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("tour_pricing")
      .select("id, tour_id, season, persons, price, currency, classification, created_at, tours(title)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Group by tour → classification → season → persons
    const map = new Map<string, GroupedTour>();
    for (const row of (data ?? []) as PricingRecord[]) {
      if (!map.has(row.tour_id)) {
        const tourTitle = Array.isArray(row.tours) ? row.tours[0]?.title : row.tours?.title;
        map.set(row.tour_id, {
          tour_id: row.tour_id,
          tour_title: tourTitle ?? "Unknown Tour",
          classifications: {},
        });
      }
      const tour = map.get(row.tour_id)!;
      if (!tour.classifications[row.classification]) tour.classifications[row.classification] = {};
      const clsMap = tour.classifications[row.classification]!;
      if (!clsMap[row.season]) clsMap[row.season] = {};
      clsMap[row.season]![row.persons] = row;
    }

    setGrouped(Array.from(map.values()));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleExpand = (tourId: string) => {
    setExpandedTours((prev) => {
      const next = new Set(prev);
      next.has(tourId) ? next.delete(tourId) : next.add(tourId);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      let query = supabase.from("tour_pricing").delete().eq("tour_id", deleteTarget.tour.tour_id);
      if (deleteTarget.classification !== "all") {
        query = query.eq("classification", deleteTarget.classification);
      }
      const { error } = await query;
      if (error) throw error;
      setToast({ type: "success", msg: "Pricing deleted successfully." });
      setDeleteTarget(null);
      fetchData();
    } catch (err: unknown) {
      setToast({ type: "error", msg: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter
  const filtered = grouped.filter((t) => {
    const matchSearch = t.tour_title.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "all" || !!t.classifications[filterClass];
    return matchSearch && matchClass;
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-10 px-4" style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap'); * { font-family: 'Lato', sans-serif; } .font-display { font-family: 'Playfair Display', serif; }`}</style>
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse border border-[#e8d5b0]" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen py-10 px-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)" }}>
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button onClick={fetchData} className="px-5 py-2.5 bg-[#b8830a] text-white rounded-lg text-sm font-bold hover:bg-[#9a6d08] transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');
        * { font-family: 'Lato', sans-serif; }
        .font-display { font-family: 'Playfair Display', serif; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b8830a] font-bold mb-1">Safari Management</p>
            <h1 className="font-display text-4xl text-[#1c0d00]">Tour Pricing</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#7a5c2e]">
            <span className="font-bold text-[#1c0d00] text-2xl">{grouped.length}</span> tours with pricing
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8830a] text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search tours…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#e8d5b0] rounded-xl bg-white text-[#1c0d00] text-sm focus:outline-none focus:border-[#b8830a] transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterClass("all")}
              className={`px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${
                filterClass === "all"
                  ? "bg-[#1c0d00] border-[#1c0d00] text-white"
                  : "bg-white border-[#e8d5b0] text-[#7a5c2e] hover:border-[#b8830a]"
              }`}
            >
              All
            </button>
            {CLASSIFICATIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => setFilterClass(c.key)}
                className={`px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-colors ${
                  filterClass === c.key
                    ? `${c.bg} ${c.text} border-[${c.color}]`
                    : "bg-white border-[#e8d5b0] text-[#7a5c2e] hover:border-[#b8830a]"
                }`}
                style={filterClass === c.key ? { borderColor: c.color } : {}}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#e8d5b0] p-12 text-center">
            <div className="text-5xl mb-4">🦒</div>
            <p className="text-[#7a5c2e] font-semibold">No pricing found</p>
            <p className="text-sm text-[#a08050] mt-1">Try adjusting your search or filter.</p>
          </div>
        )}

        {/* ── Tour Cards ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filtered.map((tour) => {
            const isExpanded = expandedTours.has(tour.tour_id);
            const clsKeys = CLASSIFICATIONS.filter((c) => tour.classifications[c.key]);
            const totalEntries = clsKeys.reduce((acc, c) => {
              const clsData = tour.classifications[c.key]!;
              return acc + Object.values(clsData).reduce((a, s) => a + Object.keys(s).length, 0);
            }, 0);

            return (
              <div key={tour.tour_id} className="bg-white rounded-2xl border border-[#e8d5b0] shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-6 py-5 flex items-center gap-4">
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(tour.tour_id)}
                    className="w-8 h-8 rounded-full border-2 border-[#e8d5b0] flex items-center justify-center text-[#7a5c2e] hover:border-[#b8830a] hover:bg-[#fffdf7] transition-all flex-shrink-0"
                  >
                    <span className={`text-xs transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                  </button>

                  {/* Tour name + badges */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg text-[#1c0d00] truncate">{tour.tour_title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {clsKeys.map((c) => (
                        <span
                          key={c.key}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}
                        >
                          {c.icon} {c.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Entry count */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-[#a08050]">entries</p>
                    <p className="text-xl font-bold text-[#1c0d00]">{totalEntries}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setViewTour(tour)}
                      title="View all pricing"
                      className="w-9 h-9 rounded-lg border-2 border-[#e8d5b0] flex items-center justify-center text-[#7a5c2e] hover:border-[#b8830a] hover:bg-[#fffdf7] transition-all text-sm"
                    >
                      👁
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ tour, classification: "all" })}
                      title="Delete all pricing for this tour"
                      className="w-9 h-9 rounded-lg border-2 border-[#e8d5b0] flex items-center justify-center text-red-400 hover:border-red-300 hover:bg-red-50 transition-all text-sm"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {/* Expanded: per-classification rows ─────────────────── */}
                {isExpanded && (
                  <div className="border-t border-[#f0e0c0]">
                    {clsKeys.map((cls, idx) => {
                      const clsData = tour.classifications[cls.key]!;

                      // Find a sample currency
                      let currency = "USD";
                      for (const seasonData of Object.values(clsData)) {
                        for (const entry of Object.values(seasonData)) {
                          currency = entry.currency;
                          break;
                        }
                        break;
                      }

                      return (
                        <div
                          key={cls.key}
                          className={`${idx > 0 ? "border-t border-[#f0e0c0]" : ""}`}
                        >
                          {/* Classification sub-header */}
                          <div className="px-6 py-3 flex items-center justify-between bg-[#fffdf7]">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${cls.bg} ${cls.text} ${cls.border}`}>
                              <span>{cls.icon}</span>
                              <span>{cls.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#a08050] hidden sm:block">{currency}</span>
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(tour.tour_id, cls.key)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b8830a] text-white text-xs font-bold hover:bg-[#9a6d08] transition-colors"
                                >
                                  ✏️ Edit
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteTarget({ tour, classification: cls.key })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors"
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </div>

                          {/* Pricing mini-table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-[#f0e0c0]">
                                  <th className="px-6 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-[#7a5c2e]">Season</th>
                                  {PERSONS.map((p) => (
                                    <th key={p} className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-widest text-[#7a5c2e]">
                                      {p} Pax
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {SEASONS.map((s) => {
                                  const seasonData = clsData[s.key];
                                  if (!seasonData) return null;
                                  return (
                                    <tr key={s.key} className="border-b border-[#f8f0e4] last:border-0 hover:bg-[#fffdf7] transition-colors">
                                      <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                                          <span className="text-xs font-semibold text-[#3d2008]">{s.label}</span>
                                        </div>
                                      </td>
                                      {PERSONS.map((p) => {
                                        const entry = seasonData[p];
                                        return (
                                          <td key={p} className="px-4 py-3 text-right">
                                            {entry ? (
                                              <span className="font-bold text-[#1c0d00]">
                                                {Number(entry.price).toLocaleString("en-US", {
                                                  style: "currency", currency, minimumFractionDigits: 2,
                                                })}
                                              </span>
                                            ) : (
                                              <span className="text-[#d0b890]">—</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── View Modal ──────────────────────────────────────────────────── */}
      {viewTour && <ViewModal tour={viewTour} onClose={() => setViewTour(null)} />}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          tourTitle={deleteTarget.tour.tour_title}
          classification={deleteTarget.classification}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-semibold max-w-sm
            ${toast.type === "success" ? "bg-[#1c5e2e] text-white" : "bg-[#8b1a1a] text-white"}`}
        >
          <span className="text-lg">{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}
    </div>
  );
}