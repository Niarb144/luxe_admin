import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Step2Inclusions({ tourId, next }: any) {
  const [items, setItems] = useState<string[]>([]);

  async function save() {
    const rows = items.map((item) => ({
      tour_id: tourId,
      item,
    }));

    await supabase.from("tour_inclusions").insert(rows);

    next(items);
  }

  return (
    <div>
      <h1>Step 2: Inclusions</h1>
      {/* UI for adding items */}
      <textarea name="item" placeholder="Inclusions" />
      <button onClick={save} className="btn cursor-pointer">
        Next
      </button>
    </div>
  );
}