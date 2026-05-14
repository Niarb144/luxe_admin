"use client";
import { supabase } from "@/lib/supabase";

export default function DeleteTour({ tour }: { tour: { id: string } }) {

async function deleteTour(id: string) {
  const confirmed = window.confirm(
    "Delete this tour?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("tours")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete tour");
    return;
  }

  // refresh UI
  window.location.reload();
}

return(
    <button
        onClick={() => deleteTour(tour.id)}
        className="ml-4 text-red-500 hover:underline"
        >
        Delete
    </button>
)

}