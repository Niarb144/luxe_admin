"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AddAccommodation() {
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState([""]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [fileList, setFileList] = useState<FileList | null>(null);

  const [destinations, setDestinations] = useState<
    { id: any; name: string }[]
  >([]);
  const [selectedDestination, setSelectedDestination] = useState("");

  const [services, setServices] = useState([""]);

  const [form, setForm] = useState({
    hotel_name: "",
    country_location: "",
    location: "",
    accommodation_type: "",
    description: "",
    map_url: "",
    classification: "Comfort",
  });

  useEffect(() => {
    fetchDestinations();
  }, []);

  async function fetchDestinations() {
    const { data } = await supabase.from("destinations").select("id,name");
    setDestinations(data || []);
  }

  // ✅ Upload images and return URLs
  async function uploadImages(files: FileList): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const filename = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("accommodation-images")
        .upload(filename, file);

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const { data } = supabase.storage
        .from("accommodation-images")
        .getPublicUrl(filename);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredAmenities = amenities.filter(
        (a) => a.trim() !== ""
      );

      // ✅ Upload images FIRST (no state dependency)
      let uploadedImageUrls: string[] = [];

      if (fileList && fileList.length > 0) {
        uploadedImageUrls = await uploadImages(fileList);
      }

      const filteredServices = services.filter(
        (s) => s.trim() !== ""
      );

      // ✅ Insert accommodation WITH images
      const { error } = await supabase
        .from("accommodations")
        .insert([
          {
            ...form,
            destination_id: selectedDestination || null,
            amenities: filteredAmenities,
            services: filteredServices,
            images: uploadedImageUrls,
          },
        ]);

      if (error) {
        alert(error.message);
        return;
      }

      alert("Accommodation added successfully!");

      // Reset form
      setForm({
        hotel_name: "",
        country_location: "",
        description: "",
        map_url: "",
        classification: "Comfort",
        location: "",
        accommodation_type: "",
      });

      setAmenities([""]);
      setServices([""]);
      setFileList(null);
      setImagesPreview([]);

    } catch (err: any) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Hotel Name */}
      <input
        placeholder="Hotel Name"
        value={form.hotel_name}
        onChange={(e) =>
          setForm({ ...form, hotel_name: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      />

      {/* Country */}
      <input
        placeholder="Country"
        value={form.country_location}
        onChange={(e) =>
          setForm({ ...form, country_location: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      />

      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) =>
          setForm({ ...form, location: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      />

      {/* Description */}
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      />

      {/* Map URL */}
      <input
        placeholder="Google Maps URL"
        value={form.map_url}
        onChange={(e) =>
          setForm({ ...form, map_url: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      />

      {/* Destination */}
      <select
        value={selectedDestination}
        onChange={(e) => setSelectedDestination(e.target.value)}
        className="border p-3 w-full text-gray-700"
      >
        <option value="">Select Destination</option>
        {destinations.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Classification */}
      <select
        value={form.classification}
        onChange={(e) =>
          setForm({ ...form, classification: e.target.value })
        }
        className="border p-3 w-full text-gray-700"
      >
        <option>Economy</option>
        <option>Comfort</option>
        <option>Luxury</option>
        <option>Super Luxury</option>
      </select>

      <input
        placeholder="Accommodation Type"
        value={form.accommodation_type}
        onChange={(e) =>
          setForm({
            ...form,
            accommodation_type: e.target.value,
          })
        }
        className="border p-3 w-full text-gray-700"
      />

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">
          Amenities
        </h3>

        {amenities.map((amenity, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              value={amenity}
              placeholder="Amenity"
              onChange={(e) => {
                const updated = [...amenities];
                updated[index] = e.target.value;
                setAmenities(updated);
              }}
              className="border p-3 flex-1 text-gray-700"
            />
            <button
              type="button"
              onClick={() =>
                setAmenities(amenities.filter((_, i) => i !== index))
              }
              className="bg-red-500 text-white px-4 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setAmenities([...amenities, ""])}
          className="bg-green-500 text-white px-4 py-2 mt-1 cursor-pointer"
        >
          + Add Amenity
        </button>
      </div>

        {/* Services */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">
          Services
        </h3>

        {services.map((service, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              value={service}
              placeholder="Service"
              onChange={(e) => {
                const updated = [...services];
                updated[index] = e.target.value;
                setServices(updated);
              }}
              className="border p-3 flex-1 text-gray-700"
            />

            <button
              type="button"
              onClick={() =>
                setServices(
                  services.filter((_, i) => i !== index)
                )
              }
              className="bg-red-500 text-white px-4"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setServices([...services, ""])}
          className="bg-green-500 text-white px-4 py-2 mt-1"
        >
          + Add Service
        </button>
      </div>

      {/* Images */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">
          Upload Images
        </h3>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (!e.target.files) return;

            setFileList(e.target.files);

            // Preview only (not DB source of truth)
            const previews = Array.from(e.target.files).map((file) =>
              URL.createObjectURL(file)
            );

            setImagesPreview(previews);
          }}
          className="w-full text-gray-700"
        />

        <div className="grid grid-cols-3 gap-3 mt-4">
          {imagesPreview.map((img, index) => (
            <img
              key={index}
              src={img}
              className="h-28 w-full object-cover rounded"
              alt="preview"
            />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        disabled={loading}
        className="bg-black text-white px-6 py-3 cursor-pointer disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Accommodation"}
      </button>
    </form>
  );
}