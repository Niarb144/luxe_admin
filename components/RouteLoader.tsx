"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      <div className="w-12 h-12 border-4 border-[#b77e24]/30 border-t-[#b77e24] rounded-full animate-spin shadow-lg bg-white/80 backdrop-blur-sm" />
    </div>
  );
}