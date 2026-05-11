import { supabase } from "@/lib/supabase";

export default async function DestinationPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: destination } = await supabase
    .from("destinations")
    .select(`
      *,
      destination_images (*),
      destination_facts (*),
      destination_highlights (*)
    `)
    .eq("slug", params.slug)
    .single();

  if (!destination) return null;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative h-[500px]">
        <img
          src={destination.destination_images?.[0]?.image_url}
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
          {destination.destination_highlights.map((item: any) => (
            <div
              key={item.id}
              className="p-5 border rounded-2xl"
            >
              {item.highlight}
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
          {destination.destination_facts.map((fact: any) => (
            <div
              key={fact.id}
              className="p-4 bg-gray-100 rounded-xl"
            >
              {fact.fact}
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
    </div>
  );
}