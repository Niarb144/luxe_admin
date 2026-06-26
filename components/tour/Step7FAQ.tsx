"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Step7FAQs({ tourId, faqs, setFaqs, back }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Load existing FAQs on mount
  useEffect(() => {
    if (!tourId) { setFetching(false); return; }

    supabase
      .from("tour_faqs")
      .select("id, question, answer")
      .eq("tour_id", tourId)
      .order("id")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setFaqs(data.map((row: any) => ({
            id: row.id,
            question: row.question,
            answer: row.answer,
          })));
        }
        setFetching(false);
      });
  }, [tourId]);

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_: any, i: number) => i !== index));
  };

  async function handleSaveFaqs() {
    if (!tourId) return;

    const validFaqs = faqs.filter(
      (faq: any) => faq.question.trim() && faq.answer.trim()
    );

    // FAQs are optional — allow finishing without any
    if (validFaqs.length === 0) {
      router.push("/admin/tours/");
      return;
    }

    setLoading(true);

    // Delete existing then re-insert
    const { error: deleteError } = await supabase
      .from("tour_faqs")
      .delete()
      .eq("tour_id", tourId);

    if (deleteError) {
      console.error(deleteError);
      alert("Failed to save FAQs");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("tour_faqs").insert(
      validFaqs.map((faq: any) => ({
        tour_id: tourId,
        question: faq.question,
        answer: faq.answer,
      }))
    );

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save FAQs");
      return;
    }

    router.push("/admin/tours/");
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading FAQs...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-bold mb-2">Tour FAQs</h1>
        <p className="text-gray-500 mb-8">
          Add frequently asked questions for this tour
        </p>

        {faqs.length === 0 && (
          <p className="text-sm text-gray-500 mb-6">No FAQs added yet.</p>
        )}

        {faqs.map((faq: any, index: number) => (
          <div
            key={faq.id ?? index}
            className="mb-6 bg-gray-400/5 border border-white/10 p-4 rounded-xl"
          >
            <input
              type="text"
              placeholder="Question"
              className="w-full mb-3 p-3 rounded-lg bg-black/40 border border-white/10"
              value={faq.question}
              onChange={(e) => updateFaq(index, "question", e.target.value)}
            />
            <textarea
              placeholder="Answer"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              rows={4}
              value={faq.answer}
              onChange={(e) => updateFaq(index, "answer", e.target.value)}
            />
            <button
              onClick={() => removeFaq(index)}
              className="text-red-400 mt-3 text-sm cursor-pointer hover:text-red-300 transition"
            >
              Remove FAQ
            </button>
          </div>
        ))}

        <button
          onClick={addFaq}
          className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-3 rounded-lg font-semibold cursor-pointer mb-6 block"
        >
          + Add FAQ
        </button>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={back}
            className="py-3 px-6 rounded-lg border border-gray-600/10 hover:bg-gray-600/5 transition text-sm text-gray-600 cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={handleSaveFaqs}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 transition font-semibold text-black cursor-pointer disabled:opacity-60"
          >
            {loading ? "Saving..." : "Finish & View Tours →"}
          </button>
        </div>

      </div>
    </div>
  );
}