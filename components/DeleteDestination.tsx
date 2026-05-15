"use client";
import { supabase } from "@/lib/supabase";

export default function DeleteDestination({ destination }: { destination: { id: string } }) {

async function deleteDestination(id: string) {
  const confirmed = window.confirm(
    "Delete this destination?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("destinations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete destination");
    return;
  }

  // refresh UI
  window.location.reload();
}

return(
    <button
        onClick={() => deleteDestination(destination.id)}
        className="ml-4 text-red-500 hover:underline cursor-pointer"
        >
        Delete
    </button>
)

}