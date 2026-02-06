"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle2, Pencil, CheckSquare, Square, ChevronDown, LayoutDashboard, GraduationCap} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
      <span className="text-xl font-bold text-black tracking-tight">
        Transfer<span className="text-[#82A7A6]">Path</span>
      </span>
    </div>
  );
};

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
          <Logo />
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
        className="relative pt-32 pb-20 px-10 mt-10"
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
  className={`relative mx-auto max-w-6xl transition-all duration-1000 delay-200 ${
    heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
  }`}
  style={{
    transform: heroVisible
      ? `translateY(${scrollY * 0.02}px)`
      : "translateY(40px)",
  }}
>
  
  {/* 1. LAPTOP SCREEN/BEZEL */}
  <div className="relative rounded-[1.5rem] bg-[#0F172A] p-3 shadow-2xl border-[1px] border-slate-700">
    
    {/* Camera/Notch Area */}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#0F172A] rounded-b-xl z-20 flex justify-center items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
      <div className="w-1 h-1 rounded-full bg-blue-900/50" />
    </div>

    {/* The Dashboard Content (The Screen) */}
    <div className="relative bg-white rounded-xl overflow-hidden flex min-h-[600px] h-[700px]">
      
      {/* Left Sidebar */}
      <div className="w-52 border-r border-gray-100 p-6 flex flex-col justify-between shrink-0 bg-white">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Transfer<span className="text-[#82A7A6]">Path</span></h1>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
          <nav className="space-y-2 mt-8">
            <div className="flex items-center gap-3 bg-[#82A7A6]/15 text-[#82A7A6] px-3 py-2.5 rounded-lg font-semibold text-sm">
              <LayoutDashboard size={18} /> Dashboard
            </div>
            <div className="flex items-center gap-3 text-gray-400 px-3 py-2.5 font-semibold text-sm hover:text-gray-600 transition-colors cursor-pointer">
              <GraduationCap size={18} /> Universities
            </div>
          </nav>
        </div>
        <div className="text-red-500 font-semibold text-sm flex items-center gap-2 cursor-pointer mt-auto hover:text-red-600 transition-colors">
          Sign Out
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 bg-[#F9FBFA] p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome!</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500 text-sm">Here is your transfer plan</p>
              <span className="bg-[#D1E7E6] text-[#4A6B6A] text-[10px] px-2 py-0.5 rounded-md font-semibold">Saved to Cloud</span>
            </div>
          </div>
          <button className="bg-[#82A7A6] text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:bg-[#6d8d8c] transition-all">
            + Add Another University
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Expected Completion", val: "Summer 2028", icon: "📅" },
            { label: "Progress", val: "0%", icon: "📈" },
            { label: "Total Units", val: "52", icon: "🎯" },
            { label: "Your Current College", val: "Community College", icon: "" },
          ].map((card, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-xl font-bold text-slate-900">{card.val}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline and Sidebar Row */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Your Strategic Timeline</h3>
              <button className="flex items-center gap-2 bg-[#82A7A6] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#6d8d8c] transition-all">
                <Pencil size={14} /> Edit Plan
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30 flex flex-col h-full">
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <ChevronDown size={18} className="text-gray-400" />
                  <span className="font-bold text-slate-800 text-sm">Fall 2026</span>
                  <span className="text-gray-400 text-xs">· 15 Units</span>
                </div>
                <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white" />
              </div>
              
              <div className="divide-y divide-gray-100 bg-white flex-1 overflow-y-auto">
                {[
                  { code: 'CHEM-120', title: 'General Chemistry I', units: '3', tags: ['UCB', 'UCLA'] },
                  { code: 'MATH-192', title: 'Calculus I', units: '4', tags: ['UCB', 'UCSD', 'UCD', '+2 more'] },
                  { code: 'ENGL-C1000', title: 'Academic Reading and Writing', units: '3', tags: ['UCB', 'UCD', 'UCLA', '+1 more'] },
                  { code: 'COMSC-140', title: 'Python Programming', units: '3', tags: ['UCB'] },
                  { code: 'PHYS-129', title: 'Mechanics', units: '3', tags: ['UCB', 'UCLA', 'UCSD'] }
                ].map((course) => (
                  <div key={course.code} className="px-4 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                     <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{course.code}</span>
                          {course.tags.map((tag, i) => (
                            <span key={i} className={`${tag.startsWith('+') ? 'bg-gray-200 text-gray-600' : 'bg-[#82A7A6] text-white'} text-[9px] px-1.5 py-0.5 rounded font-bold uppercase`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{course.title}</p>
                     </div>
                     <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">{course.units} UNITS</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-72 space-y-3 shrink-0">
            <div className="bg-[#82A7A6] rounded-2xl p-5 text-white">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2 font-bold text-sm">
                   <CheckSquare size={16}/> IGETC
                 </div>
                 <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-md text-[10px] font-bold">
                   3/7 <ChevronRight size={12}/>
                 </div>
              </div>
            </div>
            
            <div className="bg-[#82A7A6] rounded-2xl p-5 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckSquare size={16}/> 7-Course Pattern
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-md text-[10px] font-bold">
                  1/5 <ChevronRight size={12}/>
                </div>
              </div>
            </div>

            <div className="bg-[#82A7A6] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 font-bold text-sm mb-3">
                <span className="text-lg">📅</span> Important Deadlines
              </div>
              <p className="text-xs text-white/60 italic text-center py-4">No deadlines added</p>
              <button className="w-full mt-2 text-xs font-semibold text-white/80 hover:text-white transition-colors">
                + Add New Deadline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* 2. LAPTOP BASE */}
  <div className="relative w-[104%] -left-[2%] h-4 bg-slate-300 rounded-b-2xl shadow-xl">
    <div className="absolute top-0 inset-x-0 h-[2px] bg-white/30" />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 bg-slate-400/50 rounded-b-lg" />
  </div>
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
            Featuring all UC's and more!
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
