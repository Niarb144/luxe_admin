import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step3Exclusions({ tourId, next }: any) {
  const [items, setItems] = useState<string[]>([]);

  async function save() {
    const rows = items.map((item) => ({
      tour_id: tourId,
      item,
    }));

    await supabase.from("tour_exclusions").insert(rows);

    next(items);
  }

  return (
    <div>
      <h1>Step 3: Exclusions</h1>
      {/* UI for adding items */}
      <textarea name="item" placeholder="Exclusions" />
      <button onClick={save} className="btn cursor-pointer">
        Next
      </button>
    </div>
  );
}