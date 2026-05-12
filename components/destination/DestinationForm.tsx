"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import slugify from "slugify";

export default function DestinationForm() {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [description, setDescription] = useState("");

  const [facts, setFacts] = useState([""]);
  const [highlights, setHighlights] = useState([""]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files || []);

  setImages(files);

  const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews(previews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    // 1. Create destination
    const { data: destination, error } = await supabase
      .from("destinations")
      .insert({
        name,
        slug: slugify(name, {
            lower: true,
            strict: true,
        }),
        country,
        map_url: mapUrl,
        description,
        })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // 2. Save images
    if (images.length > 0) {
    const uploadedImages = [];

    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("destination-images")
        .upload(fileName, image);

      if (uploadError) {
        console.error(uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from("destination-images")
        .getPublicUrl(fileName);

      uploadedImages.push({
        destination_id: destination.id,
        image_url: data.publicUrl,
      });
    }

    if (uploadedImages.length > 0) {
      await supabase
        .from("destination_images")
        .insert(uploadedImages);
    }
  }

    // 3. Save facts
    if (facts.length > 0) {
      await supabase.from("destination_facts").insert(
        facts
          .filter((fact) => fact.trim() !== "")
          .map((fact) => ({
            destination_id: destination.id,
            fact,
          }))
      );
    }

    // 4. Save highlights
    if (highlights.length > 0) {
      await supabase.from("destination_highlights").insert(
        highlights
          .filter((highlight) => highlight.trim() !== "")
          .map((highlight) => ({
            destination_id: destination.id,
            highlight,
          }))
      );
    }

    setLoading(false);

    alert("Destination created!");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-6"
    >
      <input
        type="text"
        placeholder="Destination Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-4 rounded-xl text-gray-800 text-lg font-semibold"
      />

      <input
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full border p-4 rounded-xl text-gray-800 text-lg font-semibold"
      />

      <input
        type="text"
        placeholder="Google Map URL"
        value={mapUrl}
        onChange={(e) => setMapUrl(e.target.value)}
        className="w-full border p-4 rounded-xl text-gray-800 text-lg font-semibold"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-4 rounded-xl h-40 text-gray-800 text-lg font-semibold"
      />

      {/* Facts */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Facts</h3>

        {facts.map((fact, index) => (
          <input
            key={index}
            value={fact}
            onChange={(e) => {
              const updated = [...facts];
              updated[index] = e.target.value;
              setFacts(updated);
            }}
            className="w-full border p-3 rounded-xl mb-2 text-gray-800 text-lg font-semibold"
          />
        ))}

        <button
          type="button"
          onClick={() => setFacts([...facts, ""])}
          className="px-4 py-2 bg-black text-white rounded-xl cursor-pointer"
        >
          Add Fact
        </button>
      </div>

      {/* Highlights */}
      <div>
        <h3 className="font-semibold mb-2 text-gray-800">Highlights</h3>

        {highlights.map((highlight, index) => (
          <input
            key={index}
            value={highlight}
            onChange={(e) => {
              const updated = [...highlights];
              updated[index] = e.target.value;
              setHighlights(updated);
            }}
            className="w-full border p-3 rounded-xl mb-2 text-gray-800 text-lg font-semibold"
          />
        ))}

        <button
          type="button"
          onClick={() => setHighlights([...highlights, ""])}
          className="px-4 py-2 bg-black text-white rounded-xl cursor-pointer"
        >
          Add Highlight
        </button>
      </div>

      {/* Images */}
      <div>
        <h3 className="font-semibold mb-4 text-gray-800">
          Destination Images
        </h3>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border p-3 rounded-xl mb-4 text-gray-800 text-lg font-semibold"
        />

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border"
              >
                <img
                  src={preview}
                  alt=""
                  className="w-full h-40 object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
      >
        {loading ? "Saving..." : "Create Destination"}
      </button>
    </form>
  );
}