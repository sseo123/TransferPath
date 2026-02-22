"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle, Search, Calendar } from "lucide-react";

const PRIMARY = "#82A7A6";
const BG = "#F9FBFA";

const UCS = [
  { id: "berkeley", name: "UC Berkeley", logo: "/ucblogo.png" },
  { id: "ucla", name: "UCLA", logo: "/uclalogo.png" },
  { id: "ucsd", name: "UC San Diego", logo: "/ucsd.png" },
] as const;

type Phase = 0 | 1 | 2 | 3 | 4;

const FALL_COURSES = [
  { id: "math1a", code: "MATH 1A", title: "Calculus I", units: 4 },
  { id: "cs61a", code: "CS 61A", title: "Structure of Computer Programs", units: 4 },
  { id: "engl1a", code: "ENGL 1A", title: "English Composition", units: 3 },
];
const SPRING_COURSES = [
  { id: "chem1a", code: "CHEM 1A", title: "General Chemistry", units: 4 },
  { id: "math1b", code: "MATH 1B", title: "Calculus II", units: 4 },
  { id: "phys7a", code: "PHYS 7A", title: "Physics for Scientists", units: 4 },
];

const PHASE_DURATION_MS = 4000;

export function AutoPlanSimulation() {
  const [phase, setPhase] = useState<Phase>(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState(0);
  const [fallCourses, setFallCourses] = useState<typeof FALL_COURSES>([]);
  const [springCourses, setSpringCourses] = useState<typeof SPRING_COURSES>([]);
  const [conflictVisible, setConflictVisible] = useState(false);
  const [draggedCourse, setDraggedCourse] = useState<string | null>(null);
  const [moveComplete, setMoveComplete] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // Phase loop: advance every N ms, reset state when wrapping to 0
  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => {
        const next = (p + 1) % 5;
        if (next === 0) {
          setSelectedIds(new Set());
          setFallCourses([]);
          setSpringCourses([]);
          setConflictVisible(false);
          setDraggedCourse(null);
          setMoveComplete(false);
          setSuccessVisible(false);
          setCursorIndex(0);
        }
        return next as Phase;
      });
    }, PHASE_DURATION_MS);
    return () => clearInterval(t);
  }, []);

  // Phase 1: cursor + selection
  useEffect(() => {
    if (phase !== 0) return;
    const steps = [0, 1, 2]; // cursor at 0, 1, 2; select berkeley at 1, ucla at 2
    const t = setInterval(() => {
      setCursorIndex((i) => {
        const next = i + 1;
        if (next <= 2) {
          if (next >= 1) setSelectedIds((s) => new Set([...s, UCS[next - 1].id]));
          return next;
        }
        return 2;
      });
    }, 900);
    return () => clearInterval(t);
  }, [phase]);

  // Phase 2: scanning bar
  useEffect(() => {
    if (phase !== 1) {
      setScanProgress(0);
      return;
    }
    const start = Date.now();
    const duration = 2400;
    const frame = () => {
      const elapsed = Date.now() - start;
      setScanProgress(Math.min(100, (elapsed / duration) * 100));
      if (elapsed < duration) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [phase]);

  // Phase 3: courses fly in
  useEffect(() => {
    if (phase !== 2) return;
    const all = [...FALL_COURSES, ...SPRING_COURSES];
    const interval = 420;
    let idx = 0;
    const t = setInterval(() => {
      if (idx < all.length) {
        if (idx < FALL_COURSES.length) {
          setFallCourses(FALL_COURSES.slice(0, idx + 1));
        } else {
          setSpringCourses(SPRING_COURSES.slice(0, idx - FALL_COURSES.length + 1));
        }
        idx++;
      } else clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [phase]);

  // Phase 4: conflict then drag (smooth slide from Fall to Spring)
  useEffect(() => {
    if (phase !== 3) return;
    const showConflict = setTimeout(() => setConflictVisible(true), 400);
    const startDrag = setTimeout(() => setDraggedCourse("cs61a"), 1200);
    const finishMove = setTimeout(() => {
      setFallCourses((c) => c.filter((x) => x.id !== "cs61a"));
      setSpringCourses((c) => [{ id: "cs61a", code: "CS 61A", title: "Structure of Computer Programs", units: 4 }, ...c]);
      setDraggedCourse(null);
      setConflictVisible(false);
      setMoveComplete(true);
    }, 3200);
    return () => {
      clearTimeout(showConflict);
      clearTimeout(startDrag);
      clearTimeout(finishMove);
    };
  }, [phase]);

  // Phase 5: success
  useEffect(() => {
    if (phase !== 4) return;
    setSuccessVisible(true);
  }, [phase]);

  return (
    <div className="flex h-full min-h-[580px] w-full" style={{ background: BG }}>
      {/* Left: Selection Panel */}
      <div className="flex w-[42%] min-w-0 flex-col border-r border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-5 w-5" style={{ color: PRIMARY }} />
          <h3 className="text-lg font-bold text-slate-800">Select target schools</h3>
        </div>
        <div className="relative flex flex-1 flex-col gap-3">
          {UCS.map((uc, i) => (
            <motion.div
              key={uc.id}
              layout
              className={`relative flex items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
                selectedIds.has(uc.id)
                  ? "border-[#82A7A6] bg-[#82A7A6]/10 shadow-[0_0_20px_rgba(130,167,166,0.25)]"
                  : "border-gray-200 bg-white"
              }`}
              initial={false}
              animate={{
                boxShadow: selectedIds.has(uc.id) ? "0 0 20px rgba(130,167,166,0.25)" : "0 0 0 transparent",
              }}
              transition={{ duration: 0.3 }}
            >
              {phase === 0 && cursorIndex === i && (
                <motion.div
                  className="absolute -inset-1 rounded-xl border-2 border-[#82A7A6] bg-[#82A7A6]/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image src={uc.logo} alt={uc.name} fill className="object-contain p-1" />
              </div>
              <span className="font-semibold text-slate-800">{uc.name}</span>
              {selectedIds.has(uc.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto shrink-0"
                  style={{ color: PRIMARY }}
                >
                  <CheckCircle className="h-6 w-6" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        {phase === 1 && (
          <div className="mt-4 space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full"
                style={{ background: PRIMARY }}
                initial={{ width: "0%" }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Fetching IGETC & Major Requirements...
            </p>
          </div>
        )}
      </div>

      {/* Right: Course Timeline */}
      <div className="relative flex flex-1 flex-col p-6 min-w-0">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 shrink-0" style={{ color: PRIMARY }} />
          <h3 className="text-lg font-bold text-slate-800">Course Timeline</h3>
        </div>
        <div className="relative flex flex-1 gap-4 min-h-0">
          {/* Fall 2026 */}
          <motion.div
            layout
            className={`flex-1 rounded-2xl border-2 p-4 transition-colors min-w-0 ${
              conflictVisible && !moveComplete ? "border-red-400 bg-red-50/50" : "border-gray-200 bg-white"
            } ${phase === 4 && successVisible ? "border-[#82A7A6] bg-[#82A7A6]/10" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-bold text-slate-800">Fall 2026</span>
              <span className="text-xs text-gray-500">{fallCourses.reduce((a, c) => a + c.units, 0)} units</span>
            </div>
            <div className="space-y-2 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {fallCourses
                  .filter((c) => phase !== 3 || !draggedCourse || c.id !== "cs61a")
                  .map((course) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 text-sm">{course.code}</span>
                        <p className="text-xs text-gray-500 truncate">{course.title}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 shrink-0">{course.units} units</span>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* In-transit card: slides from Fall to Spring */}
          {phase === 3 && draggedCourse === "cs61a" && (
            <motion.div
              initial={{ opacity: 0, x: "-90%" }}
              animate={{ opacity: 1, x: "90%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24, duration: 0.85 }}
              className="absolute left-0 top-1/2 z-10 w-[45%] -translate-y-1/2"
            >
              <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-lg ring-2 ring-[#82A7A6]">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 text-sm">CS 61A</span>
                  <p className="text-xs text-gray-500 truncate">Structure of Computer Programs</p>
                </div>
                <span className="text-xs font-bold text-slate-600 shrink-0">4 units</span>
              </div>
            </motion.div>
          )}

          {/* Spring 2027 */}
          <motion.div
            layout
            className={`flex-1 rounded-2xl border-2 p-4 transition-colors min-w-0 border-gray-200 bg-white ${
              phase === 4 && successVisible ? "border-[#82A7A6] bg-[#82A7A6]/10" : ""
            }`}
          >
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-bold text-slate-800">Spring 2027</span>
              <span className="text-xs text-gray-500">{springCourses.reduce((a, c) => a + c.units, 0)} units</span>
            </div>
            <div className="space-y-2 min-h-[100px] relative">
              <AnimatePresence mode="popLayout">
                {springCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 text-sm">{course.code}</span>
                      <p className="text-xs text-gray-500 truncate">{course.title}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 shrink-0">{course.units} units</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Success badge */}
        <AnimatePresence>
          {phase === 4 && successVisible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-white"
              style={{ background: PRIMARY }}
            >
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="font-bold">100% Articulated – 2 Year Path Found.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
