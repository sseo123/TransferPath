"use client";

import { useState, useEffect } from "react";
import { Semester, PlannedCourse, SyncTask } from "@/lib/planner/types";
import PlanEditor from "./planEditor";
import { markSemesterComplete, unmarkSemesterComplete, syncUserData, } from "./actions";
import { ChevronDown, ChevronRight, GraduationCap, CheckSquare, Square, Plus, PenIcon, Printer, Calendar, TrendingUp, Target, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { checkPrerequisites } from "@/lib/planner/validator";
import { calculateTotalUnits } from "@/lib/planner/utils";
import { DVC_CATALOG } from "@/data/cc/dvc";
import CourseItem from "@/components/CourseItem";



interface DashboardClientProps {
  initialSemesters: Semester[];
  initialUnassigned: PlannedCourse[];
  initialCompletedCourses: PlannedCourse[];
  initialCustomCourses: PlannedCourse[]; // NEW
  initialCompletedSemesters: string[];
  targetUniversities: { name: string; code: string }[]; // NEW

  dbUser: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    startSeason: string | null;
    startYear: number | null;
    currentCollege: string | null;
  };
  targetCount: number;
  initialIgetcTasks: SyncTask[] | null;
  initialPatternTasks: SyncTask[] | null;
}

// ... (SemesterAccordionItem remains same)


function SemesterAccordionItem({
  semester,
  isCompleted,
  onToggleComplete,
}: {
  semester: Semester;
  onEdit: () => void;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const totalUnits = calculateTotalUnits(semester.courses);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-5 px-8 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-6">
          <button className="text-muted-foreground">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <h2
            className={`text-lg font-semibold flex items-center gap-3 ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {semester.name}
            <span className="text-border">·</span>
            <span
              className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
            >
              {totalUnits} Units
            </span>
          </h2>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="text-muted-foreground hover:text-primary p-2 transition-colors"
        >
          {isCompleted ? (
            <CheckSquare size={20} className="text-primary" />
          ) : (
            <Square size={20} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border/50">
          {semester.courses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm italic">
              No courses planned
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {semester.courses.map((course, idx) => (
                <CourseItem
                  key={`${course.canonicalId}-${idx}`}
                  course={course}
                  variant="row"
                  isCompleted={isCompleted}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  count, 
  total, 
  children, 
  icon: Icon,
  variant = "default"
}: { 
  title: string; 
  count?: number; 
  total?: number; 
  children: React.ReactNode; 
  icon?: React.ElementType;
  variant?: "default" | "warning";
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  const bgClass = variant === "warning" ? "bg-amber-400 hover:bg-amber-500" : "bg-primary hover:bg-primary/90";
  const textClass = variant === "warning" ? "text-amber-950" : "text-primary-foreground";
  const badgeClass = variant === "warning" ? "bg-amber-950/10 text-amber-950" : "bg-primary-foreground/20 text-primary-foreground";

  return (
    <div className={`bg-card rounded-3xl border shadow-sm overflow-hidden ${variant === "warning" ? "border-amber-200" : "border-border"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-6 transition-colors ${bgClass} ${textClass}`}
      >
        <div className="flex items-center gap-3 flex-1">
          {Icon && <Icon size={24} className={variant === "warning" ? "text-amber-900/80" : "text-primary-foreground/80"} />}
          <span className="font-bold text-xl tracking-tight">{title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* UPDATED LOGIC BELOW */}
          {count !== undefined && count > 0 && (
            <span className={`text-sm font-bold px-2 py-1 rounded-full backdrop-blur-sm ${badgeClass}`}>
              {count}
              {total !== undefined ? `/${total}` : ""}
            </span>
          )}
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 pt-5 border-t border-border/50 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({
  initialSemesters,
  initialUnassigned,
  initialCompletedCourses,
  initialCustomCourses,
  initialCompletedSemesters,
  targetUniversities,
  dbUser,
  targetCount,
  initialIgetcTasks,
  initialPatternTasks,
}: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [completedSemesters, setCompletedSemesters] = useState<Set<string>>(
    new Set(initialCompletedSemesters),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const hasTargets = targetCount > 0;

  // Security: Sync flags for debouncing
  const [isSyncing, setIsSyncing] = useState(false);

  // Requirement Checklists State
  const [igetcTasks2, setIgetcTasks2] = useState(
    initialIgetcTasks ?? [
      { id: "1", label: "English Communication", completed: false },
      {
        id: "2",
        label: "Mathematical Concepts and Quantitative Reasoning",
        completed: false,
      },
      { id: "3", label: "Arts and Humanities", completed: false },
      { id: "4", label: "Social and Behavioral Sciences", completed: false },
      { id: "5", label: "Physical and Biological Sciences", completed: false },
      { id: "6", label: "Language Other than English", completed: false },
      { id: "7", label: "Ethnic Studies", completed: false },
    ],
  );

  const [patternTasks1, setPatternTasks1] = useState(
    initialPatternTasks ?? [
      { id: "p1", label: "English Composition", completed: false },
      {
        id: "p2",
        label: "Mathematical Concepts and Quantitative Reasoning",
        completed: false,
      },
      { id: "p3", label: "Physical and Biological Science", completed: false },
      { id: "p4", label: "Social and Behavioral Science", completed: false },
      { id: "p5", label: "Arts and Humanities", completed: false },
    ],
  );

  const [isHydrated, setIsHydrated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Security: Debounced Database Synchronization
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await syncUserData({
          igetcTasks: igetcTasks2,
          patternTasks: patternTasks1,
        });
      } catch (error) {
        console.error("Sync failed:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [igetcTasks2, patternTasks1, isHydrated]);

  const handleToggleTask = (id: string, type: "igetc" | "pattern") => {
    if (type === "igetc") {
      setIgetcTasks2((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    } else {
      setPatternTasks1((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    }
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleToggleComplete = async (semesterName: string) => {
    const isCurrentlyCompleted = completedSemesters.has(semesterName);

    if (!isCurrentlyCompleted) {
      const semester = initialSemesters.find((s) => s.name === semesterName);
      if (semester) {
        const semesterIndex = initialSemesters.findIndex(
          (s) => s.name === semesterName,
        );
        const allCoursesValid = semester.courses.every((course) => {
          if (course.isCustom) return true;

          const catalogData = DVC_CATALOG.find(
            (c) => c.canonicalId === course.canonicalId,
          );
          if (!catalogData) return false;
          const { isValid } = checkPrerequisites(
            catalogData,
            semesterIndex,
            initialSemesters,
            initialCompletedCourses,
          );
          return isValid;
        });

        if (!allCoursesValid) {
          alert(
            "Cannot complete semester: Some courses have unsatisfied prerequisites.",
          );
          return;
        }
      }
    }

    try {
      if (isCurrentlyCompleted) {
        await unmarkSemesterComplete(semesterName);
        setCompletedSemesters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(semesterName);
          return newSet;
        });
      } else {
        await markSemesterComplete(semesterName);
        setCompletedSemesters((prev) => {
          const newSet = new Set(prev);
          newSet.add(semesterName);
          return newSet;
        });
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error toggling semester completion:", error);
      if (isCurrentlyCompleted) {
        setCompletedSemesters((prev) => {
          const newSet = new Set(prev);
          newSet.add(semesterName);
          return newSet;
        });
      } else {
        setCompletedSemesters((prev) => {
          const newSet = new Set(prev);
          newSet.delete(semesterName);
          return newSet;
        });
      }
      alert("Failed to update semester completion. Please try again.");
    }
  };

  const handleAction = () => {
    if (hasTargets) {
      setIsEditing(true);
    } else {
      router.push("/dashboard/addCollege");
    }
  };

  const handleTopRightAction = () => {
    if (hasTargets) {
      router.push("/dashboard/addCollege");
    } else {
      router.push("/dashboard/addCollege");
    }
  };


  if (isEditing) {
    return (
      <PlanEditor
        initialSemesters={initialSemesters}
        initialUnassigned={initialUnassigned}
        initialCompletedCourses={initialCompletedCourses}
        initialCustomCourses={initialCustomCourses}
        targetUniversities={targetUniversities}
        startSeason={dbUser.startSeason || "fall"}
        startYear={dbUser.startYear || new Date().getFullYear()}
        onExit={() => setIsEditing(false)}
      />
    );
  }

  const handleCounselorViewPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: CounselorViewPDF } = await import("./CounselorViewPDF");
      const blob = await pdf(
        <CounselorViewPDF
          dbUser={dbUser}
          semesters={initialSemesters}
          completedSemesters={completedSemesters}
          targetUniversities={targetUniversities}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${dbUser.firstName ?? "Student"}_Transfer_Plan_Counselor_View.pdf`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const totalUnits = calculateTotalUnits(initialSemesters.flatMap(s => s.courses));

  const completedUnits = calculateTotalUnits(
    initialSemesters
      .filter(s => completedSemesters.has(s.name))
      .flatMap(s => s.courses)
  );

  const progressPercentage =
    totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const completionSemester =
    initialSemesters.length > 0
      ? initialSemesters[initialSemesters.length - 1].name
      : "TBD";

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={
            typeof window !== "undefined"
              ? Math.max(
                  window.innerHeight,
                  document.documentElement.scrollHeight,
                )
              : 0
          }
          recycle={false}
          numberOfPieces={100}
          tweenDuration={2000}
          gravity={0.35}
          friction={0.99}
          initialVelocityY={7}
          initialVelocityX={7}
          confettiSource={{
            x: typeof window !== "undefined" ? window.innerWidth * 0.25 : 0,
            y: -20,
            w: typeof window !== "undefined" ? window.innerWidth * 0.5 : 0,
            h: 0,
          }}
        />
      )}
      <div className="max-w-8xl mx-auto p-8 font-sans text-foreground">
        <header className="mb-12 border-b border-border pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">
                Welcome, {dbUser.firstName}!
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-muted-foreground text-lg font-medium">
                  Here is your TransferPlan
                </p>
                {isHydrated && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 ${
                      isSyncing
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}
                  >
                    {isSyncing ? "Syncing..." : "Saved to Cloud"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleCounselorViewPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold bg-card border border-border text-foreground rounded-xl shadow-sm transition-all hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                <Printer size={18} />
                {isGeneratingPDF ? "Generating…" : "Counselor View"}
              </button>
              <button
                onClick={handleTopRightAction}
                className={`px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 hover:shadow-xl ${
                  hasTargets
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {hasTargets
                  ? "+ Add Another University"
                  : "+ Add Universities to Start"}
              </button>
            </div>
          </div>
        </header>
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* Expected Completion Card */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <p className="text-muted-foreground text-sm font-medium">Expected Completion:</p>
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-orange-500" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              <span className="text-2xl font-bold text-foreground text-center">
                {completionSemester}
              </span>
            </div>
            <div />
          </div>

          {/* Progress Card */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <p className="text-muted-foreground text-sm font-medium">Progress:</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-blue-500" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              <span className="text-2xl font-bold text-foreground">
                {progressPercentage}%
              </span>
            </div>
            <div />
          </div>

          {/* Total Units Card */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <p className="text-muted-foreground text-sm font-medium">Total Units:</p>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center flex-shrink-0">
                <Target size={18} className="text-teal-500" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              <span className="text-2xl font-bold text-foreground">
                {totalUnits}
              </span>
            </div>
            <div />
          </div>

          {/* Current College Card */}
          <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <p className="text-muted-foreground text-sm font-medium">Your Current College:</p>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-indigo-500" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              <span className="text-2xl font-bold text-foreground text-center">
                {dbUser.currentCollege || "Community College"}
              </span>
            </div>
            <div />
          </div>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9 bg-primary rounded-[32px] p-8 border border-border shadow-inner">
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-3xl font-bold text-primary-foreground">
                Your Strategic Timeline
              </h2>
              <button
                onClick={handleAction}
                className={`flex items-center gap-2 px-4 py-3 border transition-all hover:scale-102 active:scale-95 hover:shadow-l rounded-xl font-semibold ${
                  hasTargets
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary-foreground/20"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary-foreground/20"
                }`}
              >
                {hasTargets ? (
                  <>
                    <PenIcon size={16} className="text-primary-foreground/80" />
                    Edit Plan
                  </>
                ) : (
                  <>
                    <Plus size={16} className="text-primary-foreground/80" />
                    Add University
                  </>
                )}
              </button>
            </div>
            <div className="mb-6 px-2">
              <p className="text-sm text-primary-foreground/90 font-medium flex items-center gap-1">
                Always feel free to double-check your course articulations on
                <a
                  href="https://assist.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-foreground font-black hover:underline decoration-2"
                >
                  assist.org
                </a>
              </p>
            </div>
            <div className="flex flex-col">
              {hasTargets ? (
                <>
                  {initialSemesters.map((semester) => (
                    <SemesterAccordionItem
                      key={semester.name}
                      semester={semester}
                      onEdit={handleAction}
                      isCompleted={completedSemesters.has(semester.name)}
                      onToggleComplete={() =>
                        handleToggleComplete(semester.name)
                      }
                    />
                  ))}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-[24px] bg-card hover:bg-muted hover:border-primary/50 transition-all group mt-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-background transition-colors">
                        <Plus size={24} className="text-muted-foreground" />
                      </div>
                      <span className="text-lg font-bold text-muted-foreground">
                        Add Semester
                      </span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground/50">
                    <GraduationCap size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-primary-foreground">
                    No universities targeted yet
                  </h3>
                  <p className="text-primary-foreground/80 max-w-xs mt-2 mb-6">
                    Select your target colleges so we can build your
                    requirements.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/addCollege")}
                    className="px-8 py-3 bg-primary-foreground text-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Go to Universities
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-5">
            {/* 1. Unscheduled Courses */}
            {initialUnassigned.length > 0 && (
              <CollapsibleSection
                title="⚠️ WARNING ⚠️"
                variant="warning"
              >
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm font-medium">
                    {initialUnassigned.length} course
                    {initialUnassigned.length !== 1 ? "s" : ""}{" "}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-amber-950 dark:text-amber-50 font-bold hover:underline underline-offset-2"
                    >
                      needs scheduling
                    </button>
                  </p>

                  {/* Course List Scrollbox */}
                  <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent space-y-2 pr-2">
                    {initialUnassigned.map((course) => (
                      <div
                        key={course.canonicalId}
                        className="px-4 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex justify-between items-center hover:bg-amber-500/20 transition-colors"
                      >
                        <span className="font-bold text-amber-950 text-lg tracking-tight">
                          {course.localCode}
                        </span>
                        <span className="text-sm text-amber-900 font-bold px-3 py-1 bg-amber-400/20 rounded-full border border-amber-500/20">
                          {course.units} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* 2. IGETC */}
            <CollapsibleSection
              title="IGETC"
              count={igetcTasks2.filter((t) => t.completed).length}
              total={igetcTasks2.length}
              icon={CheckSquare}
            >
              <div className="space-y-3">
                {igetcTasks2.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleToggleTask(task.id, "igetc")}
                  >
                    {task.completed ? (
                      <CheckSquare
                        size={16}
                        className="flex-shrink-0 text-primary"
                      />
                    ) : (
                      <Square
                        size={16}
                        className="flex-shrink-0 text-muted group-hover:text-muted-foreground"
                      />
                    )}
                    <span
                      className={`text-sm font-semibold ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {task.label}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50 mt-4">
                  <p className="text-xs text-muted-foreground font-medium text-center italic">
                    Don&apos;t know if you&apos;ve fulfilled an IGETC requirement?{" "}
                    <a
                      href="https://assist.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline"
                    >
                      Check assist.org
                    </a>
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* 3. 7-Course Pattern */}
            <CollapsibleSection
              title="7-Course Pattern"
              count={patternTasks1.filter((t) => t.completed).length}
              total={patternTasks1.length}
              icon={CheckSquare}
            >
              <div className="space-y-3">
                {patternTasks1.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleToggleTask(task.id, "pattern")}
                  >
                    {task.completed ? (
                      <CheckSquare
                        size={16}
                        className="flex-shrink-0 text-primary"
                      />
                    ) : (
                      <Square
                        size={16}
                        className="flex-shrink-0 text-muted group-hover:text-muted-foreground"
                      />
                    )}
                    <span
                      className={`text-sm font-semibold ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {task.label}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50 mt-4">
                  <p className="text-xs text-muted-foreground font-medium text-center italic">
                    Don&apos;t know if you&apos;ve fulfilled a 7-course pattern
                    requirement?{" "}
                    <a
                      href="https://assist.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline"
                    >
                      Check assist.org
                    </a>
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Modal code for deadlines removed */}
    </div>
  );
}
