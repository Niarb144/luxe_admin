import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function ToursPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION:", session);

  if (!session) {
    return (
      <div className="p-10 text-white bg-black">
        <h1>Not logged in</h1>
      </div>
    );
  }

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold">Protected Tours Page</h1>

      <Link href="/admin" className="text-amber-500 hover:underline">
        Go to Admin Home
      </Link>

      <Link href="/tours/create" className="ml-4 text-amber-500 hover:underline">
        Create New Tour
      </Link>
    </div>
  );
}