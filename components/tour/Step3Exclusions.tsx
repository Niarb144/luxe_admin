import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step3Exclusions({ tourId, next }: any) {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function addItem() {
    if (!input.trim()) return;
    setItems([...items, input]);
    setInput("");
  }

  async function save() {
    if (!tourId) {
      console.error("No tourId found");
      return;
    }

    const rows = items.map((item) => ({
      tour_id: tourId,
      item,
    }));

    console.log("TOUR ID:", tourId);

    const { error } = await supabase.from("tour_exclusions").insert(rows);

    if (error) {
      console.error(error);
      return;
    }

    next(items);
  }

  return (
    <div>
      <h1>Step 3: Exclusions</h1>
      {/* UI for adding items */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add exclusion"
      />

      <button type="button" onClick={addItem}>
        Add
      </button>

      <ul>
        {items.map((i, index) => (
          <li key={index}>{i}</li>
        ))}
      </ul>
      <button onClick={save} className="btn cursor-pointer">
        Next
      </button>
    </div>
  );
}