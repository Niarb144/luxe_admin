"use client";

import { useState } from "react";
import BasicInfoForm from "./components/BasicInfoForm";
import GalleryForm from "./components/GalleryForm";
// import IncludesForm from "./components/IncludesForm";
// import ItineraryForm from "./components/ItineraryForm";

export default function CreateTourPage() {
  const [step, setStep] = useState(1);
  const [tourId, setTourId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Tour</h1>

      {step === 1 && (
        <BasicInfoForm
          onSuccess={(id: string) => {
            setTourId(id);
            setStep(2);
          }}
        />
      )}

      {step === 2 && tourId && (
        <GalleryForm
          tourId={tourId}
          onNext={() => setStep(3)}
        />
      )}

      {/* {step === 3 && tourId && (
        <IncludesForm
          tourId={tourId}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && tourId && (
        <ItineraryForm tourId={tourId} />
      )} */}
    </div>
  );
}