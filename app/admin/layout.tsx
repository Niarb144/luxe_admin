import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Luxe Admin
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-slate-800"
          >
            Dashboard
          </Link>

          <Link
            href="/tours"
            className="block px-4 py-2 rounded hover:bg-slate-800"
          >
            Tours
          </Link>

          <Link
            href="/admin/destinations"
            className="block px-4 py-2 rounded hover:bg-slate-800"
          >
            Destinations
          </Link>

          <Link
            href="/admin/accommodation"
            className="block px-4 py-2 rounded hover:bg-slate-800"
          >
            Accommodation
          </Link>

          <Link
            href="/admin/blogs"
            className="block px-4 py-2 rounded hover:bg-slate-800"
          >
            Blogs
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700 text-sm text-slate-300">
          {user.email}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            Admin Dashboard
          </h1>

          <LogoutButton />
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}