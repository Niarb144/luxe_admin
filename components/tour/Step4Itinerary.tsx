import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step4Itinerary({ tourId, next }: any) {
  const [items, setItems] = useState<string[]>([]);

  async function save() {
    const rows = items.map((item) => ({
      tour_id: tourId,
      item,
    }));

    await supabase.from("tour_itinerary").insert(rows);

    next(items);
  }

  return (
    <div>
      <h1>Step 4: Itinerary</h1>
      {/* UI for adding items */}
      <textarea name="title" placeholder="Itinerary" />
      <button onClick={save} className="btn cursor-pointer">
        Next
      </button>
    </div>
  );
}