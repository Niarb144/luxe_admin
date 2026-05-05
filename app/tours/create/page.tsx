"use client";

import { useState } from "react";
import Step1Basic from "../../../components/tour/Step1Basic";
import Step2Inclusions from "@/components/tour/Step2Inclusions";
import Step3Exclusions from "../../../components/tour/Step3Exclusions";
import Step4Itinerary from "@/components/tour/Step4Itinerary";
import Step5Images from "@/components/tour/Step5Images";
import Step6Route from "@/components/tour/Step6Route";
import { supabase } from "@/lib/supabase";

export default function CreateTourPage() {
  const [step, setStep] = useState(1);

  const [tourId, setTourId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    basic: {},
    inclusions: [] as string[],
    exclusions: [] as string[],
    itinerary: [] as any[],
    images: [] as File[],
    route: null as File | null,
  });

  

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-3xl mb-6">Create Tour</h1>

      {step === 1 && (
        <Step1Basic
          next={(data: any, id: string) => {
            setFormData((prev) => ({ ...prev, basic: data }));
            setTourId(id);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Inclusions
          tourId={tourId!}
          next={(data: string[]) => {
            setFormData((prev) => ({ ...prev, inclusions: data }));
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <Step3Exclusions
          tourId={tourId!}
          next={(data: string[]) => {
            setFormData((prev) => ({ ...prev, exclusions: data }));
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <Step4Itinerary
          tourId={tourId!}
          next={(data: any[]) => {
            setFormData((prev) => ({ ...prev, itinerary: data }));
            setStep(5);
          }}
        />
      )}

      {step === 5 && (
        <Step5Images
          tourId={tourId!}
          next={() => setStep(6)}
        />
      )}

      {step === 6 && (
        <Step6Route tourId={tourId!} />
      )}
    </div>
  );
}