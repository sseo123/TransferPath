"use client";

import React, { useState } from "react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import PlanEditor from "./planEditor";
import { logout } from "./actions";
import { 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
} from "lucide-react";
import { DVC_CATALOG } from "@/data/cc/dvc";

interface DashboardClientProps {
  initialSemesters: Semester[];
  dbUser: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    targetUni: string | null;
    major: string | null;
    currentCollege: string | null;
    transferEdge: string | null;
  };
}

// --- Accordion Component ---
function SemesterAccordionItem({
  semester,
  dbUser,
  onEdit,
}: {
  semester: Semester;
  dbUser: DashboardClientProps["dbUser"];
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
              {semester.courses.map((course) => (
                <RowItem key={course.canonicalId} course={course} dbUser={dbUser} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RowItem({ course, dbUser }: { course: PlannedCourse, dbUser: DashboardClientProps["dbUser"] }) {
  const catalogData = DVC_CATALOG.find(c => c.canonicalId === course.canonicalId);
  const prerequisites = catalogData?.prerequisites || [];

  return (
    <div className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-slate-900 leading-tight">
          {course.localCode}
        </span>
        <span className="text-slate-500 font-medium">
          {course.title}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Badges */}
        <div className="flex gap-2">
            {course.isCritical && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200">
                    Required: {dbUser.targetUni}
                </span>
            )}
            
            {prerequisites.length > 0 && (
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                    PREREQ FOR NEXT
                 </span>
            )}
             {!course.isCritical && (
                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                    {course.units} Units
                </span>
             )}
        </div>

        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  )
}

export default function DashboardClient({
  initialSemesters,
  dbUser,
}: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);

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
      <div className="max-w-5xl mx-auto p-8 font-sans text-slate-900">
        {/* User Welcome Header */}
        <header className="mb-12 flex justify-between items-end border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome, {dbUser.firstName}!
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Transferring to{" "}
              <span className="text-indigo-600 font-bold">
                {dbUser.targetUni}
              </span>{" "}
              for <span className="text-slate-900">{dbUser.major}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-[#303AB2] hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              Edit Courses
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
        </header>

        {/* Timeline Section */}
        <header className="mb-6 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-800">
              Your Strategic Timeline
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
            >
              Add Term
            </button>
        </header>

        <div className="space-y-6">
          {initialSemesters.map((semester) => (
            <SemesterAccordionItem
              key={semester.name}
              semester={semester}
              dbUser={dbUser}
              onEdit={() => setIsEditing(true)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
