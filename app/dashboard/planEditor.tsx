"use client";

import React, { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, X, Save } from "lucide-react";

import { Semester, CollegeCourse, PlannedCourse } from "@/lib/planner/types";
import { checkPrerequisites } from "@/lib/planner/validator";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { saveStudentPlan } from "./actions";

interface PlanEditorProps {
  initialSemesters: Semester[];
  onExit: () => void;
}

export default function PlanEditor({
  initialSemesters,
  onExit,
}: PlanEditorProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [isSaving, setIsSaving] = useState(false);

  // Check if current state differs from initial to show Save button
  const isDirty = useMemo(
    () => JSON.stringify(semesters) !== JSON.stringify(initialSemesters),
    [semesters, initialSemesters]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddTerm = () => {
    const lastSem = semesters[semesters.length - 1];
    const newYear =
      lastSem.season === "spring" ? lastSem.year : lastSem.year + 1;
    const newSeason = lastSem.season === "fall" ? "spring" : "fall";

    setSemesters([
      ...semesters,
      {
        name: `${
          newSeason.charAt(0).toUpperCase() + newSeason.slice(1)
        } ${newYear}`,
        season: newSeason,
        year: newYear,
        maxUnits: 18,
        courses: [],
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const flatData = semesters.flatMap((sem) =>
      sem.courses.map((c, i) => ({
        semesterName: sem.name,
        courseCode: c.localCode,
        order: i,
      }))
    );

    await saveStudentPlan(flatData);
    setIsSaving(false);
    onExit();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black">Course Planning</h1>
          <p className="text-slate-500 text-sm">
            Drag and drop courses to plan your semesters
          </p>
        </div>

        <div className="flex gap-3">
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#303AB2] text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
          <button
            onClick={onExit}
            className="px-6 py-2 bg-white border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all"
          >
            Escape Edit Mode
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {semesters.map((semester, sIdx) => (
          <div
            key={semester.name}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col min-h-[400px]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800">{semester.name}</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {semester.courses.reduce((sum, c) => sum + c.units, 0)} /{" "}
                {semester.maxUnits} Units
              </span>
            </div>

            <div className="p-4 space-y-3 flex-1">
              {semester.courses.map((course) => {
                const catalogData = DVC_CATALOG.find(
                  (c) => c.canonicalId === course.canonicalId
                );
                const { isValid, missing } = checkPrerequisites(
                  catalogData!,
                  sIdx,
                  semesters
                );

                return (
                  <div
                    key={course.canonicalId}
                    className={`group p-4 border-2 rounded-2xl transition-all cursor-grab active:cursor-grabbing shadow-sm ${
                      isValid
                        ? "border-emerald-100 bg-emerald-50/30 hover:border-emerald-400"
                        : "border-red-200 bg-red-50/50 hover:border-red-400"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-tighter ${
                          isValid ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {course.localCode}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {course.units} Units
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">
                      {course.title}
                    </h4>

                    {!isValid && (
                      <div className="mt-2 pt-2 border-t border-red-100">
                        <p className="text-[9px] font-black text-red-500 uppercase">
                          ⚠️ Missing Prereqs: {missing.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="border-2 border-dashed border-slate-100 rounded-2xl h-24 flex items-center justify-center text-slate-300 text-xs font-medium">
                Drop courses here
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddTerm}
          className="h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-[#303AB2] hover:border-[#303AB2] hover:bg-indigo-50/30 transition-all group"
        >
          <div className="p-3 rounded-full bg-slate-50 group-hover:bg-indigo-100 transition-all">
            <Plus size={32} />
          </div>
          <span className="font-bold uppercase tracking-widest text-xs">
            Add Term
          </span>
        </button>
      </div>
    </div>
  );
}
