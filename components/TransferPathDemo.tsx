"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle, Circle, GraduationCap } from "lucide-react";

const PRIMARY = "var(--primary)";
const BG = "var(--background)";

type Step = 0 | 1 | 2 | 3 | 4; // 0=selection modal, 1=generation, 2=drag, 3=completion, 4=done

interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  tags: string[];
}

const COURSE: Course = {
  id: "engl1a",
  code: "ENGL 1A",
  title: "English Composition",
  units: 3,
  tags: ["UCB", "UCLA"],
};

const FALL_COURSES: Course[] = [
  { id: "math1a", code: "MATH 1A", title: "Calculus I", units: 4, tags: ["UCB", "UCLA"] },
  { id: "cs61a", code: "CS 61A", title: "Structure of Computer Programs", units: 4, tags: ["UCB"] },
  { id: "engl1a", code: "ENGL 1A", title: "English Composition", units: 3, tags: ["UCB", "UCLA"] },
];
const SPRING_COURSES: Course[] = [
  { id: "chem1a", code: "CHEM 1A", title: "General Chemistry", units: 4, tags: ["UCB", "UCLA"] },
  { id: "math1b", code: "MATH 1B", title: "Calculus II", units: 4, tags: ["UCB"] },
];

const IGETC_ITEMS = [
  { id: "eng", label: "English Composition", checked: false },
  { id: "math", label: "Mathematics", checked: false },
  { id: "arts", label: "Arts & Humanities", checked: false },
  { id: "sci", label: "Scientific Inquiry", checked: false },
];

export function TransferPathDemo() {
  const [step, setStep] = useState<Step>(0);
  const [modalSelection, setModalSelection] = useState<"university" | "major" | null>("university");
  const [modalCursor, setModalCursor] = useState(0); // 0=Berkeley, 1=CS
  const [targetUniversities, setTargetUniversities] = useState<{ name: string; logo: string }[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scanVisible, setScanVisible] = useState(false);
  const [fallCourses, setFallCourses] = useState<Course[]>([]);
  const [springCourses, setSpringCourses] = useState<Course[]>([]);
  const [draggingCourse, setDraggingCourse] = useState<string | null>(null);
  const [igetcChecked, setIgetcChecked] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);

  // Single run: advance steps on a timeline (~12s total)
  useEffect(() => {
    if (hasFinished) return;

    const schedule: { at: number; fn: () => void }[] = [
      { at: 0, fn: () => setStep(0) },
      { at: 300, fn: () => setModalCursor(0) },
      { at: 1800, fn: () => { setModalSelection("major"); setModalCursor(0); } },
      { at: 4000, fn: () => { setModalSelection(null); setStep(1); setTargetUniversities([{ name: "UC Berkeley", logo: "/ucblogo.png" }]); } },
      { at: 4200, fn: () => setStatusMessage("Finding articulations on assist.org...") },
      { at: 4400, fn: () => setScanVisible(true) },
      { at: 5500, fn: () => setScanVisible(false) },
      { at: 5600, fn: () => setFallCourses(FALL_COURSES.slice(0, 1)) },
      { at: 6000, fn: () => setFallCourses(FALL_COURSES.slice(0, 2)) },
      { at: 6400, fn: () => setFallCourses(FALL_COURSES.slice(0, 3)) },
      { at: 6800, fn: () => setSpringCourses(SPRING_COURSES.slice(0, 1)) },
      { at: 7200, fn: () => setSpringCourses(SPRING_COURSES.slice(0, 2)) },
      { at: 7600, fn: () => { setStatusMessage(null); setStep(2); } },
      { at: 8000, fn: () => setDraggingCourse("engl1a") },
      { at: 9200, fn: () => { setDraggingCourse(null); setFallCourses((c) => c.filter((x) => x.id !== "engl1a")); setSpringCourses((c) => [COURSE, ...c]); setStep(3); } },
      { at: 9400, fn: () => { setIgetcChecked("eng"); setProgress(25); } },
      { at: 12000, fn: () => { setStep(4); setHasFinished(true); } },
    ];

    const timeouts = schedule.map(({ at, fn }) => setTimeout(fn, at));
    return () => timeouts.forEach(clearTimeout);
  }, [hasFinished]);

  return (
    <div className="relative flex h-full min-h-[580px] w-full flex-col" style={{ background: BG }}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Welcome, Student!</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{progress}% complete</span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ background: PRIMARY }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main: Timeline (left) + Sidebar (right) */}
      <div className="flex flex-1 min-h-0 p-4 gap-4">
        {/* Left: Academic Timeline */}
        <div className="flex-1 flex flex-col min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Academic Timeline</h3>
          <div className="relative flex flex-1 gap-3 min-h-0">
            {/* Scanner glow (Step 1) */}
            <AnimatePresence>
              {scanVisible && (
                <motion.div
                  initial={{ opacity: 0, top: "0%" }}
                  animate={{ opacity: 1, top: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute left-0 right-0 z-10 h-1 rounded-full shadow-[0_0_12px_2px_rgba(130,167,166,0.6)]"
                  style={{ background: PRIMARY }}
                />
              )}
            </AnimatePresence>

            {/* Fall 2026 */}
            <div className="flex-1 rounded-2xl border border-border bg-muted/50 p-3 min-h-0">
              <div className="mb-2 border-b border-border pb-1.5 text-xs font-bold text-foreground/80">Fall 2026</div>
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {fallCourses
                    .filter((c) => step < 2 || step >= 3 || c.id !== "engl1a" || !draggingCourse)
                    .map((course) => (
                      <motion.div
                        key={course.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: draggingCourse === course.id ? 1.02 : 1,
                          boxShadow: draggingCourse === course.id ? "0 4px 12px rgba(130,167,166,0.3)" : "0 0 0 transparent",
                        }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`rounded-xl border px-2.5 py-2 text-left ${
                          draggingCourse === course.id ? "border-primary bg-background" : "border-border bg-background"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground text-xs">{course.code}</span>
                            <p className="truncate text-[10px] text-muted-foreground">{course.title}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {course.tags.map((t) => (
                              <span key={t} className="rounded bg-[#82A7A6] px-1 py-0.5 text-[9px] font-bold text-white">
                                {t}
                              </span>
                            ))}
                            <span className="text-[10px] font-bold text-muted-foreground">{course.units}u</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Dragging card (Step 2) */}
            <AnimatePresence>
              {step === 2 && draggingCourse === "engl1a" && (
                <motion.div
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: "100%", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22, duration: 0.9 }}
                  className="absolute left-[25%] top-1/2 z-20 w-[45%] -translate-y-1/2"
                >
                  <div className="rounded-xl border-2 border-primary bg-background px-2.5 py-2 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground text-xs">{COURSE.code}</span>
                        <p className="truncate text-[10px] text-muted-foreground">{COURSE.title}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {COURSE.tags.map((t) => (
                          <span key={t} className="rounded bg-[#82A7A6] px-1 py-0.5 text-[9px] font-bold text-white">{t}</span>
                        ))}
                        <span className="text-[10px] font-bold text-muted-foreground">{COURSE.units}u</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spring 2027 */}
            <div className="flex-1 rounded-2xl border border-border bg-muted/50 p-3 min-h-0">
              <div className="mb-2 border-b border-border pb-1.5 text-xs font-bold text-foreground/80">Spring 2027</div>
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {springCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="rounded-xl border border-border bg-background px-2.5 py-2 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground text-xs">{course.code}</span>
                          <p className="truncate text-[10px] text-muted-foreground">{course.title}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {course.tags.map((t) => (
                            <span key={t} className="rounded bg-[#82A7A6] px-1 py-0.5 text-[9px] font-bold text-white">
                              {t}
                            </span>
                          ))}
                          <span className="text-[10px] font-bold text-slate-500">{course.units}u</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right: IGETC + Target Universities */}
        <div className="w-56 shrink-0 space-y-3">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">IGETC Checklist</h3>
            <ul className="space-y-2">
              {IGETC_ITEMS.map((item) => (
                <motion.li
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                  initial={false}
                  animate={{ scale: igetcChecked === item.id ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {igetcChecked === item.id ? (
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: PRIMARY }} />
                  ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted" />
                  )}
                  <span className={igetcChecked === item.id ? "font-semibold" : ""}>{item.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Target Universities</h3>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {targetUniversities.map((uni) => (
                  <motion.div
                    key={uni.name}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 rounded-xl border border-border p-2"
                  >
                    <div className="relative h-8 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image src={uni.logo} alt={uni.name} fill className="object-contain p-0.5" />
                    </div>
                    <span className="truncate text-xs font-semibold text-foreground/80">{uni.name}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Status message (Step 1) */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-primary/30 bg-card px-4 py-2 shadow-md"
          >
            <p className="text-sm font-medium text-foreground/90">{statusMessage}</p>
            <div className="mt-1.5 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Select a University (Step 0) */}
      <AnimatePresence>
        {modalSelection !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && null}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl"
            >
              <h3 className="mb-4 text-lg font-bold text-foreground">
                {modalSelection === "university" ? "Select a University" : "Select a Major"}
              </h3>
              <div className="space-y-2">
                {modalSelection === "university" ? (
                  <>
                    {["UC Berkeley", "UCLA", "UC San Diego"].map((name, i) => (
                      <div
                        key={name}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                          modalCursor === i ? "border-[#82A7A6] bg-[#82A7A6]/10" : "border-gray-200"
                        }`}
                      >
                        <div className="relative h-10 w-12 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={i === 0 ? "/ucblogo.png" : i === 1 ? "/uclalogo.png" : "/ucsd.png"}
                            alt={name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <span className="font-semibold text-foreground">{name}</span>
                        {modalCursor === i && (
                          <CheckCircle className="ml-auto h-5 w-5" style={{ color: PRIMARY }} />
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {["Computer Science", "Biology", "Psychology"].map((m, i) => (
                      <div
                        key={m}
                        className={`flex items-center gap-3 rounded-xl border-2 p-3 ${
                          modalCursor === i ? "border-[#82A7A6] bg-[#82A7A6]/10" : "border-gray-200"
                        }`}
                      >
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{m}</span>
                        {modalCursor === i && (
                          <CheckCircle className="ml-auto h-5 w-5" style={{ color: PRIMARY }} />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
