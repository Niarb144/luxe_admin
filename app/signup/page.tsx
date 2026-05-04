"use client";

import { useState } from "react";
import { signUp } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await signUp(formData);

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/safari-bg.jpg')] bg-cover">
      <div className="bg-black/60 p-8 rounded-2xl w-full max-w-md text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required className="w-full p-3 rounded-lg bg-white/10"/>
          <input name="password" type="password" placeholder="Password" required className="w-full p-3 rounded-lg bg-white/10"/>

          <button className="w-full bg-amber-600 p-3 rounded-lg">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}