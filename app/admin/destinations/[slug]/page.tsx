import { supabase } from "@/lib/supabase";
import Link from "next/dist/client/link";

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: destination } = await supabase
    .from("destinations")
    .select(`*`)
    .eq("slug", slug)
    .single();

  if (!destination) return null;

  const destinationId = destination.id;

  const {data: facts} = await supabase
    .from("destination_facts")
    .select("*")
    .eq("destination_id", destinationId);

  const {data: highlight} = await supabase
    .from("destination_highlights")
    .select("*")
    .eq("destination_id", destinationId);

  const {data: images} = await supabase 
    .from("destination_images")
    .select("*")
    .eq("destination_id", destinationId);

  const { data: allFacts } = await supabase
  .from("destination_facts")
  .select("*");

  // console.log("ALL FACTS:", allFacts);

  // console.log("DESTINATION:", destination);
  // console.log("DESTINATION ID:", destinationId);
  // console.log("FACTS:", facts);
  // console.log("HIGHLIGHTS:", highlight);
  // console.log("IMAGES:", images);

  return (
    <div className="space-y-10 bg-black">
      {/* Hero */}
      <div className="relative h-[500px]">
        <img
          src={images?.[0]?.image_url}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 flex items-end p-10">
          <div>
            <h1 className="text-5xl text-white font-bold">
              {destination.name}
            </h1>

            <p className="text-white/80 text-xl">
              {destination.country}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="max-w-5xl mx-auto px-4">
        <p className="text-lg leading-relaxed">
          {destination.description}
        </p>
      </section>

      {/* Highlights */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">
          Highlights
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {highlight?.map((item: any) => (
            <div
              key={item?.id}
              className="p-5 border rounded-2xl"
            >
              {item?.highlight}
            </div>
          ))}
        </div>
      </section>

      {/* Facts */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">
          Facts
        </h2>

        <div className="space-y-3">
          {facts?.map((fact: any) => (
            <div
              key={fact?.id}
              className="p-4 bg-white rounded-xl text-gray-800 font-semibold"
            >
              {fact?.fact}
            </div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <iframe
          src={destination.map_url}
          className="w-full h-[500px] rounded-3xl"
          loading="lazy"
        />
      </section>

      <Link href="/admin/destinations" className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg">
        Back to List
      </Link>
    </div>
  );
}