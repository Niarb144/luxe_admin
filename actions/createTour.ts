"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js/dist/index.cjs";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// 1. Create Tour
export async function createTourBasic(data: any) {
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

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
        user_id: user.id, // ✅ REQUIRED
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return tour;
}

// 2. Gallery
export async function addTourGallery(tourId: string, images: string[]) {
  if (!images?.length) return;

  const supabase = await getSupabase();

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
  const supabase = await getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  if (inclusions?.length) {
    const { error } = await supabase.from("tour_inclusions").insert(
      inclusions.map((item) => ({
        tour_id: tourId,
        item,
        user_id: user.id,
      }))
    );

    if (error) throw error;
  }

  if (exclusions?.length) {
    const { error } = await supabase.from("tour_exclusions").insert(
      exclusions.map((item) => ({
        tour_id: tourId,
        item,
        user_id: user.id,
      }))
    );

    if (error) throw error;
  }
}

// 4. Itinerary
export async function addTourItinerary(tourId: string, itinerary: any[]) {
  if (!itinerary?.length) return;

  const supabase = await getSupabase();

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