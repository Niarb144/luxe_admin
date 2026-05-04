// /app/(protected)/layout.tsx
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: any) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🚫 Not logged in
  if (!user) {
    redirect("./login");
  }

  return <>{children}</>;
}