"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
  e.preventDefault();
  setLoading(true); 
  setError("");

  const formData = new FormData(e.target);

  const res = await signIn(formData);

  if (res?.error) {
    setError(res.error);
    setLoading(false); // ❌ stop loading on error
  } else {
    router.push("/admin"); // ✅ keep loading during redirect
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

          <button
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                {/* Spinner */}
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
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