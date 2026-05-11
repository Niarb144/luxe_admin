import DestinationForm from "@/components/destination/DestinationForm";

export default function CreateDestinationPage(){
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create Destination
      </h1>
      <DestinationForm />
    </div>
  );
}