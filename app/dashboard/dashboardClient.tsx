"use client";

import { useState, useEffect } from "react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import PlanEditor from "./planEditor";
import {
  logout,
  markSemesterComplete,
  unmarkSemesterComplete,
} from "./actions";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  CheckSquare,
  Square,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { checkPrerequisites } from "@/lib/planner/validator";
import { DVC_CATALOG } from "@/data/cc/dvc";

interface DashboardClientProps {
  initialSemesters: Semester[];
  initialUnassigned: PlannedCourse[];
  initialCompletedCourses: PlannedCourse[];
  initialCompletedSemesters: string[];

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
}

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
  const totalUnits = semester.courses.reduce((sum, c) => sum + c.units, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-5 px-8 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-6">
          <button className="text-slate-400">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <h2
            className={`text-lg font-semibold flex items-center gap-3 ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}
          >
            {semester.name}
            <span className="text-slate-300">·</span>
            <span
              className={`font-medium ${isCompleted ? "line-through text-slate-400" : "text-slate-500"}`}
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
          className="text-slate-400 hover:text-[#82A7A6] p-2 transition-colors"
        >
          {isCompleted ? (
            <CheckSquare size={20} className="text-[#82A7A6]" />
          ) : (
            <Square size={20} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100">
          {semester.courses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              No courses planned
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {semester.courses.map((course, idx) => (
                <RowItem
                  key={`${course.canonicalId}-${idx}`}
                  course={course}
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

function RowItem({
  course,
  isCompleted = false,
}: {
  course: PlannedCourse;
  isCompleted?: boolean;
}) {
  const getBadgeStyle = (code: string) => {
    return "bg-[#7ca1ad] text-white text-[10px] font-bold uppercase tracking-wider rounded-full";
  };

  return (
    <div className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer">
      <div className="flex flex-col gap-1">
        <span
          className={`text-lg font-bold leading-tight ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}
        >
          {course.localCode}
        </span>
        <span
          className={`font-medium ${isCompleted ? "line-through text-slate-400" : "text-slate-500"}`}
        >
          {course.title}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Badges */}
        <div className="flex gap-2">
          {course.isCritical &&
            // Show specific university requirements
            (course.requiredBy && course.requiredBy.length > 0 ? (
              course.requiredBy.map((uni) => (
                <span
                  key={uni}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getBadgeStyle(
                    uni,
                  )}`}
                >
                  {uni}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-teal-200">
                Required
              </span>
            ))}

          <span className="px-3 py-1 text-[12px] font-bold uppercase tracking-wider rounded-full">
            {course.units} Units
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  initialSemesters,
  initialUnassigned,
  initialCompletedCourses,
  initialCompletedSemesters,
  dbUser,
  targetCount,
}: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [completedSemesters, setCompletedSemesters] = useState<Set<string>>(
    new Set(initialCompletedSemesters),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const hasTargets = targetCount > 0;

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
        onExit={() => setIsEditing(false)}
      />
    );
  }

  const totalUnits = initialSemesters.reduce((acc, semester) => {
    return (
      acc + semester.courses.reduce((sum, course) => sum + course.units, 0)
    );
  }, 0);

  const completedUnits = initialSemesters.reduce((acc, semester) => {
    if (completedSemesters.has(semester.name)) {
      return (
        acc + semester.courses.reduce((sum, course) => sum + course.units, 0)
      );
    }
    return acc;
  }, 0);

  const progressPercentage =
    totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const completionSemester =
    initialSemesters.length > 0
      ? initialSemesters[initialSemesters.length - 1].name
      : "TBD";

  return (
    <div className="min-h-screen bg-white">
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
      <div className="max-w-7xl mx-auto p-8 font-sans text-slate-900">
        <header className="mb-12 border-b border-slate-100 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Welcome, {dbUser.firstName}!
              </h1>
              <p className="text-slate-500 mt-2 text-lg font-medium">
                Here is your transfer plan
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleTopRightAction}
                className={`px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 hover:shadow-xl ${
                  hasTargets
                    ? "bg-[#82A7A6] hover:bg-[#6B8A89] text-white"
                    : "bg-[#82A7A6] hover:bg-[#6B8A89] text-white"
                }`}
              >
                {hasTargets
                  ? "Add Another University"
                  : "Add Universities to Start"}
              </button>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-3 text-sm font-bold text-black rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </header>
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Expected Completion Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-xl">📅</span>
              </div>
              {/* Dynamic Semester Name */}
              <span className="text-2xl font-bold text-slate-900">
                {completionSemester}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Expected Completion
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">📈</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {progressPercentage}%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Progress</p>
            </div>
          </div>

          {/* Total Units Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-teal-600 text-xl">🎯</span>
              </div>
              {/* Dynamic Unit Total */}
              <span className="text-2xl font-bold text-slate-900">
                {totalUnits}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Units</p>
            </div>
          </div>

          {/* Quote Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏫</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {dbUser.currentCollege || "Community College"}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Your Current College
              </p>
            </div>
          </div>
        </div>
        <div
          className={`${
            initialUnassigned.length > 0
              ? "flex flex-col lg:grid lg:grid-cols-12 gap-8"
              : ""
          }`}
        >
          <div
            className={`bg-slate-50 rounded-[32px] p-8 border border-slate-200/60 shadow-inner ${
              initialUnassigned.length > 0 ? "lg:col-span-9" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-2xl font-bold text-slate-800">
                Your Strategic Timeline
              </h2>
              <button
                onClick={handleAction}
                className={`px-6 py-2.5 border transition-all hover:scale-102 active:scale-95 hover:shadow-l rounded-xl font-semibold ${
                  hasTargets
                    ? "bg-[#82A7A6] hover:bg-[#6B8A89] text-white"
                    : "bg-[#82A7A6] hover:bg-[#6B8A89] text-white"
                }`}
              >
                {hasTargets ? "Edit Plan" : "Add University"}
              </button>
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
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[24px] bg-white hover:bg-slate-50 hover:border-slate-400 transition-all group mt-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f1f5f9] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <Plus size={24} className="text-slate-600" />
                      </div>
                      <span className="text-lg font-bold text-slate-600">
                        Add Semester
                      </span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <GraduationCap size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    No universities targeted yet
                  </h3>
                  <p className="text-slate-500 max-w-xs mt-2 mb-6">
                    Select your target colleges so we can build your
                    requirements.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/addCollege")}
                    className="px-8 py-3 bg-[#82A7A6] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Go to Universities
                  </button>
                </div>
              )}
            </div>
          </div>

          {initialUnassigned.length > 0 && (
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm lg:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-slate-800 text-lg">
                  Remaining Unscheduled Courses
                </h3>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                {initialUnassigned.length} course
                {initialUnassigned.length !== 1 ? "s" : ""} not yet scheduled
              </p>
              <div className="space-y-2">
                {initialUnassigned.map((course) => (
                  <div
                    key={course.canonicalId}
                    className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 text-sm">
                      {course.localCode}
                    </span>
                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5">
                      {course.units} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
