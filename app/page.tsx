"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle2, Briefcase, BookOpen, CheckCircle } from "lucide-react";
import { DashboardDemo } from "@/components/TransferPathwayDemo";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import Image from "next/image";

const universities = [
  { name: "UC Berkeley", logo: "/ucblogo.png" },
  { name: "UCLA", logo: "/uclalogo.png" },
  { name: "UC San Diego", logo: "/ucsd.png" },
  { name: "UC Irvine", logo: "/uci.png" },
  { name: "UC Davis", logo: "/ucd.png" },
  { name: "UC Santa Barbara", logo: "/ucsb.png" },
  { name: "UC Riverside", logo: "/ucr.png" },
  { name: "UC Santa Cruz", logo: "/ucsc1.png" },
  { name: "UC Merced", logo: "/ucm1.png" },
];

const communityColleges = [
  { name: "Diablo Valley College", logo: "/dvc.png" },
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
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [isVisible]);
  return [ref, isVisible] as const;
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      <span className="text-lg font-bold text-foreground tracking-tight">
        Transfer<span className="text-[#82A7A6]">Pathway</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const [heroRef, heroVisible] = useScrollAnimation();
  const [universitiesRef, universitiesVisible] = useScrollAnimation();
  const [detailsRef, detailsVisible] = useScrollAnimation();
  const [checkRef, checkVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();
  const [ccRef, ccVisible] = useScrollAnimation();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden text-foreground">
      {/* HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <button
              onClick={() => scrollToSection("features")}
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("universities")}
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Universities
            </button>
            <Link
              href="/signin"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg bg-[#82A7A6] px-4 py-2 text-sm font-bold text-card shadow-sm transition-all hover:scale-105 active:scale-95 hover:shadow-md"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative pt-28 pb-6 px-6">
        <div className="mx-auto max-w-7xl">
          {/* Text centered above the demo */}
          <div
            className={`mx-auto max-w-2xl text-center mb-12 transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6]/40 bg-[#82A7A6]/5 px-3 py-1.5 text-xs font-medium text-[#82A7A6]">
                <Briefcase className="w-3.5 h-3.5 shrink-0" /> Transfer Planning
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6]/40 bg-[#82A7A6]/5 px-3 py-1.5 text-xs font-medium text-[#82A7A6]">
                <BookOpen className="w-3.5 h-3.5 shrink-0" /> UC Articulation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#82A7A6]/40 bg-[#82A7A6]/5 px-3 py-1.5 text-xs font-medium text-[#82A7A6]">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Customizable Plans
              </span>
            </div>
            <h1 className="mb-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground text-balance">
              The transfer blueprint{" "}
              <span className="text-[#82A7A6]">tailored to your goals.</span>
            </h1>
            <p className="mb-8 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto text-pretty">
              You should be spending your time studying, not planning. Let Transferpathway save you the work.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-xl bg-[#82A7A6] px-7 py-3.5 text-base font-bold text-card transition-all hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                Get started <ChevronRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => scrollToSection("features")}
                className="rounded-xl border-2 border-border px-7 py-3.5 text-base font-bold text-foreground hover:border-[#82A7A6] hover:text-[#82A7A6] transition-all"
              >
                Learn more
              </button>
            </div>
          </div>

          {/* THE DEMO — big, front-and-center */}
          <div
            className={`relative transition-all duration-1000 delay-300 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            {/* Laptop frame */}
            <div className="mx-auto max-w-5xl">
              <div className="rounded-t-2xl bg-[#1a1a2e] p-2 shadow-2xl border border-[#2a2a3e]/60">
                {/* Top bar with dots */}
                <div className="flex items-center gap-1.5 px-3 py-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <div className="ml-4 flex-1 rounded-md bg-[#2a2a3e] px-3 py-1 text-center">
                    <span className="text-[10px] text-[#666] font-mono">transferpathway.com/dashboard</span>
                  </div>
                </div>
                {/* Demo content */}
                <div className="rounded-lg overflow-hidden" style={{ height: "520px" }}>
                  <DashboardDemo />
                </div>
              </div>
              {/* Laptop base */}
              <div className="relative mx-auto w-[102%] -ml-[1%] h-4 bg-[#d4d4d8] rounded-b-xl shadow-lg">
                <div className="absolute inset-x-0 top-0 h-px bg-[#e4e4e7]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-2 bg-[#bbb] rounded-b-md" />
              </div>
            </div>
            {/* Ambient glow */}
            <div
              className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl opacity-30 blur-3xl"
              style={{ background: `radial-gradient(ellipse at center, #82A7A640, transparent 70%)` }}
            />
          </div>
        </div>
      </section>

      {/* UNIVERSITIES LOGOS */}
      <section
        id="universities"
        ref={universitiesRef}
        className="py-20 px-6 border-t border-border"
      >
        <div className="mx-auto max-w-6xl">
          <p
            className={`mb-10 text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground transition-all duration-700 ${
              universitiesVisible ? "opacity-100" : "opacity-0 translate-y-4"
            }`}
          >
            Featuring all UC&apos;s and soon to be more!
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 md:gap-x-14">
            {universities.map((uni, i) => (
              <div
                key={uni.name}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`flex items-center gap-2 transition-all cursor-default group duration-700 ${
                  universitiesVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                <div className="relative h-14 w-20 overflow-hidden grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <Image
                    src={uni.logo}
                    alt={`${uni.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-[#82A7A6] transition-colors duration-300 whitespace-nowrap">
                  {uni.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CC LOGOS */}
      <section
        id="community-colleges"
        ref={ccRef}
        className="py-20 px-6 border-t border-border"
      >
        <div className="mx-auto max-w-6xl">
          <p
            className={`mb-10 text-center text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground transition-all duration-700 ${
              ccVisible ? "opacity-100" : "opacity-0 translate-y-4"
            }`}
          >
            Current Community College Articulations
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 md:gap-x-14">
            {communityColleges.map((cc, i) => (
              <div
                key={cc.name}
                style={{ transitionDelay: `${i * 80}ms` }}
                className={`flex items-center gap-2 transition-all cursor-default group duration-700 ${
                  ccVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                <div className="relative h-14 w-20 overflow-hidden grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <Image
                    src={cc.logo}
                    alt={`${cc.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-[#82A7A6] transition-colors duration-300 whitespace-nowrap">
                  {cc.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" ref={detailsRef} className="py-24 px-6" style={{ backgroundColor: "#82A7A6" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div
              className={`transition-all duration-1000 ${
                detailsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight text-card text-balance">
                Built for{" "}
                <span className="text-amber-300">California</span>
                {" "}community college students
              </h2>
              <p className="text-lg text-card/90 leading-relaxed max-w-lg">
                TransferPathway simplifies the transfer process 
                by providing you with an interactive, customizable course roadmap tailored 
                to your specific target universities and majors. By tracking 
                critical milestones like IGETC requirements and utilizing articulation 
                data, TransferPathway eliminates the stress from course planning 
                and ensures you stay on track for a successful transfer.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Edge courses covered",
                "IGETC & Breadth requirements",
                "Customizable transfer pace",
                "Transfer admission insights",
                "Compare every dream school",
                "Clear roadmap of courses",
              ].map((text, i) => (
                <div
                  key={i}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className={`flex items-center gap-3 p-5 rounded-2xl bg-card border border-border transition-all duration-700 hover:shadow-md ${
                    detailsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                >
                  <CheckCircle2 size={20} className="text-[#82A7A6] shrink-0" />
                  <span className="font-semibold text-sm text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IS TRANSFERPATH FOR YOU */}
      <section ref={checkRef} className="py-24 px-6 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div
              className={`transition-all duration-1000 ${
                checkVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <h3 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.08] text-balance">
                Can Transfer<span className="text-[#82A7A6]">Pathway</span> help you?
              </h3>
            </div>
            <div
              className={`flex flex-col items-start transition-all duration-1000 delay-200 ${
                checkVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <p className="text-lg leading-relaxed text-muted-foreground mb-8 max-w-xl text-pretty">
                Navigating community college can be overwhelming. It&apos;s the
                one course you didn&apos;t realize was a prerequisite until the
                semester had already started. It&apos;s discovering, too late,
                that the university changed its articulation agreement, pushing
                your transfer date back an entire year. TransferPathway exists so
                your hard work never goes to waste.
              </p>
              <a
                href="/onboarding"
                className="group flex items-center gap-2 text-lg font-bold text-[#82A7A6] hover:opacity-70 transition-all"
              >
                Try it out
                <ChevronRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-28 px-6">
        <div
          className={`mx-auto max-w-4xl rounded-3xl p-14 text-center transition-all duration-1000 ${
            ctaVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ backgroundColor: "#B8D4D3" }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-5 text-balance">
            Start planning your transfer today
          </h2>
          <p className="text-lg text-foreground/70 mb-10 max-w-xl mx-auto font-medium text-pretty">
            Join a community of students who&apos;ve successfully transferred using
            TransferPathway.
          </p>
          <a
            href="/onboarding"
            className="inline-block rounded-2xl bg-[#82A7A6] px-10 py-4 text-lg font-bold text-card shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
          >
            Get started today
          </a>
          <p className="text-xs text-foreground/50 mt-6 font-semibold tracking-wider">
            TransferPathway does not guarantee admission, but assists in the course
            planning
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <span className="text-lg font-bold text-foreground text-center md:text-left">
              Transfer<span className="text-[#82A7A6]">Path</span>
            </span>
            <div className="flex justify-center gap-8 text-sm font-semibold text-muted-foreground">
              {/* <a href="https://discord.gg/BvuSNBep" className="hover:text-[#82A7A6] transition-colors">Discord</a> */}
              {/* <a href="#" className="hover:text-[#82A7A6] transition-colors">Instagram</a>
              <a href="#" className="hover:text-[#82A7A6] transition-colors">Twitter</a> */}
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center md:text-right">
              &copy; 2026 TransferPathway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

