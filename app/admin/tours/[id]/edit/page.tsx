// app/admin/tours/[id]/edit/page.tsx
import TourWizard from "@/components/tour/TourWizard";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: tour } = await supabase
    .from("tours")
    .select("id")
    .eq("id", id)
    .single();

  if (!tour) return notFound();

  return <TourWizard tourId={id} />;
}