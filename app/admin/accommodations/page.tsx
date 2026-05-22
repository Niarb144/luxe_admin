import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default async function Hotels() {

const { data } =
await supabase
.from("accommodations")
.select("*");

return (

<div className="max-w-7xl mx-auto px-6 py-10">

<Link
href="/admin/accommodations/create"

className="
inline-block
mb-8
px-5
py-3
bg-amber-500
hover:bg-amber-600
font-semibold
rounded-lg
"
>

Add Accommodation

</Link>



<div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-8
">

{data?.map((hotel)=>(

<div

key={hotel.id}

className="
bg-white
rounded-xl
shadow-md
overflow-hidden
border
"

>


{/* IMAGE GALLERY */}

<div className="
flex
overflow-x-auto
gap-2
p-2
bg-gray-100
">

{hotel.images?.length ? (

hotel.images.map(
(img:string,index:number)=>(

<Image

key={index}

src={img}

alt={hotel.hotel_name}

width={300}
height={200}

className="
h-40
w-60
object-cover
rounded
flex-shrink-0
"
/>

))

) : (

<div className="
h-40
w-full
flex
items-center
justify-center
bg-gray-200
text-gray-500
">

No Images

</div>

)}

</div>



<div className="p-5">

<h2 className="
text-2xl
font-bold
">

{hotel.hotel_name}

</h2>


<p className="
text-gray-500
mb-2
">

{hotel.country_location}

</p>



<span className={`
inline-block
px-3
py-1
rounded-full
text-sm
font-medium
mb-4

${
hotel.classification==="Luxury"
? "bg-yellow-100 text-yellow-700"

: hotel.classification==="Comfort"
? "bg-green-100 text-green-700"

: "bg-gray-200 text-gray-700"

}
`}>

{hotel.classification}

</span>



<p className="
text-gray-700
mb-5
">

{hotel.description}

</p>



{/* AMENITIES */}

<div className="mb-5">

<h3 className="
font-semibold
mb-2
">

Amenities

</h3>

<div className="
flex
flex-wrap
gap-2
">

{hotel.amenities?.length ? (

hotel.amenities.map(
(amenity:string)=>(
<span

key={amenity}

className="
px-3
py-1
bg-amber-100
text-amber-700
rounded-full
text-sm
"

>

{amenity}

</span>
))

) : (

<p>No amenities listed</p>

)}

</div>

</div>



{/* MAP */}

{hotel.map_url && (

<a

href={hotel.map_url}

target="_blank"

className="
inline-block
px-4
py-2
bg-black
text-white
rounded-lg
hover:bg-gray-800
"

>

View Location

</a>

)}

</div>

</div>

))}

</div>

</div>

)

}