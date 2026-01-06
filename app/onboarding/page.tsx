"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    college: "",
    major: "",
    dreamUni: "",
    edge: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const isStepComplete = () => {
    if (step === 1) return formData.college !== "";
    if (step === 2) return formData.major !== "";
    if (step === 3) return formData.dreamUni !== "";
    if (step === 4) return formData.edge !== "";
    return false;
  };

  const handleNext = () => {
    if (isStepComplete()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        // Encode data and redirect to signup page
        const queryData = btoa(JSON.stringify(formData));
        router.push(`/signup?data=${queryData}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-5">
          <div
            className="text-xl font-bold text-[#303AB2] cursor-pointer"
            onClick={() => router.push("/")}
          >
            TransferPath
          </div>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg"
          >
            Sign in
          </button>
        </div>
        <div className="w-full h-1 bg-gray-100">
          <div
            className="h-full bg-[#303AB2] transition-all duration-500"
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
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#303AB2]"
                onChange={(e) =>
                  setFormData({ ...formData, college: e.target.value })
                }
                value={formData.college}
              >
                <option value="">Select a college</option>
                <option value="dvc">Diablo Valley College</option>
                {/* <option value="smc">Santa Monica College</option> */}
              </select>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                What&apos;s your field of study?
              </h2>
              <select
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#303AB2]"
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
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#303AB2]"
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
          )}
          {/* Steps 2 and 3 omitted for brevity, identical to your original logic */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-center">
                Select your transfer pace
              </h2>
              <div className="flex flex-col gap-3">
                {["speed", "gpa", "balance"].map((id) => (
                  <button
                    key={id}
                    onClick={() => setFormData({ ...formData, edge: id })}
                    className={`p-4 border-2 rounded-xl text-left ${
                      formData.edge === id
                        ? "border-[#303AB2] bg-blue-50"
                        : "border-gray-100"
                    }`}
                  >
                    <span className="font-bold capitalize">{id}</span>
                  </button>
                ))}
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
            className="px-8 py-3 border rounded-xl disabled:opacity-0"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`px-8 py-3 font-bold rounded-xl ${
              isStepComplete()
                ? "bg-[#303AB2] text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step === totalSteps ? "Finish & Sign Up" : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}
