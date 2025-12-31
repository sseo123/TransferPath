"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap, Trophy, Heart } from "lucide-react";
import { signup } from "../signup/actions"; // We'll update this action next

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    college: "",
    major: "",
    dreamUni: "",
    edge: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const totalSteps = 4;
  const progress = (step / (totalSteps + 1)) * 100;

  const isStepComplete = () => {
    if (step === 1) return formData.college !== "";
    if (step === 2) return formData.major !== "";
    if (step === 3) return formData.dreamUni !== "";
    if (step === 4) return formData.edge !== "";
    return false;
  };

  const isSignupComplete = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.includes("@") &&
      formData.password.length >= 6
    );
  };

  const handleNext = () => {
    if (isStepComplete()) {
      if (step < totalSteps) setStep(step + 1);
      else setShowSignupModal(true);
    }
  };

  const handleFinalSignup = async () => {
    setIsPending(true);
    setError("");

    // Create standard FormData to reuse your existing signup action
    const data = new FormData();
    data.append("username", formData.email);
    data.append("password", formData.password);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("currentCollege", formData.college);
    data.append("major", formData.major);
    data.append("targetUni", formData.dreamUni);
    data.append("transferEdge", formData.edge);

    const result = await signup(null, data);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
    // Success will be handled by the 'redirect' inside signup action
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col relative overflow-hidden">
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 transition-all ${
          showSignupModal ? "blur-sm opacity-50" : ""
        }`}
      >
        <div className="flex items-center justify-between px-8 py-5">
          <div
            className="text-xl font-bold text-[#303AB2] cursor-pointer"
            onClick={() => router.push("/")}
          >
            TransferPath
          </div>
          <button
            onClick={() => router.push("/login")}
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

      {/* QUESTIONS BACKGROUND */}
      <main
        className={`flex-1 flex flex-col items-center justify-center pt-32 pb-32 px-6 transition-all duration-700 ${
          showSignupModal
            ? "blur-md scale-[0.98] opacity-40 pointer-events-none"
            : ""
        }`}
      >
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
                <option value="smc">Santa Monica College</option>
              </select>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-center">
                What&apos;s your intended major?
              </h2>
              <select
                className="w-full border border-gray-200 rounded-lg p-4 outline-none focus:border-[#303AB2]"
                onChange={(e) =>
                  setFormData({ ...formData, major: e.target.value })
                }
                value={formData.major}
              >
                <option value="">Select a major</option>
                <option value="eecs">EECS (B.S.)</option>
                <option value="computer_science">
                  Computer Science (B.A.)
                </option>
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

      {/* SIGNUP WALL MODAL */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/10" />
          <div className="w-full max-w-[440px] bg-white rounded-3xl p-10 shadow-2xl relative animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-center mb-6">
              Create your account
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  placeholder="First name"
                  className="border w-full p-3 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <input
                  placeholder="Last name"
                  className="border w-full p-3 rounded-xl"
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
              <input
                placeholder="Email"
                type="email"
                className="border w-full p-3 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                placeholder="Password"
                type="password"
                className="border w-full p-3 rounded-xl"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                onClick={handleFinalSignup}
                disabled={!isSignupComplete() || isPending}
                className="w-full bg-[#303AB2] text-white font-bold py-4 rounded-xl disabled:opacity-50"
              >
                {isPending ? "Generating Plan..." : "Show My Path"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTION BAR */}
      {!showSignupModal && (
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
              {step === totalSteps ? "Generate Plan" : "Continue"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
