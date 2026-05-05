import { supabase } from "@/lib/supabase";

export default function Step1Basic({ next }: any) {
  async function handleSubmit(e: any) {
    e.preventDefault();

    const form = new FormData(e.target);

    const { data: userData } = await supabase.auth.getUser();
    console.log("USER:", userData.user);

    const { data, error } = await supabase
      .from("tours")
      .insert({
        title: form.get("title"),
        description: form.get("description"),
        price: Number(form.get("price")),
      })
      .select()
      .single();

      console.log("NEW TOUR:", data);
      console.log("GENERATED ID:", data.id);

    if (error) {
      console.error(error);
      return;
    }

    next(form, data.id);
  }

  return (
    <>
    <h1>Step 1: Basic Information</h1>
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="title" placeholder="Title" className="input" />
      <textarea name="description" placeholder="Description" />
      <input name="price" type="number" placeholder="Price" />

      <button className="btn cursor-pointer">Next</button>
    </form>
    </>
    
  );
}