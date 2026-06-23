"use client";

import { useState } from "react";
import Step1Basic from "@/components/tour/Step1Basic";
import Step2Inclusions from "@/components/tour/Step2Inclusions";
import Step3Exclusions from "@/components/tour/Step3Exclusions";
import Step4Itinerary from "@/components/tour/Step4Itinerary";
import Step5Images from "@/components/tour/Step5Images";
import Step6Route from "@/components/tour/Step6Route";
import StepFAQs from "@/components/tour/Step7FAQ";
import Step8Highlights from "@/components/tour/Step8Highlights";

const STEPS = [
  { label: "Basics",     title: "Basic information"          },
  { label: "Inclusions", title: "What's included"            },
  { label: "Exclusions", title: "What's excluded"            },
  { label: "Itinerary",  title: "Day-by-day itinerary"       },
  { label: "Highlights", title: "Tour highlights"            },
  { label: "Images",     title: "Photo gallery"              },
  { label: "Route",      title: "Route map"                  },
  { label: "FAQs",       title: "Frequently asked questions" },
] as const;

export default function CreateTourPage() {
  const [step, setStep] = useState(1);
  // Track how far the user has legitimately progressed so we can
  // allow backward navigation only to steps they've already visited.
  const [furthestStep, setFurthestStep] = useState(1);

  const [tourId, setTourId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    basic: {},
    inclusions: [] as string[],
    exclusions: [] as string[],
    itinerary: [] as any[],
    images: [] as File[],
    route: null as File | null,
    faqs: [] as any[],
  });

  function goToStep(target: number) {
    // Can only jump to steps already visited, or the next available step.
    if (target < 1 || target > STEPS.length) return;
    if (target > furthestStep) return;
    setStep(target);
  }

  function advance() {
    const next = step + 1;
    if (next > STEPS.length) return;
    setStep(next);
    setFurthestStep((prev) => Math.max(prev, next));
  }

  const pct = Math.round((step / STEPS.length) * 100);

  return (
    <div className="min-h-screen text-white" style={{ background: "#fefefe" }}>

      {/* ── Top progress bar ── */}
      <div className="sticky top-0 z-50  backdrop-blur border-b border-white/5 px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* Percentage fill bar */}
          <div className="relative">
            <div className="h-1 rounded-full bg-white/10">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "#B98A3E" }}
              />
            </div>
            <span
              className="absolute right-0 -top-5 text-xs font-medium"
              style={{ color: "#B98A3E" }}
            >
              {pct}%
            </span>
          </div>

          {/* Step pills */}
          <div className="flex gap-1.5 flex-wrap">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const isDone   = num < step;
              const isActive = num === step;
              const isLocked = num > furthestStep;

              return (
                <button
                  key={num}
                  disabled={isLocked}
                  onClick={() => goToStep(num)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 bg-green-700 rounded-full text-xs transition-all",
                    isActive
                      ? "font-medium text-[#14201A] cursor-pointer"
                      : isDone
                      ? "border cursor-pointer"
                      : "border opacity-30 cursor-not-allowed",
                  ].join(" ")}
                  style={
                    isActive
                      ? { background: "#B98A3E" }
                      : isDone
                      ? {
                          borderColor: "rgba(185,138,62,0.4)",
                          background: "rgba(5, 87, 12, 0.23)",
                          color: "#B98A3E",
                        }
                      : {
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "rgba(244, 244, 244, 0.97)",
                        }
                  }
                >
                  {isDone ? (
                    <svg
                      width="10" height="10" viewBox="0 0 10 10"
                      fill="none" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="1.5,5 4,7.5 8.5,2.5" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-current text-gray-800" />
                  )}
                  {s.label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ── Step content ── */}
      {step === 1 && (
        <Step1Basic
          // Pass tourId so Step1Basic can switch into edit mode when coming back
          tourId={tourId}
          next={(data: any, id: string) => {
            setFormData((prev) => ({ ...prev, basic: data }));
            setTourId(id);
            advance();
          }}
        />
      )}

      {step === 2 && (
        <Step2Inclusions
          tourId={tourId!}
          next={(data: string[]) => {
            setFormData((prev) => ({ ...prev, inclusions: data }));
            advance();
          }}
          back={() => goToStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Exclusions
          tourId={tourId!}
          next={(data: string[]) => {
            setFormData((prev) => ({ ...prev, exclusions: data }));
            advance();
          }}
          back={() => goToStep(2)}
        />
      )}

      {step === 4 && (
        <Step4Itinerary
          tourId={tourId!}
          next={(data: any[]) => {
            setFormData((prev) => ({ ...prev, itinerary: data }));
            advance();
          }}
          back={() => goToStep(3)}
        />
      )}

      {step === 5 && (
        <Step8Highlights
          tourId={tourId!}
          next={() => advance()}
          back={() => goToStep(4)}
        />
      )}

      {step === 6 && (
        <Step5Images
          tourId={tourId!}
          next={() => advance()}
          back={() => goToStep(5)}
        />
      )}

      {step === 7 && (
        <Step6Route
          tourId={tourId!}
          next={() => advance()}
          back={() => goToStep(6)}
        />
      )}

      {step === 8 && (
        <StepFAQs
          tourId={tourId!}
          faqs={formData.faqs}
          setFaqs={(data: any[]) =>
            setFormData((prev) => ({ ...prev, faqs: data }))
          }
          back={() => goToStep(7)}
        />
      )}

    </div>
  );
}