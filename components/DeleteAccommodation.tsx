"use client";
import { supabase } from "@/lib/supabase";

export default function DeleteAccommodation({ accommodation }: { accommodation: { id: string } }) {

async function deleteAccommodation(id: string) {
  const confirmed = window.confirm(
    "Delete this accommodation?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("accommodations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete accommodation");
    return;
  }

  // refresh UI
  window.location.reload();
}

return(
    <button
        onClick={() => deleteAccommodation(accommodation.id)}
        className="ml-4 text-red-500 hover:underline cursor-pointer"
        >
        Delete
    </button>
)

}