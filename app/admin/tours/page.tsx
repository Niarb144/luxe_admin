import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import DeleteTour from "@/components/DeleteTour";

export default async function ToursPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER:", user);

  if (!user) {
    return (
      <div className="p-0 text-gray-800 bg-white min-h-screen">
        <h1>Not logged in</h1>
      </div>
    );
  }

  // 📦 Fetch tours AFTER auth check
  const { data: tours, error } = await supabase
    .from("tours")
    .select("id, slug, title, duration, price")
    .order("created_at", { ascending: false });

    console.log("TOURS:", tours);
    console.log("ERROR:", error);

  return (
    <div className="p-0 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tours Management</h1>

        <div className="space-x-4">
          
          <Link href="/admin/tours/create" className="text-amber-500 hover:underline">
            + Create New Tour
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white text-black rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gray-200 text-left text-sm uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Days</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {tours?.map((tour) => (
              <tr key={tour.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {tour.title}
                </td>

                <td className="px-6 py-4 text-gray-900">
                  {tour.duration} days
                </td>

                

                <td className="px-6 py-4 font-bold text-gray-900">
                  ${tour.price}
                </td>
                <td className="px-6 py-4">
                  <Link href={`/admin/tours/${tour.id}/edit`} className="text-amber-500 hover:underline">
                    Edit
                  </Link>
                  <DeleteTour tour={tour} />
                  <Link href={`/admin/tours/${tour.slug}/preview`} className="ml-4 text-green-500 hover:underline">
                    Preview
                  </Link>
                </td>
              </tr>
            ))}

            {tours?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No tours found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}