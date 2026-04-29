"use client";

import { useState } from "react";
import { createTourBasic } from "@/actions/createTour";
import ImageUpload from "./ImageUploader";

export default function BasicInfoForm({ onSuccess }: any) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    duration: "",
    mainImage: "",
  });

  async function handleSubmit(e: any) {
    e.preventDefault();

    const tour = await createTourBasic(form);
    onSuccess(tour.id);
  }

  return (
    <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-6 rounded-2xl shadow-md border"
        >
        {/* Header */}
        <div>
            <h2 className="text-xl font-semibold text-[#bb86fc]">Basic Tour Information</h2>
            <p className="text-sm text-gray-800">
                Fill in the main details for the tour
            </p>
        </div>

        {/* Title */}
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Title</label>
            <input
            placeholder="e.g. 5-Day Maasai Mara Safari"
            className="w-full border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
            onChange={(e) =>
                setForm({ ...form, title: e.target.value })
            }
            />
        </div>

        {/* Description */}
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Description</label>
            <textarea
            placeholder="Describe the experience..."
            rows={4}
            className="w-full border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
            onChange={(e) =>
                setForm({ ...form, description: e.target.value })
            }
            />
        </div>

        {/* Grid: Price, Location, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Price ($)</label>
            <input
                type="number"
                placeholder="1200"
                className="w-full border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
                onChange={(e) =>
                setForm({ ...form, price: e.target.value })
                }
            />
            </div>

            <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Location</label>
            <input
                placeholder="Kenya"
                className="w-full border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
                onChange={(e) =>
                setForm({ ...form, location: e.target.value })
                }
            />
            </div>

            <div className="space-y-1">
            <label className="text-sm font-medium text-gray-800">Duration</label>
            <input
                placeholder="5 Days"
                className="w-full border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-gray-700"
                onChange={(e) =>
                setForm({ ...form, duration: e.target.value })
                }
            />
            </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-800">Main Image</label>

            <div className="border-2 border-dashed rounded-xl p-4 text-center hover:border-black transition">
            <ImageUpload
                onUpload={(url: string) =>
                setForm({ ...form, mainImage: url })
                }
            />
            <p className="text-xs text-gray-500 mt-2 cursor-pointer">
                Upload a high-quality cover image
            </p>
            </div>

            {form.mainImage && (
            <div className="relative w-fit">
                <img
                src={form.mainImage}
                className="w-48 rounded-xl shadow-sm border"
                />
            </div>
            )}
        </div>

        {/* Button */}
        <div className="flex justify-end">
            <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
            Continue →
            </button>
        </div>
    </form>
  );
}