"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
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

function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  return [ref, isVisible] as const;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  // Animation Refs
  const [heroRef, heroVisible] = useScrollAnimation();
  const [universitiesRef, universitiesVisible] = useScrollAnimation();
  const [detailsRef, detailsVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();
  const [checkRef, checkVisible] = useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => router.push("/onboarding");
  const handleSignIn = () => router.push("/signin");

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-slate-900">
      {/* 1. KEEPING YOUR HEADBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-5">
          <h1
            onClick={() => router.push("/")}
            className="text-xl font-bold text-black tracking-tight cursor-pointer"
          >
            Transfer<span className="text-[#82A7A6]">Path</span>
          </h1>
          <div className="flex items-center gap-8">
            <button
              onClick={handleSignIn}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-transform hover:scale-105 active:scale-95"
            >
              Sign in
            </button>
            <button
              onClick={handleGetStarted}
              className="rounded-lg bg-[#82A7A6] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH PAGE STRUCTURE & LAPTOP */}
      <section
        className="relative pt-32 pb-20 px-10"
        style={{
          background:
            "linear-gradient(0deg, rgba(130, 167, 166, 0.15) 0%, rgba(255, 255, 255, 1) 50%)",
        }}
      >
        <div className="mx-auto max-w-[1440px]">
          <div
            ref={heroRef}
            className={`text-center max-w-4xl mx-auto mb-16 transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h2 className="mb-8 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight text-gray-900">
              The transfer blueprint
              <br />
              <span className="text-[#82A7A6]">tailored to your goals.</span>
            </h2>
            <p className="mb-10 max-w-2xl mx-auto text-xl leading-relaxed text-gray-500">
              Never miss a hidden requirement or lose a year to a planning
              mistake
              <br />
              - let TransferPath save you the work
              <br />
            </p>

            <div className="mb-8 flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-[#82A7A6]/50 bg-white shadow-sm"
              />
              <button
                onClick={handleGetStarted}
                className="rounded-xl bg-[#82A7A6] px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
              >
                Get started
              </button>
            </div>
          </div>

          {/* THE LAPTOP MOCKUP (REPLICATING DASHBOARD) */}
          <div
            className={`relative mx-auto max-w-5xl transition-all duration-1000 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
            style={{
              transform: heroVisible
                ? `translateY(${scrollY * 0.02}px)`
                : "translateY(40px)",
            }}
          >
            <div className="relative bg-slate-900 rounded-t-2xl p-2 shadow-2xl border-x border-t border-slate-700">
              {/* Window Controls */}
              <div className="flex gap-1.5 mb-2 px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>

              {/* Screen Content */}
              <div className="bg-[#F8F9FA] rounded-lg overflow-hidden border border-slate-200 aspect-[16/10] relative">
                <div className="absolute inset-0 p-6 overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Welcome!
                      </h2>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        Here is your transfer plan
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <button className="px-5 py-2 bg-[#82A7A6] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#6d8d8c] transition-colors">
                        Edit Plan
                      </button>
                      <button className="text-xs font-bold text-slate-900 hover:text-slate-600">
                        Sign Out
                      </button>
                    </div>
                  </div>
                  {/* Top Row: Stats Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      {
                        label: "Expected Completion",
                        val: "Fall 2027",
                      },
                      { label: "Progress", val: "14%" },
                      { label: "Total Units", val: "65" },
                    ].map((card, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col justify-between h-24"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-sm">
                            {card.val}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                          {card.label}
                        </p>
                      </div>
                    ))}
                    {/* Quote Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col justify-center h-24 relative overflow-hidden">
                      <span className="absolute top-1 left-2 text-red-400 text-xs"></span>
                      <p className="text-[8px] text-slate-600 italic leading-tight px-1">
                        &quot;Success is not final, failure is not fatal: it is
                        the courage to continue that counts.&quot;
                      </p>
                      <p className="text-[7px] text-slate-400 mt-1 self-end">
                        — Winston Churchill
                      </p>
                    </div>
                  </div>

                  {/* Main Layout: Timeline & Sidebar */}
                  <div className="flex gap-4 items-start ">
                    {/* Timeline Area */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-slate-800">
                          Your Strategic Timeline
                        </h3>
                        <button className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                          Add Term
                        </button>
                      </div>

                      {/* Spring 2026 Semester */}
                      <div className="rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50/50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <ChevronRight
                              size={12}
                              className="text-slate-400 rotate-90"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              Spring 2026
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium ml-2">
                              12 Units
                            </span>
                          </div>
                          <div className="w-3.5 h-3.5 rounded border border-slate-300" />
                        </div>

                        <div className="p-2 space-y-1">
                          {/* Course: COMSC-110 */}
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div>
                              <div className="text-[10px] font-black text-slate-800">
                                COMSC-110
                              </div>
                              <div className="text-[8px] text-slate-400">
                                Intro to Programming
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                UCB
                              </span>
                              <span className="text-[9px] font-black text-slate-800">
                                4 UNITS
                              </span>
                            </div>
                          </div>

                          {/* Course: ENGL-122 */}
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-50">
                            <div>
                              <div className="text-[10px] font-black text-slate-800">
                                ENGL-122
                              </div>
                              <div className="text-[8px] text-slate-400">
                                English Composition
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                UCB
                              </span>
                              <span className="text-[9px] font-black text-slate-800">
                                3 UNITS
                              </span>
                            </div>
                          </div>

                          {/* Course: MATH-192 */}
                          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-t border-slate-50">
                            <div>
                              <div className="text-[10px] font-black text-slate-800">
                                MATH-192
                              </div>
                              <div className="text-[8px] text-slate-400">
                                Calculus I
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <span className="text-[7px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                  UCLA
                                </span>
                                <span className="text-[7px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                  UCSD
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-slate-800">
                                5 UNITS
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-white opacity-50 overflow-hidden">
                        <div className="px-5 py-4 flex justify-between items-center bg-slate-50/10">
                          <div className="flex items-center gap-3">
                            <ChevronRight
                              size={14}
                              className="text-slate-300"
                            />
                            <span className="text-sm font-bold text-slate-400 line-through">
                              Summer 2026
                            </span>
                            <span className="text-xs text-slate-300 font-medium ml-2 italic">
                              9 Units
                            </span>
                          </div>
                          <div className="text-[#82A7A6]">✓</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar: Remaining Unscheduled */}
                    <div className="w-52 flex flex-col gap-4">
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xs mt-0.5">⚠️</span>
                          <div>
                            <h4 className="text-[10px] font-black text-slate-800 leading-tight">
                              Remaining Unscheduled Courses
                            </h4>
                            <p className="text-[8px] text-slate-400 mt-1">
                              2 courses not yet scheduled
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-700">
                              MATH-292
                            </span>
                            <span className="text-[7px] text-slate-400 font-bold">
                              5 units
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-700">
                              ENGL-C1000
                            </span>
                            <span className="text-[7px] text-slate-400 font-bold">
                              3 units
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base */}
            <div
              className="relative h-3 bg-slate-300 rounded-b-xl mx-auto shadow-inner"
              style={{ width: "105%", marginLeft: "-2.5%" }}
            />
          </div>
        </div>
      </section>

      {/* 3. KEEPING YOUR UNIVERSITIES SECTION WITH ANIMATION */}
      <div
        ref={universitiesRef}
        className="mx-auto max-w-8xl px-10 md:px-20 bg-white"
      >
        <section className="py-24">
          <p
            className={`mb-12 text-center text-2xl font-bold uppercase tracking-[0.3em] text-black transition-all duration-700 ${universitiesVisible ? "opacity-100" : "opacity-0 translate-y-4"}`}
          >
            Featuring 50+ universities
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-10 md:gap-x-20">
            {universities.map((uni, i) => (
              <div
                key={uni.name}
                style={{ transitionDelay: `${i * 100}ms` }}
                className={`flex items-center transition-all cursor-default group duration-700 ${universitiesVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              >
                <div className="relative h-20 w-32 overflow-hidden grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <Image
                    src={uni.logo}
                    alt={`${uni.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-400 group-hover:text-[#82A7A6] transition-colors duration-300 whitespace-nowrap">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. BUILT FOR CALIFORNIA STUDENTS SECTION */}
      <section ref={detailsRef} className="py-24 px-10 bg-[#FAF9F6]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-1000 ${detailsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <h2 className="text-5xl font-bold mb-6 leading-tight text-gray-900">
                Built for <span className="text-[#82A7A6]">California</span>
                <br />
                community college
                <br />
                students
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                Navigate the complex UC, CSU, and private university transfer
                requirements with trustworthy course planning and real-time
                articulation data.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "ASSIST.org integration",
                "IGETC & Breadth requirments",
                "Customizable transfer pace",
                "Transfer admission insights",
                "Compare every dream school",
                "Edge courses covered",
              ].map((text, i) => (
                <div
                  key={i}
                  style={{ transitionDelay: `${i * 150}ms` }}
                  className={`flex items-center gap-3 p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-700 hover:shadow-md ${detailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                  <CheckCircle2 size={24} className="text-[#82A7A6]" />
                  <span className="font-bold text-gray-700">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEEPING YOUR "SEE IF TRANSFERPATH IS FOR YOU" SECTION */}
      <section
        ref={checkRef}
        className="bg-[#f8fafc] py-24 border-t border-gray-50"
      >
        <div className="mx-auto max-w-[1440px] px-10 md:px-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-1000 ${checkVisible ? "opacity-100" : "opacity-0"}`}
            >
              <h3 className="text-5xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                See if Transfer<span className="text-[#82A7A6]">Path</span>
                <br />
                is for you
              </h3>
            </div>
            <div
              className={`flex flex-col items-start transition-all duration-1000 delay-200 ${checkVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <p className="text-xl leading-relaxed text-gray-600 mb-8 max-w-xl">
                Navigating community college can be overwhelming. It&apos;s the
                one course you didn&apos;t realize was a prerequisite until the
                semester had already started. It&apos;s discovering, too late,
                that the university changed its articulation agreement, pushing
                your transfer date back an entire year. It&apos;s the crushing
                realization that you&apos;ve spent months on a class that
                doesn&apos;t even transfer to your top choice. TransferPath
                exists so your hard work never goes to waste.
              </p>
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-2 text-lg font-bold text-[#82A7A6] hover:opacity-70 transition-all"
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

      {/* 6. START PLANNING YOUR TRANSFER TODAY (CTA) SECTION */}
      <section ref={ctaRef} className="py-32 px-10">
        <div
          className={`mx-auto max-w-5xl rounded-[3rem] bg-[#B8D4D3] p-16 text-center transition-all duration-1000 ${ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Start planning your transfer today
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of students who&quot;ve successfully transferred
            using TransferPath.
          </p>
          <button
            onClick={handleGetStarted}
            className="rounded-2xl bg-[#82A7A6] px-12 py-5 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            Get started today!
          </button>
          <p className="text-xs text-gray-600 mt-6 font-semibold tracking-wider">
            TransferPath does not guarantee admission, but assists in the course
            planning
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-16 bg-white">
        <div className="mx-auto max-w-8xl px-10 md:px-20">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-3">
            <h1 className="text-2xl font-bold text-black text-center md:text-left">
              Transfer<span className="text-[#82A7A6]">Path</span>
            </h1>
            <div className="flex justify-center gap-10 text-sm font-bold text-gray-400">
              <a href="#" className="hover:text-[#82A7A6] transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-[#82A7A6] transition-colors">
                Instagram
              </a>
              <a href="#" className="hover:text-[#82A7A6] transition-colors">
                Twitter
              </a>
            </div>
            <p className="text-sm font-medium text-gray-400 text-center md:text-right">
              © 2025 TransferPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
