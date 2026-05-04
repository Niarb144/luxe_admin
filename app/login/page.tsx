"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await signIn(formData);
    
    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/admin");
    }

    const { data } = await supabase.auth.getSession();
    console.log("SESSION:", data.session);

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/safari-bg.jpg')] bg-cover bg-center">
      <div className="bg-black/60 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome Back 
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
          />

          <button className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-semibold">
            Login
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          No account?{" "}
          <a href="/signup" className="text-amber-400">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}