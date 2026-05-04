"use server";

import { supabase } from "@/lib/supabase";

// 1. Create Tour
export async function createTourBasic(data: any) {
  const { title, description, price, location, duration, mainImage } = data;

  const { data: tour, error } = await supabase
    .from("tours")
    .insert([
      {
        title,
        description,
        price,
        location,
        duration,
        main_image: mainImage,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("FULL ERROR:", error);
    throw error;
  }

  return tour; // contains id
}

// 2. Gallery
export async function addTourGallery(tourId: string, images: string[]) {
  if (!images?.length) return;

  const { error } = await supabase.from("tour_gallery").insert(
    images.map((img) => ({
      tour_id: tourId,
      image_url: img,
    }))
  );

  if (error) throw error;
}

// 3. Inclusions / Exclusions
export async function addTourExtras(
  tourId: string,
  inclusions: string[],
  exclusions: string[]
) {
  if (inclusions?.length) {
    await supabase.from("tour_inclusions").insert(
      inclusions.map((item) => ({
        tour_id: tourId,
        item,
      }))
    );
  }

  if (exclusions?.length) {
    await supabase.from("tour_exclusions").insert(
      exclusions.map((item) => ({
        tour_id: tourId,
        item,
      }))
    );
  }
}

// 4. Itinerary
export async function addTourItinerary(tourId: string, itinerary: any[]) {
  if (!itinerary?.length) return;

  const { error } = await supabase.from("tour_itinerary").insert(
    itinerary.map((day, index) => ({
      tour_id: tourId,
      title: day.title,
      description: day.description,
      sort_order: index,
    }))
  );

  if (error) throw error;
}