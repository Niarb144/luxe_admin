"use client";

import { useState } from "react";
import { addTourGallery } from "@/actions/createTour";
import ImageUpload from "./ImageUploader";

export default function GalleryForm({ tourId, onNext }: any) {
  const [images, setImages] = useState<string[]>([]);

  const addImage = (url: string) => {
    setImages([...images, url]);
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    await addTourGallery(tourId, images);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload onUpload={addImage} />

      <div className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <img key={i} src={img} className="rounded" />
        ))}
      </div>

      <button className="bg-black text-white px-4 py-2">
        Next
      </button>
    </form>
  );
}