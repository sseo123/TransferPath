"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "./actions";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    college: "",
    major: "",
    dreamUni: "",
    startSeason: "fall",
    startYear: new Date().getFullYear(),
  });

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const isStepComplete = () => {
    if (step === 1) return formData.college !== "";
    // if (step === 2) return formData.major !== "";
    // if (step === 3) return formData.dreamUni !== "";
    if (step === 2) return true;
    return false;
  };

  const handleNext = async () => {
    if (isStepComplete()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Security: Store data in secure httpOnly cookie instead of URL
        setIsSubmitting(true);
        try {
          await saveOnboardingData(formData);
          router.push("/signup");
        } catch (error) {
          console.error("Failed to save onboarding data:", error);
          setIsSubmitting(false);
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-7">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold text-black tracking-tight cursor-pointer"
          >
            Transfer<span className="text-[#82A7A6]">Path</span>
          </h1>

          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push("/signin")}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-transform hover:scale-105 active:scale-95"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100">
          <div
            className="h-full bg-[#82A7A6] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-32 px-6">
        <div className="w-full max-w-[500px] bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                Which Community College <br /> do you attend?
              </h2>
              <select
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#82A7A6] bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                value={formData.college}
              >
                <option value="">Select a college</option>
                <option value="Diablo Valley College">
                  Diablo Valley College
                </option>
              </select>
            </div>
          )}

          {/* {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                What&apos;s your field of study?
              </h2>
              <select
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#82A7A6] bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                value={formData.major}
              >
                <option value="">Select a major</option>
                <option value="computer_science">Computer Science</option>
                <option value="business">Business</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                Where is your TARGET university?
              </h2>
              <select
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#82A7A6] bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, dreamUni: e.target.value })
                }
                value={formData.dreamUni}
              >
                <option value="">Select target</option>
                <option value="UC Berkeley">UC Berkeley</option>
                <option value="UCLA">UCLA</option>
              </select>
            </div>
          )} */}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                When are you starting?
              </h2>
              <p className="text-slate-500 text-center -mt-4 text-sm">
                We&apos;ll build your plan starting from your first semester.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Season
                  </label>
                  <select
                    value={formData.startSeason}
                    onChange={(e) =>
                      setFormData({ ...formData, startSeason: e.target.value })
                    }
                    className="w-full p-4 border border-gray-200 rounded-lg outline-none focus:border-[#82A7A6] bg-white"
                  >
                    <option value="fall">Fall</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Year
                  </label>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startYear: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-4 border border-gray-200 rounded-lg outline-none focus:border-[#82A7A6]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-6">
        <div className="max-w-[500px] mx-auto flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-8 py-3 border rounded-xl disabled:opacity-0 transition-opacity"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepComplete() || isSubmitting}
            className={`px-8 py-3 font-bold rounded-xl transition-all ${
              isStepComplete() && !isSubmitting
                ? "bg-[#82A7A6] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting 
              ? "Loading..." 
              : step === totalSteps 
                ? "Finish & Sign Up" 
                : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}
