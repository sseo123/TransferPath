"use client";

import { useState } from "react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import PlanEditor from "./planEditor";
import { logout } from "./actions";
import { ChevronDown, ChevronRight, Pencil, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  initialSemesters: Semester[];
  dbUser: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    startSeason: string | null;
    startYear: number | null;
  };
  targetCount: number;
}

// --- Accordion Component ---
function SemesterAccordionItem({
  semester,
  onEdit,
}: {
  semester: Semester;
  onEdit: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true); // Closed by default to match screenshot
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

          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
            {semester.name}
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">
              {totalUnits} Units
            </span>
          </h2>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-slate-400 hover:text-indigo-600 p-2"
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-slate-100">
          {semester.courses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm italic">
              No courses planned
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {semester.courses.map((course, idx) => (
                <RowItem key={`${course.canonicalId}-${idx}`} course={course} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RowItem({ course }: { course: PlannedCourse }) {
  const getBadgeStyle = (code: string) => {
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-slate-900 leading-tight">
          {course.localCode}
        </span>
        <span className="text-slate-500 font-medium">{course.title}</span>
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
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200">
                Required
              </span>
            ))}

          <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
            {course.units} Units
          </span>
        </div>

        <ChevronRight
          size={20}
          className="text-slate-300 group-hover:text-slate-400 transition-colors"
        />
      </div>
    </div>
  );
}

export default function DashboardClient({
  initialSemesters,
  dbUser,
  targetCount,
}: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const hasTargets = targetCount > 0;

  const handleAction = () => {
    if (hasTargets) {
      setIsEditing(true);
    } else {
      router.push("/dashboard/addCollege");
    }
  };

  if (isEditing) {
    return (
      <PlanEditor
        initialSemesters={initialSemesters}
        onExit={() => setIsEditing(false)}
      />
    );
  }

return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8 font-sans text-slate-900">
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
                onClick={handleAction}
                className={`px-6 py-2 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 ${
                  hasTargets 
                    ? "bg-[#303AB2] hover:bg-[#252c8a] text-white" 
                    : "bg-[#303AB2] hover:bg-[#252c8a] text-white"
                }`}
              >
                {hasTargets ? "Create your own plan" : "Add Universities to Start"}
              </button>
              <form action={logout}>
                <button type="submit" className="...">Sign Out</button>
              </form>
            </div>
          </div>
        </header>

        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-200/60 shadow-inner">
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-2xl font-bold text-slate-800">Your Strategic Timeline</h2>
            <button
              onClick={handleAction}
              className={`px-6 py-2.5 border transition-all shadow-sm text-[15px] font-semibold rounded-xl ${
                hasTargets
                  ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-900"
                  : "bg-white border-slate-200 hover:bg-slate-50 -text-slate-900"
              }`}
            >
              {hasTargets ? "Add Term" : "Add University"}
            </button>
          </div>

          <div className="flex flex-col">
            {hasTargets ? (
              initialSemesters.map((semester) => (
                <SemesterAccordionItem
                  key={semester.name}
                  semester={semester}
                  onEdit={handleAction}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <GraduationCap size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">No universities targeted yet</h3>
                <p className="text-slate-500 max-w-xs mt-2 mb-6">
                  Select your target colleges so we can build your requirements.
                </p>
                <button
                  onClick={() => router.push("/dashboard/addCollege")}
                  className="px-8 py-3 bg-[#303AB2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Go to Universities
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}