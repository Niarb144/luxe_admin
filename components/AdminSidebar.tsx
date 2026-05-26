"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Tours", href: "/admin/tours" },
  { name: "Destinations", href: "/admin/destinations" },
  { name: "Accommodations", href: "/admin/accommodations" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Blogs", href: "/admin/blogs" },
  { name: "Countries", href: "/admin/countries" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-slate-700">
        Luxe Admin
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded transition ${
                isActive
                  ? "bg-amber-500 text-black font-semibold"
                  : "hover:bg-slate-800 text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 text-sm text-slate-300">
        {email}
      </div>
    </aside>
  );
}