"use client";

import { useState } from "react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import PlanEditor from "./planEditor";
import { logout, removeTargetCollege } from "./actions";
import AddTargetModal from "./addTargetModal";
import { ChevronDown, ChevronRight, Pencil, Plus, X } from "lucide-react";

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
  targets: {
    id: string;
    university: string;
    major: string;
  }[];
  availableUniversities: string[];
  majorsByUniversity: Record<string, string[]>;
}

// --- Accordion Component ---
function SemesterAccordionItem({
  semester,
  onEdit,
}: {
  semester: Semester;
  onEdit: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const totalUnits = semester.courses.reduce((sum, c) => sum + c.units, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {semester.name}
            <span className="text-slate-300 mx-2">·</span>
            <span className="text-slate-500 font-medium text-lg">
              {totalUnits} Units
            </span>
          </h2>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="border-t border-slate-100">
          {semester.courses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium italic">
              No courses planned for this term
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
  // Helper to map university code to badge color/label
  const getBadgeStyle = (code: string) => {
    // Very basic mapping for now
    if (code === "UCB") return "bg-blue-100 text-blue-700 border-blue-200";
    if (code === "UCLA")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
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
          {course.isCritical && (
            // Show specific university requirements
            course.requiredBy && course.requiredBy.length > 0 ? (
              course.requiredBy.map((uni) => (
                <span
                  key={uni}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getBadgeStyle(
                    uni
                  )}`}
                >
                  {uni}
                </span>
              ))
            ) : (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200">
                Required
              </span>
            )
          )}

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
  targets,
  availableUniversities,
  majorsByUniversity,
}: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);

  // Open modal if start term is missing

  const handleRemoveTarget = async (id: string) => {
    if (confirm("Are you sure you want to remove this target college?")) {
      await removeTargetCollege(id);
    }
  };

  // Toggle to the Drag-and-Drop Editor
  if (isEditing) {
    return (
      <PlanEditor
        initialSemesters={initialSemesters}
        onExit={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        existingTargets={targets}
        availableUniversities={availableUniversities}
        majorsByUniversity={majorsByUniversity}
      />

      <div className="max-w-5xl mx-auto p-8 font-sans text-slate-900">
        {/* User Welcome Header */}
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
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-[#303AB2] hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                Create your own plan
              </button>

              <form action={logout}>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Targets List */}
          <div className="flex flex-wrap gap-3 items-center">
            {targets.map((target) => (
              <div
                key={target.id}
                className="flex items-center gap-2 pl-4 pr-2 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
              >
                <span className="font-bold text-slate-700 text-sm">
                  {target.university}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-sm">{target.major}</span>
                <button
                  onClick={() => handleRemoveTarget(target.id)}
                  className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => setIsAddTargetOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full border border-indigo-100 transition-colors"
            >
              <Plus size={16} />
              Add College
            </button>
          </div>
        </header>

        {/* Timeline Section */}
        <header className="mb-6 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-black text-slate-800">
              Your Strategic Timeline
            </h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg">
                Combined View
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
          >
            Edit Plan
          </button>
        </header>

        <div className="space-y-6">
          {initialSemesters.map((semester) => (
            <SemesterAccordionItem
              key={semester.name}
              semester={semester}
              onEdit={() => setIsEditing(true)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

