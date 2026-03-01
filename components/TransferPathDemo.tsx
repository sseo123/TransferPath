"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronDown, ChevronRight,
  GraduationCap, LayoutDashboard, BookOpen, Pencil,
  CalendarDays, Printer, Plus, CheckSquare, Square,
  Save, Trash2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#82A7A6";

const CAL_DAYS = [
  [null, null, null, null, null, null,    1],
  [   2,    3,    4,    5,    6,    7,    8],
  [   9,   10,   11,   12,   13,   14,   15],
  [  16,   17,   18,   19,   20,   21,   22],
  [  23,   24,   25,   26,   27,   28, null],
];

const IGETC_AREAS = [
  "English Communication",
  "Mathematical Concepts and Quantitative Reasoning",
  "Arts and Humanities",
  "Social and Behavioral Sciences",
  "Physical and Biological Sciences",
  "Language Other than English",
  "Ethnic Studies",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  tags: string[];
}

type Phase =
  | "idle"
  | "select-university"
  | "select-major"
  | "loading"
  | "courses-loading"
  | "dashboard-ready"
  | "click-edit"
  | "plan-editor"
  | "plan-drag"
  | "plan-drag-done"
  | "click-save"
  | "fade-back"
  | "final-dashboard"
  | "complete";

// ─── Course Data ──────────────────────────────────────────────────────────────

const FALL_COURSES: Course[] = [
  { id: "math1a", code: "MATH-192", title: "Calculus I",                  units: 5, tags: ["UCSD", "UCLA", "UCD"] },
  { id: "cs61a",  code: "COMSC-110", title: "Introduction to Programming", units: 4, tags: ["UCSD", "UCLA", "UCD"] },
  { id: "engl1a", code: "ENGL-122",  title: "English Composition",         units: 3, tags: ["UCB", "UCLA"] },
];

const SPRING_COURSES: Course[] = [
  { id: "phys7a", code: "PHYS-130", title: "Physics for Scientists", units: 4, tags: ["UCB", "UCLA"] },
  { id: "math1b", code: "MATH-193", title: "Calculus II",            units: 5, tags: ["UCSD", "UCLA"] },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypingText(text: string, active: boolean, speed = 50) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) { setDisplayed(""); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return displayed;
}

// ─── Animated Cursor ──────────────────────────────────────────────────────────

function DemoCursor({
  phase,
  editButtonRef,
  saveButtonRef,
  containerRef, // Added this prop
}: {
  phase: Phase;
  editButtonRef: React.RefObject<HTMLButtonElement | null>;
  saveButtonRef: React.RefObject<HTMLButtonElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>; // Added this type
}) {
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [clicking, setClicking] = useState(false);

  const isVisible = phase === "click-edit" || phase === "click-save";

  useEffect(() => {
    const buttonRef =
      phase === "click-edit" ? editButtonRef :
      phase === "click-save" ? saveButtonRef :
      null;

    // We need both the target button AND the relative container to do the math
    if (!buttonRef?.current || !containerRef?.current) return;

    const btnRect = buttonRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Subtract the container's offset to get the local coordinates
    setPos({
      left: (btnRect.left - containerRect.left) + (btnRect.width / 2),
      top:  (btnRect.top - containerRect.top) + (btnRect.height / 2),
    });
  }, [phase, editButtonRef, saveButtonRef, containerRef]);

  // Click animation logic remains the same...
  useEffect(() => {
    if (!isVisible) { setClicking(false); return; }
    const t1 = setTimeout(() => setClicking(true),  650);
    const t2 = setTimeout(() => setClicking(false), 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isVisible, phase]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{ x: "-2px", y: "-50px" }} 
          animate={{ left: pos.left, top: pos.top }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
        >
          <AnimatePresence>
            {clicking && (
              <motion.div
                key="ripple"
                initial={{ scale: 0.2, opacity: 0.55 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute rounded-full pointer-events-none"
                style={{ width: 24, height: 24, top: -4, left: -4, backgroundColor: TEAL }}
              />
            )}
          </AnimatePresence>

          <motion.svg
            animate={{ scale: clicking ? 0.8 : 1 }}
            transition={{ duration: 0.08 }}
            width="20" height="24" viewBox="0 0 20 24" fill="none"
            style={{ filter: "drop-shadow(0px 2px 5px rgba(0,0,0,0.4))" }}
          >
            <path
              d="M2 2L2 19L6.5 14L10 22L12.5 21L9 13L15 13L2 2Z"
              fill="white" stroke="#1a1a1a" strokeWidth="1.5"
              strokeLinejoin="round" strokeLinecap="round"
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { key: "select",    label: "Select Schools" },
  { key: "build",     label: "Build Plan"     },
  { key: "customize", label: "Customize"      },
  { key: "done",      label: "Done"           },
];

const PHASE_TO_STEP: Record<Phase, string> = {
  idle:              "",
  "select-university": "select",
  "select-major":      "select",
  loading:             "build",
  "courses-loading":   "build",
  "dashboard-ready":   "build",
  "click-edit":        "customize",
  "plan-editor":       "customize",
  "plan-drag":         "customize",
  "plan-drag-done":    "customize",
  "click-save":        "customize",
  "fade-back":         "done",
  "final-dashboard":   "done",
  complete:            "done",
};

function StepIndicator({ phase }: { phase: Phase }) {
  const order       = STEPS.map((s) => s.key);
  const currentIdx  = order.indexOf(PHASE_TO_STEP[phase] ?? "");

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((step, i) => {
        const idx   = order.indexOf(step.key);
        const state = idx < currentIdx ? "done" : idx === currentIdx ? "active" : "pending";
        return (
          <div key={step.key} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full transition-all duration-500 ${
                state === "done"   ? "bg-[#82A7A6]" :
                state === "active" ? "bg-[#82A7A6] ring-4 ring-[#82A7A6]/20" :
                "bg-border"
              }`} />
              <span className={`text-[10px] font-semibold transition-colors ${
                state === "active" ? "text-foreground" : "text-muted-foreground"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 transition-colors ${state === "done" ? "bg-[#82A7A6]" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView({
  fallCourses,
  springCourses,
  showCourses,
  igetcChecked,
  onEditClick,
  editHighlight,
  editButtonRef,
}: {
  fallCourses:    Course[];
  springCourses:  Course[];
  showCourses:    boolean;
  igetcChecked:   Set<string>;
  onEditClick?:   () => void;
  editHighlight?: boolean;
  editButtonRef:  React.RefObject<HTMLButtonElement | null>;
}) {
  const totalUnits =
    fallCourses.reduce((s, c) => s + c.units, 0) +
    springCourses.reduce((s, c) => s + c.units, 0);

  return (
    <div className="flex h-full w-full overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="flex w-[170px] shrink-0 flex-col border-r border-border bg-card">
        <div className="flex items-center justify-between px-3 pt-3 pb-2.5 border-b border-border">
          <span className="text-[13px] font-bold text-foreground">
            Transfer<span style={{ color: TEAL }}>Path</span>
          </span>
          <button className="flex h-5 w-5 items-center justify-center rounded border border-border text-muted-foreground">
            <ChevronRight className="h-2.5 w-2.5 rotate-180" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 pt-2.5">
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-card" style={{ backgroundColor: TEAL }}>
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
            Dashboard
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            Universities
          </div>
        </nav>

        {/* Mini calendar */}
        <div className="mx-2 mt-3 rounded-xl border border-border p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-foreground">February 2026</span>
            <div className="flex gap-0.5 items-center">
              <button className="text-muted-foreground text-[9px]">{"<"}</button>
              <button className="text-muted-foreground text-[9px]">{">"}</button>
              <CalendarDays className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-[8px] font-semibold text-muted-foreground pb-0.5">{d}</div>
            ))}
            {CAL_DAYS.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] mx-auto font-medium ${
                    day === 26 ? "text-card font-bold" : day ? "text-foreground" : ""
                  }`}
                  style={day === 26 ? { backgroundColor: TEAL } : {}}
                >
                  {day ?? ""}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mx-2 mt-2 px-1">
          <p className="text-[9px] font-bold text-foreground mb-0.5">Upcoming Tasks</p>
          <p className="text-[9px] text-muted-foreground">No upcoming tasks</p>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-border px-2.5 py-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-card" style={{ backgroundColor: TEAL }}>
            N
          </div>
          <span className="truncate text-[9px] font-medium text-muted-foreground">student@gmail…</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-3 pb-2.5 border-b border-border">
          <div>
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">Welcome, Student!</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground">Here is your transfer plan</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-600">
                Saved to Cloud
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1 text-[9px] font-semibold text-foreground shadow-sm">
              <Printer className="h-2.5 w-2.5" /> Counselor View
            </button>
            <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-bold text-card shadow-sm" style={{ backgroundColor: TEAL }}>
              <Plus className="h-2.5 w-2.5" /> Add Another University
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5 px-4 py-2.5">
          {[
            { label: "Expected Completion",  value: "Spring 2027" },
            { label: "Progress",             value: "0%" },
            { label: "Total Units",          value: showCourses ? `${totalUnits}` : "0" },
            { label: "Your Current College", value: "Diablo Valley College" },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <p className={`font-extrabold text-foreground leading-tight mt-0.5 ${i === 0 || i === 3 ? "text-[11px]" : "text-base"}`}>
                {card.value}
              </p>
              <p className="mt-0.5 text-[8px] text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline + IGETC */}
        <div className="flex flex-1 gap-1.5 overflow-hidden px-4 pb-3 min-h-0">
          {/* Timeline */}
          <div className="flex flex-1 flex-col rounded-2xl overflow-hidden" style={{ backgroundColor: TEAL }}>
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
              <h2 className="text-[12px] font-bold text-card">Your Strategic Timeline</h2>
              <motion.button
                ref={editButtonRef}
                animate={editHighlight ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    "0 0 0 0px rgba(255,255,255,0)",
                    "0 0 0 4px rgba(255,255,255,0.4)",
                    "0 0 0 0px rgba(255,255,255,0)",
                  ],
                } : {}}
                transition={editHighlight ? { duration: 0.8, repeat: 2 } : {}}
                onClick={onEditClick}
                className="flex items-center gap-1 rounded-lg border border-card/30 bg-card/10 px-2 py-0.5 text-[9px] font-semibold text-card"
              >
                <Pencil className="h-2.5 w-2.5" /> Edit Plan
              </motion.button>
            </div>
            <p className="px-3 pb-1.5 text-[9px] text-card/80">
              Always feel free to double-check your course articulations on{" "}
              <span className="font-bold underline decoration-card/50">assist.org</span>
            </p>

            <div className="mx-2.5 mb-2.5 rounded-xl bg-card p-2.5 flex-1 overflow-hidden">
              {showCourses ? (
                <>
                  {/* Fall semester */}
                  <div className="flex items-center justify-between mb-1.5 border-b border-border pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-[11px] text-foreground">Fall 2026</span>
                      <span className="text-[9px] text-muted-foreground">
                        {fallCourses.reduce((s, c) => s + c.units, 0)} Units
                      </span>
                    </div>
                    <div className="h-3 w-3 rounded border-2 border-muted-foreground/30" />
                  </div>
                  <AnimatePresence mode="popLayout">
                    {fallCourses.map((course) => (
                      <CourseRow key={course.id} course={course} />
                    ))}
                  </AnimatePresence>

                  {/* Spring semester */}
                  <div className="flex items-center justify-between mb-1.5 border-b border-border pb-1.5 mt-2.5">
                    <div className="flex items-center gap-1.5">
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      <span className="font-bold text-[11px] text-foreground">Spring 2027</span>
                      <span className="text-[9px] text-muted-foreground">
                        {springCourses.reduce((s, c) => s + c.units, 0)} Units
                      </span>
                    </div>
                    <div className="h-3 w-3 rounded border-2 border-muted-foreground/30" />
                  </div>
                  <AnimatePresence mode="popLayout">
                    {springCourses.map((course) => (
                      <CourseRow key={course.id} course={course} />
                    ))}
                  </AnimatePresence>
                </>
              ) : (
                <EmptyTimeline />
              )}
            </div>
          </div>

          {/* IGETC checklist */}
          <div className="w-[130px] shrink-0 flex flex-col">
            <div className="flex items-center justify-between rounded-t-xl px-2.5 py-2" style={{ backgroundColor: TEAL }}>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-card" />
                <span className="text-[10px] font-bold text-card">IGETC</span>
              </div>
              <span className="text-[8px] font-semibold text-card/80 bg-card/15 px-1 py-0.5 rounded">
                {igetcChecked.size}/{IGETC_AREAS.length}
              </span>
            </div>
            <div className="flex flex-col border border-t-0 border-border rounded-b-xl overflow-hidden bg-card flex-1">
              {IGETC_AREAS.map((area, i) => {
                const checked = igetcChecked.has(area);
                return (
                  <motion.div
                    key={i}
                    animate={checked ? {
                      backgroundColor: ["rgba(130,167,166,0)", "rgba(130,167,166,0.08)", "rgba(130,167,166,0)"],
                    } : {}}
                    transition={{ duration: 0.6 }}
                    className="px-2 py-1.5 border-b border-border/50 last:border-0 flex items-start gap-1.5"
                  >
                    {checked
                      ? <CheckSquare className="h-3 w-3 shrink-0 mt-0.5" style={{ color: TEAL }} />
                      : <Square      className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground/30" />
                    }
                    <p className={`text-[8px] font-semibold leading-snug ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                      {area}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helpers extracted for clarity
function CourseRow({ course }: { course: Course }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="mb-1.5 pb-1.5 border-b border-border/30 last:border-0 last:mb-0 last:pb-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[10px] font-bold text-foreground">{course.code}</span>
            {course.tags.map((tag, i) => (
              <span key={i} className="rounded px-1 py-0.5 text-[7px] font-bold text-card" style={{ backgroundColor: TEAL }}>
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground">{course.title}</p>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground">{course.units} UNITS</span>
      </div>
    </motion.div>
  );
}

function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-6">
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-2 text-muted-foreground/50">
        <GraduationCap className="h-5 w-5" />
      </div>
      <p className="text-[10px] font-semibold text-muted-foreground">No universities targeted yet</p>
      <p className="text-[9px] text-muted-foreground/70 mt-0.5 max-w-[140px]">
        Select your target colleges so we can build your requirements.
      </p>
    </div>
  );
}

// ─── Plan Editor View ─────────────────────────────────────────────────────────

function PlanEditorView({
  fallCourses,
  springCourses,
  dragPhase,
  saveButtonRef,
}: {
  fallCourses:    Course[];
  springCourses:  Course[];
  dragPhase:      "idle" | "dragging" | "done";
  saveButtonRef:  React.RefObject<HTMLButtonElement | null>;
}) {
  const MOVED_COURSE  = fallCourses.find((c) => c.id === "engl1a")!;
  const displayFall   = dragPhase !== "idle" ? fallCourses.filter((c) => c.id !== "engl1a") : fallCourses;
  const displaySpring = dragPhase === "done"  ? [MOVED_COURSE, ...springCourses] : springCourses;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden text-sm bg-background">
      <header className="flex items-center justify-between px-5 py-3 bg-card border-b border-border">
        <div>
          <h1 className="text-base font-black text-foreground">Course Planning</h1>
          <p className="text-[10px] text-muted-foreground">
            {"Draft your plan. Changes only save when you click \"Save Changes\"."}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            ref={saveButtonRef}
            animate={dragPhase === "done" ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: dragPhase === "done" ? 2 : 0 }}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded-lg shadow-sm"
          >
            <Save className="h-3 w-3" /> Save Changes
          </motion.button>
          <button className="px-3 py-1.5 bg-card border border-border text-foreground text-[10px] font-bold rounded-lg">
            Escape Edit Mode
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 p-4 min-h-0">
        {/* Course pool */}
        <div className="w-[150px] shrink-0 rounded-2xl border-2 border-border bg-card p-3">
          <h3 className="font-black text-foreground text-[11px] mb-2">Required Courses</h3>
          <div className="border-2 border-dashed border-border/50 rounded-xl h-20 flex items-center justify-center text-muted-foreground/50 text-[8px] font-medium text-center px-2">
            Deleted courses will appear here.
          </div>
        </div>

        {/* Semester columns */}
        <div className="flex flex-1 gap-3 min-h-0">
          {/* Fall 2026 */}
          <div className="flex-1 rounded-2xl border-2 border-border bg-card flex flex-col">
            <SemesterHeader title="Fall 2026" courses={displayFall} />
            <div className="p-2.5 flex-1 flex flex-col gap-1.5">
              <AnimatePresence mode="popLayout">
                {displayFall.map((course) => (
                  <EditorCourseRow key={course.id} course={course} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Floating drag ghost */}
          <AnimatePresence>
            {dragPhase === "dragging" && MOVED_COURSE && (
              <motion.div
                initial={{ opacity: 1, x: "-70%", y: "10%" }}
                animate={{ opacity: 1, x: "70%",  y: "30%" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 140, damping: 16 }}
                className="absolute left-[35%] top-[30%] z-20 w-[30%]"
              >
                <div className="rounded-xl border-2 border-[#82A7A6] bg-card px-2.5 py-2 shadow-xl ring-4 ring-[#82A7A6]/20">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-foreground">{MOVED_COURSE.code}</span>
                        {MOVED_COURSE.tags.map((t) => (
                          <span key={t} className="rounded px-1 py-0.5 text-[7px] font-bold text-card" style={{ backgroundColor: TEAL }}>{t}</span>
                        ))}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{MOVED_COURSE.title}</p>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground shrink-0">{MOVED_COURSE.units}u</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spring 2027 */}
          <div className={`flex-1 rounded-2xl border-2 bg-card flex flex-col transition-all ${
            dragPhase === "dragging" ? "border-[#82A7A6] ring-4 ring-[#82A7A6]/10" : "border-border"
          }`}>
            <SemesterHeader title="Spring 2027" courses={displaySpring} />
            <div className="p-2.5 flex-1 flex flex-col gap-1.5">
              {dragPhase === "dragging" && (
                <div className="border-2 border-dashed border-[#82A7A6] rounded-xl h-8 flex items-center justify-center text-[#82A7A6] text-[9px] font-bold mb-1">
                  Drop Course Here
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {displaySpring.map((course) => (
                  <EditorCourseRow key={course.id} course={course} entering />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SemesterHeader({ title, courses }: { title: string; courses: Course[] }) {
  return (
    <div className="p-3 border-b border-border/50 flex justify-between items-center bg-muted/30">
      <div>
        <h3 className="font-black text-foreground text-[11px]">{title}</h3>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          {courses.reduce((s, c) => s + c.units, 0)} / 19 Units
        </span>
      </div>
      <Trash2 className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}

function EditorCourseRow({ course, entering }: { course: Course; entering?: boolean }) {
  return (
    <motion.div
      layout
      initial={entering ? { opacity: 0, x: 20 } : { opacity: 1 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-xl border border-border bg-card px-2.5 py-2 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-foreground">{course.code}</span>
            {course.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded px-1 py-0.5 text-[7px] font-bold text-card" style={{ backgroundColor: TEAL }}>{tag}</span>
            ))}
            {course.tags.length > 2 && (
              <span className="rounded px-1 py-0.5 text-[7px] font-bold bg-muted text-muted-foreground">
                +{course.tags.length - 2}
              </span>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5">{course.title}</p>
        </div>
        <span className="text-[9px] font-bold text-muted-foreground shrink-0">{course.units}u</span>
      </div>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function DashboardDemo() {
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [phase,        setPhase]        = useState<Phase>("idle");
  const [fallCourses,  setFallCourses]  = useState<Course[]>([]);
  const [springCourses,setSpringCourses]= useState<Course[]>([]);
  const [igetcChecked, setIgetcChecked] = useState<Set<string>>(new Set());
  const [loadProgress, setLoadProgress] = useState(0);

  const universityText = useTypingText("UC Berkeley",           phase === "select-university", 60);
  const majorText      = useTypingText("Computer Science, B.A.", phase === "select-major",     40);

  const reset = useCallback(() => {
    setPhase("idle");
    setFallCourses([]);
    setSpringCourses([]);
    setIgetcChecked(new Set());
    setLoadProgress(0);
  }, []);

  useEffect(() => {
    reset();

    const schedule: { at: number; fn: () => void }[] = [
      { at:  800,  fn: () => setPhase("select-university") },
      { at: 3200,  fn: () => setPhase("select-major") },
      { at: 5600,  fn: () => { setPhase("loading"); setLoadProgress(0); } },
      { at: 5800,  fn: () => setLoadProgress(20) },
      { at: 6200,  fn: () => setLoadProgress(45) },
      { at: 6600,  fn: () => setLoadProgress(70) },
      { at: 7000,  fn: () => setLoadProgress(90) },
      { at: 7400,  fn: () => setLoadProgress(100) },
      { at: 7800,  fn: () => setPhase("courses-loading") },
      { at: 8000,  fn: () => setFallCourses(FALL_COURSES.slice(0, 1)) },
      { at: 8400,  fn: () => setFallCourses(FALL_COURSES.slice(0, 2)) },
      { at: 8800,  fn: () => setFallCourses(FALL_COURSES.slice(0, 3)) },
      { at: 9200,  fn: () => setSpringCourses(SPRING_COURSES.slice(0, 1)) },
      { at: 9600,  fn: () => setSpringCourses(SPRING_COURSES.slice(0, 2)) },
      // Dashboard fully loaded — pulse Edit Plan button
      { at: 10200, fn: () => setPhase("dashboard-ready") },
      // Cursor moves to Edit Plan and clicks it
      { at: 11000, fn: () => setPhase("click-edit") },
      // Transition to plan editor
      { at: 12200, fn: () => setPhase("plan-editor") },
      // Drag animation begins
      { at: 13200, fn: () => setPhase("plan-drag") },
      { at: 14800, fn: () => setPhase("plan-drag-done") },
      // Cursor moves to Save Changes and clicks it
      { at: 15400, fn: () => setPhase("click-save") },
      // Fade back to updated dashboard
      { at: 16400, fn: () => setPhase("fade-back") },
      { at: 17200, fn: () => {
          setFallCourses((prev) => prev.filter((c) => c.id !== "engl1a"));
          setSpringCourses((prev) => [FALL_COURSES[2], ...prev]);
          setPhase("final-dashboard");
        },
      },
      { at: 17800, fn: () => setIgetcChecked(new Set(["English Communication"])) },
      { at: 18300, fn: () => setIgetcChecked(new Set(["English Communication", "Mathematical Concepts and Quantitative Reasoning"])) },
      { at: 18800, fn: () => setIgetcChecked(new Set(["English Communication", "Mathematical Concepts and Quantitative Reasoning", "Physical and Biological Sciences"])) },
      { at: 19600, fn: () => setPhase("complete") },
    ];

    const ids = schedule.map(({ at, fn }) => setTimeout(fn, at));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planDragPhase: "idle" | "dragging" | "done" =
    phase === "plan-drag"      ? "dragging" :
    phase === "plan-drag-done" ? "done"     :
    phase === "click-save"     ? "done"     :
    "idle";

  const showPlanEditor = ["plan-editor", "plan-drag", "plan-drag-done", "click-save"].includes(phase);
  const showDashboard  = !showPlanEditor;

  const editHighlight =
    phase === "dashboard-ready" || phase === "click-edit";

  return (
    <div ref={containerRef} className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#82A7A6]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#82A7A6" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-xs font-bold text-foreground">
            Transfer<span style={{ color: TEAL }}>Path</span>
          </span>
        </div>
        <StepIndicator phase={phase} />
      </div>

      {/* Content */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {showDashboard && (
            <motion.div key="dashboard"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} className="absolute inset-0"
            >
              <DashboardView
                fallCourses={fallCourses}
                springCourses={springCourses}
                showCourses={!["idle","select-university","select-major","loading"].includes(phase)}
                igetcChecked={igetcChecked}
                editHighlight={editHighlight}
                editButtonRef={editButtonRef}
                onEditClick={() => setPhase("plan-editor")}
              />
            </motion.div>
          )}

          {showPlanEditor && (
            <motion.div key="editor"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }} className="absolute inset-0"
            >
              <PlanEditorView
                fallCourses={FALL_COURSES}
                springCourses={SPRING_COURSES}
                dragPhase={planDragPhase}
                saveButtonRef={saveButtonRef}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Overlays ── */}

        {/* Select University */}
        <AnimatePresence>
          {phase === "select-university" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full max-w-[240px] rounded-2xl border border-border bg-card p-4 shadow-2xl"
              >
                <h3 className="mb-0.5 text-[12px] font-bold text-foreground">Select a University</h3>
                <p className="mb-3 text-[10px] text-muted-foreground">Choose your target transfer school</p>
                <div className="rounded-lg border border-border bg-muted/50 px-2.5 py-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-semibold text-foreground">
                      {universityText}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="ml-px">|</motion.span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 rounded-lg border-2 border-[#82A7A6] bg-[#82A7A6]/10 px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-foreground">UC Berkeley</span>
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5" style={{ color: TEAL }} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="text-[11px] text-muted-foreground">UCLA</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="text-[11px] text-muted-foreground">UC San Diego</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Select Major */}
        <AnimatePresence>
          {phase === "select-major" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full max-w-[240px] rounded-2xl border border-border bg-card p-4 shadow-2xl"
              >
                <h3 className="mb-0.5 text-[12px] font-bold text-foreground">Select a Major</h3>
                <p className="mb-3 text-[10px] text-muted-foreground">What will you study at UC Berkeley?</p>
                <div className="rounded-lg border border-border bg-muted/50 px-2.5 py-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-semibold text-foreground">
                      {majorText}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="ml-px">|</motion.span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 rounded-lg border-2 border-[#82A7A6] bg-[#82A7A6]/10 px-2.5 py-1.5">
                    <span className="text-[11px] font-semibold text-foreground">Computer Science, B.A.</span>
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5" style={{ color: TEAL }} />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="text-[11px] text-muted-foreground">Data Science, B.A.</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5">
                    <span className="text-[11px] text-muted-foreground">Electrical Engineering, B.S.</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {phase === "loading" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-full max-w-[260px] rounded-2xl border border-border bg-card p-5 shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#82A7A6]/15 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-[#82A7A6] border-t-transparent rounded-full"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-[13px] font-bold text-foreground">Saving your universities</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{"Updating your plan\u2026"}</p>
                  </div>
                  <div className="w-full">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: TEAL }}
                        animate={{ width: `${loadProgress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[9px] font-semibold text-muted-foreground mt-1.5 text-center">{loadProgress}%</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete banner */}
        <AnimatePresence>
          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 left-3 right-3 z-30 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-card shadow-lg"
              style={{ backgroundColor: TEAL }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <div>
                <span className="text-[12px] font-bold">Transfer plan ready!</span>
                <p className="text-[10px] opacity-90">
                  {fallCourses.reduce((s, c) => s + c.units, 0) + springCourses.reduce((s, c) => s + c.units, 0)} units
                  across 2 semesters · Expected Completion in Spring 2027
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cursor — always on top */}
        <DemoCursor
          phase={phase}
          editButtonRef={editButtonRef}
          saveButtonRef={saveButtonRef}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
}