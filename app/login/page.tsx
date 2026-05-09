"use client";

import { useState } from "react";
import { signIn } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const { data } = await supabase.auth.getUser();
  console.log("USER:", data.user);
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/img3.webp')] bg-cover bg-center">
      <div className="bg-black/60 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
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

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full p-3 pr-10 rounded-lg bg-white/10 border border-white/20 focus:outline-none"
            />

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

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