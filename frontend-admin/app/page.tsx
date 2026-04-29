import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
        Welcome to Luxe Plains Admin Dashboard
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Manage your tours, bookings, and website content with ease.
      </p>
      <div className="mt-8 space-x-4">
        <Link href="/admin/login" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Admin Login
        </Link>
      </div>  
    </div>
  );
}
