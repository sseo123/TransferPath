"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboardingData } from "./actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    college: "",
    major: "",
    dreamUni: "",
    startSeason: "fall",
    startYear: "" as number | string,
    ack1: false,
    ack2: false,
    ack3: false,
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const isStepComplete = () => {
    if (step === 1) return formData.college !== "";
    if (step === 2) {
      const yearStr = formData.startYear.toString();
      return yearStr.length === 4 && !isNaN(Number(formData.startYear));
    }
    if (step === 3) return formData.ack1 && formData.ack2 && formData.ack3;
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
          await saveOnboardingData({
            ...formData,
            startYear: Number(formData.startYear),
          });
          router.push("/signup");
        } catch (error) {
          console.error("Failed to save onboarding data:", error);
          setIsSubmitting(false);
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[var(--background)] flex flex-col relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-7">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold text-black dark:text-white tracking-tight cursor-pointer"
          >
            Transfer<span className="text-[#82A7A6]">Path</span>
          </h1>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button
              onClick={() => router.push("/signin")}
              className="text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-transform hover:scale-105 active:scale-95"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100 dark:bg-slate-800">
          <div
            className="h-full bg-[#82A7A6] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-32 px-6">
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-10 shadow-sm">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                Which Community College <br /> do you attend?
              </h2>
              <select
                className="w-full border border-gray-200 dark:border-slate-600 rounded-lg p-4 outline-none focus:border-[#82A7A6] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                When are you starting?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-center -mt-4 text-sm">
                We&apos;ll build your plan starting from your <strong>first semester</strong>.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Season
                  </label>
                  <select
                    value={formData.startSeason}
                    onChange={(e) =>
                      setFormData({ ...formData, startSeason: e.target.value })
                    }
                    className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-[#82A7A6] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="fall">Fall</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Year
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2999}
                    placeholder={`e.g. ${new Date().getFullYear()}`}
                    value={formData.startYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startYear: e.target.value ? parseInt(e.target.value) : "",
                      })
                    }
                    className="w-full p-4 border border-gray-200 dark:border-slate-600 rounded-lg outline-none focus:border-[#82A7A6] bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                Before We Begin
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-center -mt-4 text-sm">
                Please acknowledge the following to proceed.
              </p>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.ack1}
                    onChange={(e) => setFormData({ ...formData, ack1: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#82A7A6] focus:ring-[#82A7A6]"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    I acknowledge that this tool is not a replacement for meeting with a counselor.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.ack2}
                    onChange={(e) => setFormData({ ...formData, ack2: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#82A7A6] focus:ring-[#82A7A6]"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    I understand that this tool may contain errors and may not accurately reflect courses that officially articulate.
                  </span>
                </label>

                <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.ack3}
                    onChange={(e) => setFormData({ ...formData, ack3: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#82A7A6] focus:ring-[#82A7A6]"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    I understand that the accuracy of this tool depends on the accuracy of the input provided by the user.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 p-6">
        <div className="max-w-[500px] mx-auto flex justify-between">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-8 py-3 border border-gray-200 dark:border-slate-600 rounded-xl disabled:opacity-0 transition-opacity text-slate-700 dark:text-slate-300"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepComplete() || isSubmitting}
            className={`px-8 py-3 font-bold rounded-xl transition-all ${
              isStepComplete() && !isSubmitting
                ? "bg-[#82A7A6] text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed"
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
