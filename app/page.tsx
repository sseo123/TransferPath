"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle2, Briefcase, BookOpen, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TransferPathDemo } from "@/components/TransferPathDemo";

const universities = [
  { name: "UC Berkeley", logo: "/ucblogo.png" },
  { name: "UCLA", logo: "/uclalogo.png" },
  // { name: "Columbia University", logo: "/columbiaa.png" },
  // { name: "Stanford", logo: "/stanford.png" },
  // { name: "Cornell", logo: "/corn.png" },
  { name: "UC San Diego", logo: "/ucsd.png" },
  { name: "UC Irvine", logo: "/uci.png" },
  { name: "UC Davis", logo: "/ucd.png" },
  { name: "UC Santa Barbara", logo: "/ucsb.png" },
  { name: "UC Riverside", logo: "/ucr.png" },
  { name: "UC Santa Cruz", logo: "/ucsc1.png" },
  { name: "UC Merced", logo: "/ucm1.png" },
  // { name: "SJSU", logo: "/sjsu.png" },
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

const Logo = () => {
  const handleRefresh = () => {
    window.location.href = "/";
  };

  return (
    <div 
      onClick={handleRefresh} 
      className="flex items-center gap-2.5 cursor-pointer group select-none"
    >
      <div className="relative w-9 h-9 border-[2.5px] border-[#82A7A6] rounded-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#82A7A6" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 translate-y-[-1px]"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <div className="absolute bottom-1.5 w-4 h-[2.5px] bg-[#82A7A6] rounded-full" />
      </div>
      <span className="text-xl font-bold text-black dark:text-white tracking-tight">
        Transfer<span className="text-[#82A7A6]">Path</span>
      </span>
    </div>
  );
};

export default function App() {
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)] font-sans overflow-x-hidden text-slate-900 dark:text-slate-100">
      {/* 1. HEADER WITH THEME TOGGLE */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-5">
          <Logo />
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button
              onClick={handleSignIn}
              className="text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-transform hover:scale-105 active:scale-95"
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

      {/* 2. HERO SECTION: TWO-COLUMN LAYOUT */}
      <section
        ref={heroRef}
        className="relative pt-28 pb-24 px-6 sm:px-8 md:px-10 mt-8 bg-gradient-to-b from-[rgba(130,167,166,0.12)] to-white dark:from-[rgba(130,167,166,0.06)] dark:to-[var(--background)]"
      >
        <div className="mx-auto max-w-[1280px] px-0">
          <div className="grid lg:grid-cols-[0.42fr_0.58fr] gap-14 lg:gap-20 items-center min-h-0">
            {/* LEFT: Pills, headline, description, CTAs */}
            <div
              className={`max-w-[540px] transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="flex flex-wrap gap-2.5 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6] px-4 py-2 text-sm font-medium text-[#82A7A6]">
                  <Briefcase className="w-4 h-4 shrink-0" /> Transfer Planning
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6] px-4 py-2 text-sm font-medium text-[#82A7A6]">
                  <BookOpen className="w-4 h-4 shrink-0" /> UC Articulation
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6] px-4 py-2 text-sm font-medium text-[#82A7A6]">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Real-time Requirements
                </span>
              </div>
              <h2 className="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
                The transfer blueprint{" "}
                <span className="text-[#82A7A6]">tailored to your goals.</span>
              </h2>
              <p className="mb-8 max-w-[32rem] text-base sm:text-lg leading-relaxed text-gray-500 dark:text-slate-400">
                Never miss a hidden requirement or lose a year to a planning mistake—let TransferPath save you the work.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#82A7A6] px-7 py-3.5 text-base font-bold text-white transition-all hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  Get started <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection("universities")}
                  className="rounded-xl border-2 border-gray-300 dark:border-slate-600 px-7 py-3.5 text-base font-bold text-gray-700 dark:text-slate-300 hover:border-[#82A7A6] hover:text-[#82A7A6] transition-all"
                >
                  Learn more
                </button>
              </div>
            </div>

            {/* RIGHT: Laptop mockup */}
            <div
              className={`relative transition-all duration-1000 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
              style={{
                transform: heroVisible
                  ? `translateY(${scrollY * 0.02}px)`
                  : "translateY(40px)",
              }}
            >
{/* THE LAPTOP MOCKUP (REPLICATING DASHBOARD) */}
<div className="max-w-full">
  
  {/* 1. LAPTOP SCREEN/BEZEL */}
  <div className="relative rounded-[1.5rem] bg-[#0F172A] p-3 shadow-2xl border-[1px] border-slate-700">
    
    {/* Camera/Notch Area */}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F172A] rounded-b-xl z-20 flex justify-center items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
      <div className="w-1 h-1 rounded-full bg-blue-900/50" />
    </div>

    {/* The Dashboard Content (The Screen) - AutoPlanSimulation */}
    <div className="relative rounded-xl overflow-hidden flex min-h-[600px] h-[700px]">
      <TransferPathDemo />
    </div>
  </div>

  {/* 2. LAPTOP BASE */}
  <div className="relative w-[104%] -left-[2%] h-4 bg-slate-300 rounded-b-2xl shadow-xl">
    <div className="absolute top-0 inset-x-0 h-[2px] bg-white/30" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 bg-slate-400/50 rounded-b-lg" />
  </div>
</div>
            </div>
          </div>
        </div>
      </section>


      {/* 3. KEEPING YOUR UNIVERSITIES SECTION WITH ANIMATION */}
      <div
        id="universities"
        ref={universitiesRef}
        className="mx-auto max-w-8xl px-10 md:px-20 bg-white dark:bg-[var(--background)]"
      >
        <section className="py-24">
          <p
            className={`mb-12 text-center text-2xl font-bold uppercase tracking-[0.3em] text-black transition-all duration-700 ${universitiesVisible ? "opacity-100" : "opacity-0 translate-y-4"}`}
          >
            Featuring all UC&apos;s and more!
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
      <section ref={detailsRef} className="py-24 px-10 bg-[#82A7A6]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className={`transition-all duration-1000 ${detailsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <h2 className="text-5xl font-bold mb-6 leading-tight text-white">
                Built for <span className="text-yellow-300">California</span>
                <br />
                community college
                <br />
                students
              </h2>
              <p className="text-xl text-white leading-relaxed max-w-lg">
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
            Join hundreds of students who&apos;ve successfully transfered
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
