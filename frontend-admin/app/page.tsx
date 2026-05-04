"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center text-center text-white">

      {/* 🌄 BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src="/images/img7.jpg" 
          alt="Safari background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 🌑 OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 🌟 CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl px-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Luxe Plains
          <span className="block text-orange-400 mt-2">
            Admin Dashboard
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-200">
          Manage your safaris, bookings, and experiences across East Africa
          with precision and ease.
        </p>

        {/* CTA BUTTON */}
        <div className="mt-8">
          <Link
            href="/admin/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full text-lg transition shadow-lg"
          >
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}