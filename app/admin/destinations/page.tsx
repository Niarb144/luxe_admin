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

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {destinations?.length ?? 0} total{" "}
            {destinations?.length === 1 ? "destination" : "destinations"}
          </p>
        </div>
        <Link
          href="/admin/destinations/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b77e24] hover:bg-[#a06d1f] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Destination
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#041f0e] text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#b77e24]">
                  Destination
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#b77e24] hidden sm:table-cell">
                  Country
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#b77e24] hidden md:table-cell">
                  Slug
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#b77e24] hidden lg:table-cell">
                  Images
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#b77e24] text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!destinations?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    No destinations found. Add one to get started.
                  </td>
                </tr>
              )}

              {destinations?.map((destination) => (
                <tr
                  key={destination.id}
                  className="hover:bg-amber-50/40 transition-colors duration-150 group"
                >
                  {/* Destination name + thumbnail */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {destination.destination_images?.[0]?.image_url ? (
                        <img
                          src={destination.destination_images[0].image_url}
                          alt={destination.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-semibold text-gray-900 group-hover:text-[#b77e24] transition-colors">
                        {destination.name}
                      </span>
                    </div>
                  </td>

                  {/* Country */}
                  <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                    {destination.country || "—"}
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 font-mono text-xs">
                      {destination.slug || "—"}
                    </span>
                  </td>

                  {/* Image count */}
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      {destination.destination_images?.length ?? 0}{" "}
                      {destination.destination_images?.length === 1 ? "image" : "images"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">

                      {/* View public page */}
                      <Link
                        href={`/admin/destinations/${destination.slug}`}
                        title="View public page"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[#041f0e] hover:bg-gray-100 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>

                      {/* Edit */}
                      <Link
                        href={`/admin/destinations/${destination.slug}`}
                        title="Edit destination"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[#b77e24] hover:bg-amber-50 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </Link>

                      {/* Delete */}
                      <DeleteDestination destination={destination} />

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}