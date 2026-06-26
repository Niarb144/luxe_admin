"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Map,
  Bed,
  Calendar,
  BookOpen,
  Globe,
} from "lucide-react";

export default function AdminSidebar({
  email,
}: {
  email: string;
}) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const [openMenus, setOpenMenus] =
    useState({
      tours: true,
      destinations: false,
      accommodations: false,
      bookings: false,
    });

  const toggleMenu = (
    key: keyof typeof openMenus
  ) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuGroups = [
    {
      title: "Tours",
      key: "tours" as const,
      icon: Map,
      items: [
        {
          name: "All Tours",
          href: "/admin/tours",
        },
        {
          name: "Add Tour",
          href: "/admin/tours/create",
        },
        {
          name: "Tour Pricing",
          href: "/admin/pricing",
        },
      ],
    },
    {
      title: "Destinations",
      key: "destinations" as const,
      icon: Globe,
      items: [
        {
          name: "All Destinations",
          href: "/admin/destinations",
        },
        {
          name: "Add Destination",
          href: "/admin/destinations/create",
        },
        {
          name: "Edit Destinations",
          href:
            "/admin/destinations/edit",
        },
      ],
    },
    {
      title: "Accommodations",
      key: "accommodations" as const,
      icon: Bed,
      items: [
        {
          name: "All Accommodations",
          href: "/admin/accommodations",
        },
        {
          name: "Add Accommodation",
          href:
            "/admin/accommodations/create",
        },
        {
          name:
            "Edit Accommodations",
          href:
            "/admin/accommodations/edit",
        },
      ],
    },
    {
      title: "Bookings",
      key: "bookings" as const,
      icon: Calendar,
      items: [
        {
          name: "All Bookings",
          href: "/admin/bookings",
        },
        {
          name: "Calendar",
          href:
            "/admin/bookings/calendar",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() =>
          setMobileOpen(true)
        }
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg cursor-pointer"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-screen
          bg-slate-900
          text-white
          flex flex-col
          z-50
          transition-all duration-300
          
          ${
            collapsed
              ? "w-20"
              : "w-72"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {!collapsed && (
            <span className="font-bold text-xl">
              Luxe Admin
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCollapsed(
                  !collapsed
                )
              }
              className="hidden lg:block"
            >
              {collapsed ? (
                <PanelLeftOpen
                  size={20}
                />
              ) : (
                <PanelLeftClose
                  size={20}
                />
              )}
            </button>

            <button
              onClick={() =>
                setMobileOpen(
                  false
                )
              }
              className="lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
              pathname === "/admin"
                ? "bg-amber-500 text-black"
                : "hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard
              size={20}
            />
            {!collapsed && (
              <span>
                Dashboard
              </span>
            )}
          </Link>

          {menuGroups.map(
            (group) => {
              const Icon =
                group.icon;

              return (
                <div
                  key={
                    group.title
                  }
                >
                  <button
                    onClick={() =>
                      toggleMenu(
                        group.key
                      )
                    }
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                      />

                      {!collapsed && (
                        <span>
                          {
                            group.title
                          }
                        </span>
                      )}
                    </div>

                    {!collapsed &&
                      (openMenus[
                        group.key
                      ] ? (
                        <ChevronDown
                          size={16}
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                        />
                      ))}
                  </button>

                  {!collapsed &&
                    openMenus[
                      group.key
                    ] && (
                      <div className="ml-8 border-l border-slate-700 pl-3">
                        {group.items.map(
                          (
                            item
                          ) => (
                            <Link
                              key={
                                item.href
                              }
                              href={
                                item.href
                              }
                              onClick={() =>
                                setMobileOpen(
                                  false
                                )
                              }
                              className={`block py-2 px-3 rounded text-sm ${
                                pathname ===
                                item.href
                                  ? "bg-amber-500 text-black"
                                  : "hover:bg-slate-800"
                              }`}
                            >
                              {
                                item.name
                              }
                            </Link>
                          )
                        )}
                      </div>
                    )}
                </div>
              );
            }
          )}

          {/* Blogs */}
          <Link
            href="/admin/blogs"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 mt-2"
          >
            <BookOpen
              size={20}
            />
            {!collapsed && (
              <span>Blogs</span>
            )}
          </Link>

          {/* Countries */}
          <Link
            href="/admin/countries"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
          >
            <Globe size={20} />
            {!collapsed && (
              <span>
                Countries
              </span>
            )}
          </Link>
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-slate-700 text-sm text-slate-300">
            {email}
          </div>
        )}
      </aside>
    </>
  );
}