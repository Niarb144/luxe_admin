import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DeleteDestination from "@/components/DeleteDestination";

export default async function DestinationsPage() {
  const { data: destinations } = await supabase
    .from("destinations")
    .select(`
      *,
      destination_images (
        image_url
      )
    `);

    console.log(destinations);

  return (
    <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/admin/destinations/create"
          className="flex items-center justify-center border-2 border-dashed rounded-3xl h-72 text-gray-500 hover:border-gray-400 transition"
        >
          + Add New Destination
        </Link>
      {destinations?.map((destination) => (
        <Link
          key={destination.id}
          href={`/admin/destinations/${destination.slug}`}
          className="rounded-3xl overflow-hidden shadow-lg"
        >
          <img
            src={destination.destination_images?.[0]?.image_url}
            className="h-72 w-full object-cover"
          />

          <div className="p-5">
            <h2 className="text-2xl font-bold text-gray-800">
              {destination.name}
            </h2>

            <p className="text-gray-500">
              {destination.country}
            </p>
            <DeleteDestination destination={destination} />
          </div>
        </Link>
      ))}
    </div>
  );
}