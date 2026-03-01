"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Pencil,
  CalendarDays,
  Printer,
  Plus,
} from "lucide-react";

const TEAL = "#82A7A6";

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  tags: string[];
}

const FALL_COURSES: Course[] = [
  { id: "math1a", code: "MATH 1A", title: "Calculus I", units: 4, tags: ["UCB", "UCLA"] },
  { id: "cs61a", code: "CS 61A", title: "Intro to Computer Science", units: 4, tags: ["UCB"] },
  { id: "engl1a", code: "ENGL 1A", title: "English Composition", units: 3, tags: ["UCB", "UCLA"] },
];

const SPRING_COURSES: Course[] = [
  { id: "phys7a", code: "PHYS 7A", title: "Physics for Scientists", units: 4, tags: ["UCB", "UCLA"] },
  { id: "math1b", code: "MATH 1B", title: "Calculus II", units: 4, tags: ["UCB"] },
];

const IGETC_ITEMS = [
  { id: "eng", label: "English Communication" },
  { id: "math", label: "Math & Quantitative Reasoning" },
  { id: "arts", label: "Arts and Humanities" },
  { id: "social", label: "Social & Behavioral Sciences" },
  { id: "sci", label: "Physical & Biological Sciences" },
];

const IGETC_AREAS = [
  "English Communication",
  "Mathematical Concepts and Quantitative Reasoning",
  "Arts and Humanities",
  "Social and Behavioral Sciences",
  "Physical and Biological Sciences",
  "Language Other than English",
];

const CAL_DAYS = [
  [null, null, null, null, null, 1, 2],
  [3, 4, 5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, null, null],
];

type Phase =
  | "idle"
  | "select-university"
  | "select-major"
  | "scanning"
  | "building-plan"
  | "plan-ready"
  | "drag-course"
  | "drag-done"
  | "check-igetc"
  | "complete"
  | "fading"
  | "static";

/* ── inline typing hook (used inside overlays) ── */
function useTypingText(text: string, speed = 50) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

/* ── Static dashboard (matches screenshot) ── */
function StaticDashboard() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#0f1117] text-sm">
      {/* SIDEBAR */}
      <aside className="flex w-[200px] shrink-0 flex-col border-r border-[#e5e7eb] dark:border-[#1e2230] bg-white dark:bg-[#0f1117]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e5e7eb] dark:border-[#1e2230]">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            Transfer<span style={{ color: TEAL }}>Path</span>
          </span>
          <button className="flex h-6 w-6 items-center justify-center rounded border border-[#e5e7eb] dark:border-[#2a2a3e] text-gray-400">
            <ChevronRight className="h-3 w-3 rotate-180" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2 pt-3">
          <div
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: TEAL }}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </div>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <GraduationCap className="h-4 w-4 shrink-0" />
            Universities
          </div>
        </nav>
        {/* Mini calendar */}
        <div className="mx-2 mt-4 rounded-xl border border-[#e5e7eb] dark:border-[#1e2230] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">February 2026</span>
            <div className="flex gap-1 items-center">
              <button className="text-gray-400 text-[10px]">‹</button>
              <button className="text-gray-400 text-[10px]">›</button>
              <CalendarDays className="h-3 w-3 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-semibold text-gray-400 pb-1">{d}</div>
            ))}
            {CAL_DAYS.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] mx-auto font-medium ${
                    day === 26 ? "text-white font-bold" : day ? "text-gray-600 dark:text-gray-300" : ""
                  }`}
                  style={day === 26 ? { backgroundColor: TEAL } : {}}
                >
                  {day || ""}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mx-2 mt-3 px-1">
          <p className="text-[10px] font-bold text-gray-700 dark:text-gray-200 mb-1">Upcoming Tasks</p>
          <p className="text-[10px] text-gray-400">No upcoming tasks</p>
        </div>
        <div className="mt-auto flex items-center gap-2 border-t border-[#e5e7eb] dark:border-[#1e2230] px-3 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: TEAL }}>
            N
          </div>
          <span className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">shawnseo123@gmail....</span>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0f1117]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#e5e7eb] dark:border-[#1e2230]">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome, First!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Here is your transfer plan</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                Saved to Cloud
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 rounded-xl border border-[#e5e7eb] dark:border-[#2a2a3e] bg-white dark:bg-[#1a1a2e] px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
              <Printer className="h-3 w-3" /> Counselor View
            </button>
            <button className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm" style={{ backgroundColor: TEAL }}>
              <Plus className="h-3 w-3" /> Add Another University
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-2 px-5 py-3">
          {[
            { icon: "📅", label: "Expected Completion", value: "Spring 2028", big: true },
            { icon: "📈", label: "Progress", value: "0%" },
            { icon: "🎯", label: "Total Units", value: "78" },
            { icon: "🏫", label: "Your Current College", value: "Diablo Valley College", big: true },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl border border-[#e5e7eb] dark:border-[#1e2230] bg-white dark:bg-[#1a1a2e] p-3 shadow-sm">
              <span className="text-sm">{card.icon}</span>
              <p className={`font-extrabold text-gray-900 dark:text-white leading-tight mt-1 ${card.big ? "text-sm" : "text-lg"}`}>
                {card.value}
              </p>
              <p className="mt-0.5 text-[9px] text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline + IGETC */}
        <div className="flex flex-1 gap-2 overflow-hidden px-5 pb-4 min-h-0">
          {/* Timeline */}
          <div className="flex flex-1 flex-col rounded-2xl overflow-hidden" style={{ backgroundColor: TEAL }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <h2 className="text-sm font-bold text-white">Your Strategic Timeline</h2>
              <button className="flex items-center gap-1 rounded-xl border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white">
                <Pencil className="h-3 w-3" /> Edit Plan
              </button>
            </div>
            <p className="px-4 pb-2 text-[10px] text-white/80">
              Always feel free to double-check your course articulations on{" "}
              <span className="font-bold underline decoration-white/50">assist.org</span>
            </p>
            <div className="mx-3 mb-3 rounded-2xl bg-white dark:bg-[#1a1a2e] p-3 flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-2 border-b border-[#e5e7eb] dark:border-[#2a2a3e] pb-2">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-bold text-xs text-gray-900 dark:text-white">Fall 2026</span>
                  <span className="text-[10px] text-gray-400">16 Units</span>
                </div>
                <div className="h-3.5 w-3.5 rounded border-2 border-gray-300 dark:border-gray-600" />
              </div>
              {[
                { code: "MATH-192", title: "Calculus I", units: 5, tags: ["UCSD", "UCLA", "UCD", "+1 more"] },
                { code: "COMSC-110", title: "Introduction to Programming", units: 4, tags: ["UCSD", "UCLA", "UCD"] },
              ].map((course, i) => (
                <div key={i} className="mb-2 pb-2 border-b border-[#f0f0f0] dark:border-[#2a2a3e] last:border-0 last:mb-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white">{course.code}</span>
                        {course.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${tag.startsWith("+") ? "bg-gray-100 dark:bg-gray-700 text-gray-500" : "text-white"}`}
                            style={!tag.startsWith("+") ? { backgroundColor: TEAL } : {}}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{course.title}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{course.units} UNITS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IGETC */}
          <div className="w-40 shrink-0 flex flex-col">
            <div className="flex items-center justify-between rounded-t-2xl px-3 py-2.5" style={{ backgroundColor: TEAL }}>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">IGETC</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-white/80" />
            </div>
            <div className="flex flex-col border border-t-0 border-[#e5e7eb] dark:border-[#1e2230] rounded-b-2xl overflow-hidden bg-white dark:bg-[#1a1a2e]">
              {IGETC_AREAS.map((area, i) => (
                <div key={i} className="px-3 py-2 border-b border-[#f3f4f6] dark:border-[#2a2a3e] last:border-0">
                  <p className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 leading-snug">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Animation sub-components ── */
function CourseCard({ course, highlight = false }: { course: Course; highlight?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
        highlight ? "border-[#82A7A6] bg-[#82A7A6]/5 shadow-[0_0_0_2px_rgba(130,167,166,0.25)]" : "border-border bg-card"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{course.code}</span>
          <div className="flex gap-1">
            {course.tags.map((t) => (
              <span key={t} className="rounded px-1.5 py-0.5 text-[9px] font-bold text-card" style={{ backgroundColor: TEAL }}>{t}</span>
            ))}
          </div>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{course.title}</p>
      </div>
      <span className="ml-2 shrink-0 text-[11px] font-bold text-muted-foreground">{course.units} UNITS</span>
    </motion.div>
  );
}

function SemesterColumn({ title, courses, isDropTarget = false }: { title: string; courses: Course[]; isDropTarget?: boolean }) {
  const totalUnits = courses.reduce((s, c) => s + c.units, 0);
  return (
    <div className={`flex flex-1 flex-col rounded-2xl border-2 bg-card p-3 transition-all ${isDropTarget ? "border-[#82A7A6] bg-[#82A7A6]/5" : "border-border"}`}>
      <div className="mb-2.5 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">{title}</span>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">{totalUnits} Units</span>
      </div>
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IgetcSidebar({ checkedIds }: { checkedIds: Set<string> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4" style={{ color: TEAL }} />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">IGETC Checklist</h4>
      </div>
      <ul className="flex flex-col gap-2">
        {IGETC_ITEMS.map((item) => {
          const checked = checkedIds.has(item.id);
          return (
            <motion.li key={item.id} className="flex items-start gap-2" animate={{ scale: checked ? [1, 1.04, 1] : 1 }} transition={{ duration: 0.3 }}>
              {checked
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: TEAL }} />
                : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-border" />}
              <span className={`text-[11px] leading-snug ${checked ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function StepIndicator({ phase }: { phase: Phase }) {
  const steps = [
    { key: "select", label: "Select Schools" },
    { key: "build", label: "Build Plan" },
    { key: "customize", label: "Customize" },
    { key: "verify", label: "Verify" },
  ];
  const phaseToStep: Record<string, string> = {
    idle: "", "select-university": "select", "select-major": "select",
    scanning: "build", "building-plan": "build", "plan-ready": "build",
    "drag-course": "customize", "drag-done": "customize",
    "check-igetc": "verify", complete: "verify", fading: "verify", static: "verify",
  };
  const order = ["select", "build", "customize", "verify"];
  const currentIdx = order.indexOf(phaseToStep[phase] || "");

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => {
        const stepIdx = order.indexOf(step.key);
        const state = stepIdx < currentIdx ? "done" : stepIdx === currentIdx ? "active" : "pending";
        return (
          <div key={step.key} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full transition-all duration-500 ${state === "done" ? "bg-[#82A7A6]" : state === "active" ? "bg-[#82A7A6] ring-4 ring-[#82A7A6]/20" : "bg-border"}`} />
              <span className={`text-[10px] font-semibold transition-colors ${state === "active" ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-4 transition-colors ${state === "done" ? "bg-[#82A7A6]" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── University overlay ── */
function UniversityOverlay() {
  const text = useTypingText("UC Berkeley");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-foreground/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h3 className="mb-1 text-sm font-bold text-foreground">Select a University</h3>
        <p className="mb-4 text-[11px] text-muted-foreground">Choose your target transfer school</p>
        <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {text}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="ml-px">|</motion.span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-lg border-2 border-[#82A7A6] bg-[#82A7A6]/10 px-3 py-2">
            <span className="text-xs font-semibold text-foreground">UC Berkeley</span>
            <CheckCircle2 className="ml-auto h-4 w-4" style={{ color: TEAL }} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="text-xs text-muted-foreground">UCLA</span></div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="text-xs text-muted-foreground">UC San Diego</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Major overlay ── */
function MajorOverlay() {
  const text = useTypingText("Computer Science, B.A.", 40);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-foreground/30 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="w-full max-w-xs rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <h3 className="mb-1 text-sm font-bold text-foreground">Select a Major</h3>
        <p className="mb-4 text-[11px] text-muted-foreground">What will you study at UC Berkeley?</p>
        <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {text}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="ml-px">|</motion.span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-lg border-2 border-[#82A7A6] bg-[#82A7A6]/10 px-3 py-2">
            <span className="text-xs font-semibold text-foreground">Computer Science, B.A.</span>
            <CheckCircle2 className="ml-auto h-4 w-4" style={{ color: TEAL }} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="text-xs text-muted-foreground">Data Science, B.A.</span></div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="text-xs text-muted-foreground">Electrical Engineering, B.S.</span></div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main export ── */
export function DashboardDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fallCourses, setFallCourses] = useState<Course[]>([]);
  const [springCourses, setSpringCourses] = useState<Course[]>([]);
  const [igetcChecked, setIgetcChecked] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState(0);
  const [draggingCourse, setDraggingCourse] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setFallCourses([]);
    setSpringCourses([]);
    setIgetcChecked(new Set());
    setScanProgress(0);
    setDraggingCourse(null);
  }, []);

  /* Runs once, then fades to static dashboard */
  useEffect(() => {
    reset();
    const schedule: { at: number; fn: () => void }[] = [
      { at: 800,   fn: () => setPhase("select-university") },
      { at: 3000,  fn: () => setPhase("select-major") },
      { at: 5200,  fn: () => setPhase("scanning") },
      { at: 5400,  fn: () => setScanProgress(15) },
      { at: 5800,  fn: () => setScanProgress(40) },
      { at: 6200,  fn: () => setScanProgress(65) },
      { at: 6600,  fn: () => setScanProgress(88) },
      { at: 7000,  fn: () => setScanProgress(100) },
      { at: 7300,  fn: () => setPhase("building-plan") },
      { at: 7500,  fn: () => setFallCourses(FALL_COURSES.slice(0, 1)) },
      { at: 7900,  fn: () => setFallCourses(FALL_COURSES.slice(0, 2)) },
      { at: 8300,  fn: () => setFallCourses(FALL_COURSES.slice(0, 3)) },
      { at: 8700,  fn: () => setSpringCourses(SPRING_COURSES.slice(0, 1)) },
      { at: 9100,  fn: () => setSpringCourses(SPRING_COURSES.slice(0, 2)) },
      { at: 9800,  fn: () => setPhase("plan-ready") },
      { at: 10800, fn: () => { setPhase("drag-course"); setDraggingCourse("engl1a"); } },
      { at: 12200, fn: () => {
          setDraggingCourse(null);
          setFallCourses((c) => c.filter((x) => x.id !== "engl1a"));
          setSpringCourses((c) => [FALL_COURSES[2], ...c]);
          setPhase("drag-done");
        }
      },
      { at: 13200, fn: () => { setPhase("check-igetc"); setIgetcChecked(new Set(["eng"])); } },
      { at: 13800, fn: () => setIgetcChecked(new Set(["eng", "math"])) },
      { at: 14400, fn: () => setIgetcChecked(new Set(["eng", "math", "sci"])) },
      { at: 15400, fn: () => setPhase("complete") },
      { at: 17500, fn: () => setPhase("fading") },
      { at: 18800, fn: () => setPhase("static") },
    ];
    const timeouts = schedule.map(({ at, fn }) => setTimeout(fn, at));
    return () => timeouts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const MOVED_COURSE = FALL_COURSES[2];

  if (phase === "static") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="h-full w-full">
        <StaticDashboard />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: 1.2 }}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background/80 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#82A7A6]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#82A7A6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-sm font-bold text-foreground">Transfer<span style={{ color: TEAL }}>Path</span></span>
        </div>
        <StepIndicator phase={phase} />
      </div>

      {/* Body */}
      <div className="relative flex flex-1 min-h-0">
        {/* Mini sidebar */}
        <div className="hidden md:flex w-14 shrink-0 flex-col items-center gap-3 border-r border-border bg-muted/50 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${TEAL}15`, color: TEAL }}>
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-1 flex-col p-4 min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Welcome, Alex!</h3>
              <p className="text-[11px] text-muted-foreground">Here is your transfer plan</p>
            </div>
            <AnimatePresence>
              {["plan-ready","drag-course","drag-done","check-igetc","complete"].includes(phase) && (
                <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  Saved to Cloud
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Summary cards */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <AnimatePresence>
              {!["idle","select-university","select-major"].includes(phase) && (
                <>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground">Target</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">UC Berkeley</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground">Total Units</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {fallCourses.reduce((s, c) => s + c.units, 0) + springCourses.reduce((s, c) => s + c.units, 0)}
                    </p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground">Completion</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">Spring 2028</p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Semester columns */}
          <div className="relative flex flex-1 gap-3 min-h-0">
            <SemesterColumn
              title="Fall 2026"
              courses={phase === "drag-course" ? fallCourses.filter((c) => c.id !== "engl1a") : fallCourses}
            />

            {/* Floating drag card */}
            <AnimatePresence>
              {phase === "drag-course" && draggingCourse && (
                <motion.div
                  initial={{ opacity: 1, x: "-50%", y: "0%", scale: 1 }}
                  animate={{ opacity: 1, x: "50%", y: "20%", scale: 1.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 150, damping: 18 }}
                  className="absolute left-1/4 top-1/3 z-20 w-[40%]"
                >
                  <div className="rounded-xl border-2 border-[#82A7A6] bg-card px-3 py-2.5 shadow-xl ring-4 ring-[#82A7A6]/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{MOVED_COURSE.code}</span>
                          {MOVED_COURSE.tags.map((t) => (
                            <span key={t} className="rounded px-1.5 py-0.5 text-[9px] font-bold text-card" style={{ backgroundColor: TEAL }}>{t}</span>
                          ))}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{MOVED_COURSE.title}</p>
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground">{MOVED_COURSE.units} UNITS</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SemesterColumn
              title="Spring 2027"
              courses={springCourses}
              isDropTarget={phase === "drag-course"}
            />
          </div>
        </div>

        {/* IGETC sidebar */}
        <div className="hidden lg:block w-48 shrink-0 border-l border-border p-3">
          <IgetcSidebar checkedIds={igetcChecked} />
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {phase === "select-university" && <UniversityOverlay />}
      </AnimatePresence>
      <AnimatePresence>
        {phase === "select-major" && <MajorOverlay />}
      </AnimatePresence>

      {/* Scanning overlay */}
      <AnimatePresence>
        {phase === "scanning" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-foreground/30 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-xs rounded-2xl border border-border bg-card p-6 shadow-2xl text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${TEAL}15` }}>
                <Sparkles className="h-6 w-6" style={{ color: TEAL }} />
              </motion.div>
              <h3 className="mb-1 text-sm font-bold text-foreground">Analyzing Requirements</h3>
              <p className="mb-4 text-[11px] text-muted-foreground">Checking ASSIST.org articulations & IGETC...</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: TEAL }} animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-muted-foreground">{scanProgress}% complete</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete banner */}
      <AnimatePresence>
        {phase === "complete" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-4 left-4 right-4 z-30 flex items-center gap-3 rounded-xl px-5 py-3 text-card shadow-lg" style={{ backgroundColor: TEAL }}>
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <span className="text-sm font-bold">Transfer plan ready!</span>
              <p className="text-[11px] opacity-90">19 units across 2 semesters · 3 IGETC areas covered</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}