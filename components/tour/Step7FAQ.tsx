"use client";

export default function StepFAQs({
  faqs,
  setFaqs,
  nextStep,
  prevStep,
}: any) {
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const removeFaq = (index: number) => {
    const updated = faqs.filter((_: any, i: number) => i !== index);
    setFaqs(updated);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">FAQs</h2>

      {faqs.map((faq: any, index: number) => (
        <div key={index} className="mb-6 bg-white p-4 rounded shadow">
          <input
            type="text"
            placeholder="Question"
            className="w-full mb-2 p-2 border rounded"
            value={faq.question}
            onChange={(e) =>
              updateFaq(index, "question", e.target.value)
            }
          />

          <textarea
            placeholder="Answer"
            className="w-full p-2 border rounded"
            value={faq.answer}
            onChange={(e) =>
              updateFaq(index, "answer", e.target.value)
            }
          />

          <button
            onClick={() => removeFaq(index)}
            className="text-red-500 mt-2 text-sm"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={addFaq}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Add FAQ
      </button>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          Back
        </button>

        <button
          onClick={nextStep}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
}