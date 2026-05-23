import { supabase } from "@/lib/supabase";
import Link from "next/dist/client/link";

export default async function AccommodationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: accommodation } = await supabase
    .from("accommodations")
    .select(`
        *,
        destinations(
        id,
        name
        )`
    )
    .eq("id", id)
    .single();

  if (!accommodation) return null;

  const accommodationId = accommodation.id;

  const {data: images} = await supabase 
    .from("accommodation_images")
    .select("*")
    .eq("accommodation_id", accommodationId);

  // console.log("ALL FACTS:", allFacts);

  // console.log("ACCOMMODATION:", accommodation);
  // console.log("ACCOMMODATION ID:", accommodationId);
  // console.log("FACTS:", facts);
  // console.log("HIGHLIGHTS:", highlight);
  // console.log("IMAGES:", images);

  return (
    <div className="space-y-10 bg-black">
      {/* Hero */}
      <div className="relative h-[500px]">
        <img
          src={images?.[0]?.images}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex items-end p-10">
          <div>
            <h1 className="text-5xl text-white font-bold">
              {accommodation.hotel_name}
            </h1>

            <p className="text-white/80 text-xl">
              {accommodation.country_location}
            </p>
            <p>

            Destination:

            {accommodation.destinations?.name}

            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="max-w-5xl mx-auto px-4">
        <p className="text-lg leading-relaxed">
          {accommodation.description}
        </p>
      </section>

      {/* Map */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <iframe
          src={accommodation.map_url}
          className="w-full h-[500px] rounded-3xl"
          loading="lazy"
        />
      </section>

      <Link href="/admin/accommodations" className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg">
        Back to List
      </Link>
    </div>
  );
}