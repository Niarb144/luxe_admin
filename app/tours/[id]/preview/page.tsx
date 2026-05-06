import { supabase } from "@/lib/supabase";
import Link from "next/dist/client/link";

export default async function TourPreviewPage({ params }: any) {
  const { id } = await params;

  // Tour
  const { data: tour } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .single();

  // Inclusions
  const { data: inclusions } = await supabase
    .from("tour_inclusions")
    .select("*")
    .eq("tour_id", id);

  // Exclusions
  const { data: exclusions } = await supabase
    .from("tour_exclusions")
    .select("*")
    .eq("tour_id", id);

  // Itinerary
  const { data: itinerary } = await supabase
    .from("tour_itinerary")
    .select("*")
    .eq("tour_id", id)
    .order("day_number", { ascending: true });

  // Images
  const { data: images } = await supabase
    .from("tour_images")
    .select("*")
    .eq("tour_id", id);

  // Route
  const { data: route } = await supabase
    .from("tour_route_maps")
    .select("*")
    .eq("tour_id", id)
    .single();

  const mainImage = images?.find((img) => img.is_main);

  return (
    <div className="min-h-screen bg-black text-white p-10">

      {/* Hero */}
      <div className="mb-10">
        <img
          src={mainImage?.image_url || tour?.main_image}
          className="w-full h-96 object-cover rounded-xl"
        />

        <h1 className="text-4xl font-bold mt-6">{tour?.title}</h1>
        <p className="text-gray-400">{tour?.location}</p>
      </div>

      {/* Inclusions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Inclusions</h2>
        <ul className="list-disc pl-6">
          {inclusions?.map((i) => (
            <li key={i.id}>{i.item}</li>
          ))}
        </ul>
      </section>

      {/* Exclusions */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Exclusions</h2>
        <ul className="list-disc pl-6">
          {exclusions?.map((i) => (
            <li key={i.id}>{i.item}</li>
          ))}
        </ul>
      </section>

      {/* Itinerary */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Itinerary</h2>

        {itinerary?.map((item) => (
          <div key={item.id} className="mb-4">
            <h3 className="font-bold">
              Day {item.day_number}: {item.title}
            </h3>
            <p className="text-gray-400">{item.description}</p>
            <p className="text-sm text-gray-500">
              {item.start_time} - {item.end_time}
            </p>
          </div>
        ))}
      </section>

      {/* Route Map */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Route</h2>

        {route?.map_url && (
          <iframe
            src={route.map_url}
            className="w-full h-96 rounded-xl"
            loading="lazy"
          />
        )}
      </section>

      <Link href={`/tours/${id}/edit`} className="inline-block px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg">
        Edit Tour
      </Link>

      <Link href="/tours" className="inline-block ml-4 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg">
        Back to List
      </Link>

      <Link href="/admin" className="inline-block ml-4 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg">
        Home
      </Link>

    </div>
  );
}