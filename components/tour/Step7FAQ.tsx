"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Step7FAQs({
  tourId,
  faqs,
  setFaqs,
}: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter(
      (_: any, i: number) => i !== index
    );
    setFaqs(updated);
  };

  async function handleSaveFaqs() {
    if (!tourId) return;

    const validFaqs = faqs.filter(
      (faq: any) =>
        faq.question.trim() &&
        faq.answer.trim()
    );

    if (validFaqs.length === 0) {
      router.push(`/admin/tours/${tourId}/preview`);
      return;
    }

    setLoading(true);

    const faqPayload = validFaqs.map((faq: any) => ({
      tour_id: tourId,
      question: faq.question,
      answer: faq.answer,
    }));

    const { error } = await supabase
      .from("tour_faqs")
      .insert(faqPayload);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to save FAQs");
      return;
    }

    router.push(`/admin/tours/${tourId}/preview`);
  }

  return (
    <div className="min-h-screen text-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-bold mb-2">
          Tour FAQs
        </h1>

        <p className="text-gray-500 mb-8">
          Add frequently asked questions for this tour
        </p>

        {faqs.map((faq: any, index: number) => (
          <div
            key={index}
            className="mb-6 bg-gray-400/5 border border-white/10 p-4 rounded-xl"
          >
            <input
              type="text"
              placeholder="Question"
              className="w-full mb-3 p-3 rounded-lg bg-black/40 border border-white/10"
              value={faq.question}
              onChange={(e) =>
                updateFaq(
                  index,
                  "question",
                  e.target.value
                )
              }
            />

            <textarea
              placeholder="Answer"
              className="w-full p-3 rounded-lg bg-black/40 border border-white/10"
              rows={4}
              value={faq.answer}
              onChange={(e) =>
                updateFaq(
                  index,
                  "answer",
                  e.target.value
                )
              }
            />

            <button
              onClick={() => removeFaq(index)}
              className="text-red-400 mt-3 text-sm cursor-pointer hover:underline"
            >
              Remove FAQ
            </button>
          </div>
        ))}

        <button
          onClick={addFaq}
          className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-3 rounded-lg font-semibold cursor-pointer"
        >
          + Add FAQ
        </button>

        <button
          onClick={handleSaveFaqs}
          disabled={loading}
          className="w-full mt-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold cursor-pointer"
        >
          {loading ? "Saving..." : "Complete Tour"}
        </button>

      </div>
    </div>
  );
}