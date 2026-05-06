import { createClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await createClient();

  // Get counts (fast, no full data fetch)
  const { count: toursCount } = await supabase
    .from("tours")
    .select("*", { count: "exact", head: true });

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  const { count: destinationsCount } = await supabase
    .from("destinations")
    .select("*", { count: "exact", head: true });

  const { count: blogsCount } = await supabase
    .from("blogs")
    .select("*", { count: "exact", head: true });

  const stats = [
    { label: "Tours", value: toursCount ?? 0 },
    { label: "Bookings", value: bookingsCount ?? 0 },
    { label: "Destinations", value: destinationsCount ?? 0 },
    { label: "Blogs", value: blogsCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow p-6 border border-gray-100"
          >
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Optional future section */}
      <div className="mt-10 bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Activity
        </h2>
        <p className="text-gray-500 mt-2">
          (You can later add recent bookings, new tours, etc.)
        </p>
      </div>
    </div>
  );
}