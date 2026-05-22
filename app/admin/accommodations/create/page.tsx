"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddAccommodation() {
  const [loading, setLoading] = useState(false);

  const [amenities, setAmenities] = useState([""]);
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    hotel_name: "",
    country_location: "",
    description: "",
    map_url: "",
    classification: "Comfort",
  });

  async function uploadImages(files: FileList) {
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const filename =
        `${Date.now()}-${file.name}`;

      const { error } =
        await supabase.storage
          .from("accommodations")
          .upload(filename, file);

      if (error) {
        console.error(error);
        continue;
      }

      const { data } =
        supabase.storage
          .from("accommodations-images")
          .getPublicUrl(filename);

      uploadedUrls.push(
        data.publicUrl
      );
    }

    setImages(prev => [
      ...prev,
      ...uploadedUrls
    ]);
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const filteredAmenities =
      amenities.filter(
        amenity =>
          amenity.trim() !== ""
      );

    const { error } =
      await supabase
        .from("accommodations")
        .insert([{
          ...form,

          amenities:
            filteredAmenities,

          images
        }]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Accommodation added");

    setForm({
      hotel_name: "",
      country_location: "",
      description: "",
      map_url: "",
      classification: "Comfort",
    });

    setAmenities([""]);
    setImages([]);
  }

  return (

<form
onSubmit={handleSubmit}
className="space-y-5 max-w-2xl"
>

<input
placeholder="Hotel Name"
value={form.hotel_name}
onChange={(e)=>
setForm({
...form,
hotel_name:e.target.value
})
}
className="border p-3 w-full text-gray-700"
/>


<input
placeholder="Country"
value={form.country_location}
onChange={(e)=>
setForm({
...form,
country_location:e.target.value
})
}
className="border p-3 w-full text-gray-700"
/>


<textarea
placeholder="Description"

value={form.description}

onChange={(e)=>
setForm({
...form,
description:e.target.value
})
}

className="border p-3 w-full text-gray-700"
/>


<input
placeholder="Google Maps URL"

value={form.map_url}

onChange={(e)=>
setForm({
...form,
map_url:e.target.value
})
}

className="border p-3 w-full text-gray-700"
/>



<select

value={form.classification}

onChange={(e)=>
setForm({
...form,
classification:
e.target.value
})
}

className="border p-3 w-full text-gray-700"
>

<option>Economy</option>
<option>Comfort</option>
<option>Luxury</option>

</select>



{/* Amenities */}

<div>

<h3 className="font-semibold text-gray-700">

Amenities

</h3>


{amenities.map(
(amenity,index)=>(
<div
key={index}
className="flex gap-2 mb-2"
>

<input

value={amenity}

placeholder="Amenity"

onChange={(e)=>{

const updated =
[...amenities];

updated[index] =
e.target.value;

setAmenities(updated);

}}

className="border p-3 flex-1 text-gray-700"
/>


<button

type="button"

onClick={()=>

setAmenities(

amenities.filter(
(_,i)=>
i!==index
)

)

}

className="
bg-red-500
text-white
px-4
"

>

Remove

</button>

</div>

))}


<button

type="button"

onClick={()=>

setAmenities([
...amenities,
""
])

}

className="
bg-green-500
text-white
px-4
py-2
cursor-pointer
"

>

+ Add Amenity

</button>

</div>



{/* Images */}

<div>

<h3 className="font-semibold text-gray-700">

Upload Images

</h3>

<input

type="file"

multiple

accept="image/*"

onChange={(e)=>{

if(
e.target.files
){

uploadImages(
e.target.files
)

}

}}

className="w-full text-gray-700"
/>


<div
className="
grid
grid-cols-3
gap-3
mt-4
"
>

{images.map(
(img,index)=>(

<div
key={index}
className="relative"
>

<img
src={img}
className="
h-28
w-full
object-cover
rounded
"
/>

<button

type="button"

onClick={()=>{

setImages(
images.filter(
(_,i)=>
i!==index
)
)

}}

className="
absolute
top-1
right-1
bg-red-500
text-white
px-2
"

>

×

</button>

</div>

))

}

</div>

</div>



<button

disabled={loading}

className="
bg-black
text-white
px-6
py-3
cursor-pointer
"

>

{loading
? "Saving..."
: "Add Accommodation"}

</button>

</form>

  );
}