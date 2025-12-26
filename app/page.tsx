"use client";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const universities = [
  { name: "UC Berkeley", logo: "/ucblogo.png" },
  { name: "UCLA", logo: "/uclalogo.png" },
  { name: "Columbia University", logo: "/columbiaa.png" },
  { name: "Stanford", logo: "/stanford.png" },
  { name: "Cornell", logo: "/corn.png" },
  { name: "UCSD", logo: "/ucsd.png" },
  { name: "UC Irvine", logo: "/uci.png" },
  { name: "UC Davis", logo: "/ucd.png" },
  { name: "UCSB", logo: "/ucsb.png" },
  { name: "SJSU", logo: "/sjsu.png" },
];

export default function App() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Navigation handler for all Get Started buttons
  const handleGetStarted = () => {
    router.push("/signup");
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100">
      {/* 1. FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-5">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold text-[#303AB2] tracking-tight cursor-pointer"
          >
            TransferPath
          </h1>
          <div className="flex items-center gap-8">
            <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </button>
            <button
              onClick={handleGetStarted}
              className="rounded-lg bg-[#303AB2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section
        className="relative flex min-h-screen w-full items-center border-b border-gray-100"
        style={{
          background:
            "linear-gradient(0deg, hsla(235, 26.50%, 44.30%, 0.30) 0%, rgba(255, 255, 255, 1) 50%)",
          backgroundColor: "white",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-10 md:px-5">
          <div className="grid md:grid-cols-2 items-center gap-12">
            <div className="relative z-10 pt-20">
              <h2 className="mb-8 text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight text-gray-900">
                The transfer blueprint
                <br />
                tailored to your goals.
              </h2>

              <div className="ml-1">
                <p className="mb-10 max-w-lg text-xl leading-relaxed text-gray-500">
                  Automated course sequencing, planning, transferring, and more
                  — let TransferPath handle the planning.
                </p>

                <div className="mb-8 flex max-w-md gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-[#303AB2]/50 bg-white shadow-sm"
                  />
                  <button
                    onClick={handleGetStarted}
                    className="rounded-xl bg-[#303AB2] px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Get started
                  </button>
                </div>
              </div>

              <button className="flex items-center gap-2 font-bold text-[#303AB2] hover:opacity-80 transition-opacity">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current pl-0.5 text-[10px]">
                  ▶
                </span>
                See TransferPath in action
              </button>
            </div>

            <div className="hidden md:flex items-center justify-center relative w-full h-[400px] pr-10">
              <div className="relative w-120 flex items-center justify-center">
                <Image
                  src="/dashboardpic.png"
                  alt="Transfer Dashboard Preview"
                  width={700}
                  height={500}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-300 hidden md:block">
          <ChevronRight size={24} className="rotate-90" />
        </div>
      </section>

      {/* 3. University Section */}
      <div className="mx-auto max-w-8xl px-10 md:px-20 bg-[#f0f0f2]">
        <section className="py-24">
          <p className="mb-12 text-center text-2xl font-bold uppercase tracking-[0.3em] text-black">
            Transfer to 50+ universities
          </p>

          <div className="flex flex-wrap justify-center gap-x-10 gap-y-10 md:gap-x-20">
            {universities.map((uni) => (
              <div
                key={uni.name}
                className="flex items-center transition-all cursor-default group"
              >
                <div className="relative h-20 w-32 overflow-hidden grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <Image
                    src={uni.logo}
                    alt={`${uni.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-400 group-hover:text-[#303AB2] transition-colors duration-300 whitespace-nowrap">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Founder's Message Section */}
      <section className="bg-white py-24 border-t border-gray-50">
        <div className="mx-auto max-w-[1440px] px-10 md:px-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                See if TransferPath
                <br />
                is for you.
              </h3>
            </div>

            <div className="flex flex-col items-start">
              <p className="text-xl leading-relaxed text-gray-600 mb-8 max-w-xl">
                Navigating community college can be overwhelming, from figuring
                out which courses transfer to managing extracurriculars that
                strengthen a university application. TransferPath simplifies the
                process by helping students plan their coursework, track
                requirements, and stay on top of opportunities.
              </p>
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 text-lg font-bold text-[#303AB2] hover:opacity-70 transition-all"
              >
                Try it out
                <ChevronRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Process Section */}
      <section className="w-full bg-[#b7c0e8] py-32 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-10 md:px-20">
          <h3 className="mb-20 text-center text-4xl font-extrabold text-gray-900">
            Your Transfer Path in 5 Minutes
          </h3>

          <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:items-start md:gap-4 mb-20">
            {[
              { num: 1, text: "Build your profile" },
              { num: 2, text: "Create a FREE account" },
              { num: 3, text: "Generate your transfer path" },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center group w-64">
                  <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2.5rem] border border-blue-100 bg-white text-[#303AB2] shadow-sm group-hover:shadow-md transition-all duration-300">
                    <span className="text-3xl font-black">{step.num}</span>
                  </div>
                  <p className="text-xl font-bold leading-tight text-gray-900 px-4">
                    {step.text}
                  </p>
                </div>

                {i < 2 && (
                  <div className="hidden md:flex h-28 items-center justify-center">
                    <ChevronRight
                      size={48}
                      strokeWidth={3}
                      className="text-white opacity-90"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="rounded-xl bg-[#303AB2] px-12 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
            >
              Get started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16">
        <div className="mx-auto max-w-8xl px-10 md:px-20">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">
            <div className="flex justify-center md:justify-start">
              <h1 className="text-2xl font-bold text-[#303AB2]">
                TransferPath
              </h1>
            </div>

            <div className="flex justify-center gap-10 text-sm font-bold text-gray-400">
              <a href="#" className="hover:text-[#303AB2] transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-[#303AB2] transition-colors">
                Instagram
              </a>
              <a href="#" className="hover:text-[#303AB2] transition-colors">
                Twitter
              </a>
            </div>

            <div className="flex justify-center md:justify-end text-sm font-medium text-gray-400">
              <p>© 2025 TransferPath. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
