"use client";

import { useState, useMemo } from "react";
import { Save, Trash2 } from "lucide-react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import { checkPrerequisites } from "@/lib/planner/validator";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { saveStudentPlan } from "./actions";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, useDroppable, DragOverlay, defaultDropAnimationSideEffects, } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PlanEditorProps {
  initialSemesters: Semester[];
  initialUnassigned: PlannedCourse[];
  onExit: () => void;
}

function moveBetweenContainers(
  semesters: Semester[],
  unassigned: PlannedCourse[],
  activeId: string,
  activeContainer: string,
  overContainer: string,
) {
  let movedCourse: PlannedCourse | undefined;

  if (activeContainer === "sidebar") {
    movedCourse = unassigned.find((c) => c.canonicalId === activeId);
  } else {
    movedCourse = semesters
      .find((s) => s.name === activeContainer)
      ?.courses.find((c) => c.canonicalId === activeId);
  }

  if (!movedCourse) return null;

  // Remove from source
  const newUnassignedSource =
    activeContainer === "sidebar"
      ? unassigned.filter((c) => c.canonicalId !== activeId)
      : [...unassigned];

  const newSemestersSource = semesters.map((s) => ({
    ...s,
    courses:
      s.name === activeContainer
        ? s.courses.filter((c) => c.canonicalId !== activeId)
        : [...s.courses],
  }));

  // Add to destination
  if (overContainer === "sidebar") {
    return {
      semesters: newSemestersSource,
      unassigned: [...newUnassignedSource, movedCourse],
    };
  } else {
    const finalSemesters = newSemestersSource.map((s) =>
      s.name === overContainer
        ? { ...s, courses: [...s.courses, movedCourse] }
        : s,
    );
    return {
      semesters: finalSemesters,
      unassigned: newUnassignedSource,
    };
  }
}

function CourseCard({
  course,
  isValid = true,
  missing = [],
  isOverlay = false,
  isSidebar = false,
}: {
  course: PlannedCourse;
  isValid?: boolean;
  missing?: string[];
  isOverlay?: boolean;
  isSidebar?: boolean;
}) {
  return (
    <div
      className={`p-4 border-2 rounded-2xl shadow-sm transition-all group relative ${
        isOverlay ? "cursor-grabbing shadow-xl scale-105 z-50" : "cursor-grab"
      } ${
        isSidebar
          ? "bg-slate-50 border-slate-200"
          : isValid
            ? "border-emerald-100 bg-white"
            : "border-red-200 bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={`text-[10px] font-black uppercase ${isSidebar ? "text-slate-400" : isValid ? "text-emerald-500" : "text-red-500"}`}
        >
          {course.localCode}
        </span>
        <span className="text-[10px] font-bold text-slate-300">
          {course.units} Units
        </span>
      </div>
      <h4 className="font-bold text-slate-800 text-sm leading-tight pr-4">
        {course.title}
      </h4>
      {!isValid && !isSidebar && missing.length > 0 && (
        <p className="text-[9px] font-black text-red-500 uppercase mt-2">
          ⚠️ Missing: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

function SortableCourse({
  course,
  isValid,
  missing,
  isSidebar = false,
}: {
  course: PlannedCourse;
  isValid: boolean;
  missing: string[];
  isSidebar?: boolean;
}) {
  const sortableData = useMemo(() => ({ course }), [course]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: course.canonicalId,
    data: sortableData,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    // Setting opacity to 0 hides the "original" while you drag the "overlay"
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none select-none mb-3"
    >
      <CourseCard
        course={course}
        isValid={isValid}
        missing={missing}
        isSidebar={isSidebar}
      />
    </div>
  );
}

function DroppableSemester({
  semester,
  sIdx,
  onDelete,
  allSemesters,
}: {
  semester: Semester;
  sIdx: number;
  onDelete: () => void;
  allSemesters: Semester[];
}) {
  const droppableData = useMemo(
    () => ({ type: "semester", semester }),
    [semester],
  );
  const { setNodeRef, isOver } = useDroppable({
    id: semester.name,
    data: droppableData,
  });
  const courseIds = useMemo(
    () => semester.courses.map((c) => c.canonicalId),
    [semester.courses],
  );
  const totalUnits = semester.courses.reduce((sum, c) => sum + c.units, 0);
  const maxUnits = semester.season === "summer" ? 12 : 19;
  const isOverLimit = totalUnits > maxUnits;

  return (
    <div
      ref={setNodeRef}
      className={`relative bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden flex flex-col min-h-[350px] ${isOver ? "border-[#303AB2] ring-4 ring-indigo-50" : isOverLimit ? "border-red-400 ring-4 ring-red-50" : "border-slate-200"}`}
    >
      {isOver && (
        <div className="absolute inset-0 z-10 bg-indigo-50/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-full border-2 border-dashed border-[#303AB2] text-[#303AB2] font-bold text-sm shadow-sm">
            Drop Course Here
          </div>
        </div>
      )}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex flex-col">
          <h3 className="font-black text-slate-800 leading-none">
            {semester.name}
          </h3>
          <span
            className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isOverLimit ? "text-red-600" : "text-slate-400"}`}
          >
            {totalUnits} / {maxUnits} Units
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-4 flex-1">
        <SortableContext
          items={courseIds}
          strategy={verticalListSortingStrategy}
        >
          {semester.courses.length === 0 ? (
            <div className="border-2 border-dashed border-slate-100 rounded-2xl h-32 flex items-center justify-center text-slate-300 text-xs font-medium">
              Drop courses here
            </div>
          ) : (
            semester.courses.map((course) => {
              const catalogData = DVC_CATALOG.find(
                (c) => c.canonicalId === course.canonicalId,
              );
              const { isValid, missing } = checkPrerequisites(
                catalogData!,
                sIdx,
                allSemesters,
              );
              return (
                <SortableCourse
                  key={course.canonicalId}
                  course={course}
                  isValid={isValid}
                  missing={missing}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function Sidebar({ courses }: { courses: PlannedCourse[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "sidebar",
    data: { type: "sidebar" },
  });
  const courseIds = useMemo(() => courses.map((c) => c.canonicalId), [courses]);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-fit min-h-[500px] w-80 bg-white rounded-3xl border-2 p-5 transition-all ${isOver ? "border-[#303AB2] ring-4 ring-indigo-50" : "border-slate-200"}`}
    >
      <h3 className="font-black text-slate-800 text-lg mb-4">
        Required Courses
      </h3>
      <div className="space-y-3 flex-1">
        <SortableContext
          items={courseIds}
          strategy={verticalListSortingStrategy}
        >
          {courses.length === 0 ? (
            <div className="border-2 border-dashed border-slate-100 rounded-2xl h-32 flex items-center justify-center text-slate-300 text-xs font-medium text-center p-4">
              Empty
            </div>
          ) : (
            courses.map((course) => (
              <SortableCourse
                key={course.canonicalId}
                course={course}
                isValid={true}
                missing={[]}
                isSidebar={true}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function PlanEditor({
  initialSemesters,
  initialUnassigned,
  onExit,
}: PlanEditorProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [unassignedCourses, setUnassignedCourses] =
    useState<PlannedCourse[]>(initialUnassigned);
  const [activeCourse, setActiveCourse] = useState<PlannedCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = useMemo(
    () =>
      JSON.stringify(semesters) !== JSON.stringify(initialSemesters) ||
      unassignedCourses.length > 0,
    [semesters, initialSemesters, unassignedCourses],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findContainer = (id: string) => {
    if (unassignedCourses.some((c) => c.canonicalId === id)) return "sidebar";
    const sem = semesters.find((s) =>
      s.courses.some((c) => c.canonicalId === id),
    );
    return sem ? sem.name : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const course = event.active.data.current?.course as PlannedCourse;
    setActiveCourse(course);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = semesters.find((s) => s.name === overId)
      ? overId
      : findContainer(overId) || (overId === "sidebar" ? "sidebar" : null);

    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    // FIX: Perform the move ATOMICALLY
    setSemesters((prevSemesters) => {
      // Pass the LATEST unassignedCourses to the mover
      const result = moveBetweenContainers(
        prevSemesters,
        unassignedCourses, // This is still slightly risky; see "Senior Pro-Tip" below
        activeId,
        activeContainer,
        overContainer,
      );

      if (!result) return prevSemesters;

      // Synchronously update unassigned while we are in the semester setter
      setUnassignedCourses(result.unassigned);
      return result.semesters;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCourse(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeContainer = findContainer(activeId);
    const overContainer =
      overId === "sidebar"
        ? "sidebar"
        : semesters.find((s) => s.name === overId)
          ? overId
          : findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      if (activeContainer === "sidebar") {
        const oldIdx = unassignedCourses.findIndex(
          (c) => c.canonicalId === activeId,
        );
        const newIdx = unassignedCourses.findIndex(
          (c) => c.canonicalId === overId,
        );
        if (oldIdx !== newIdx)
          setUnassignedCourses((prev) => arrayMove(prev, oldIdx, newIdx));
      } else {
        setSemesters((prev) =>
          prev.map((s) => {
            if (s.name === activeContainer) {
              const oldIdx = s.courses.findIndex(
                (c) => c.canonicalId === activeId,
              );
              const newIdx = s.courses.findIndex(
                (c) => c.canonicalId === overId,
              );
              if (oldIdx !== newIdx)
                return { ...s, courses: arrayMove(s.courses, oldIdx, newIdx) };
            }
            return s;
          }),
        );
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Map currently planned courses
    const flatData = semesters.flatMap((sem) =>
      sem.courses.map((c, i) => ({
        semesterName: sem.name,
        courseCode: c.localCode,
        order: i,
      })),
    );

    // Map unassigned courses with the special "unassigned" tag
    const unassignedData = unassignedCourses.map((c, i) => ({
      semesterName: "unassigned",
      courseCode: c.localCode,
      order: i,
    }));

    // Save the combined payload
    await saveStudentPlan([...flatData, ...unassignedData]);

    setIsSaving(false);
    onExit();
  };

  const handleDeleteSemester = (name: string) => {
    const semToDelete = semesters.find((s) => s.name === name);
    if (!semToDelete) return;

    if (semToDelete.courses.length > 0) {
      setUnassignedCourses((prev) => [...prev, ...semToDelete.courses]);
    }
    setSemesters((prev) => prev.filter((s) => s.name !== name));
  };

  const handleAddTerm = () => {
    setSemesters((prev) => {
      const latest =
        prev.length > 0
          ? prev[prev.length - 1]
          : { season: "fall" as const, year: 2024 };
      const nextSeason =
        latest.season === "fall"
          ? "spring"
          : latest.season === "spring"
            ? "summer"
            : "fall";
      const nextYear = latest.season === "fall" ? latest.year + 1 : latest.year;
      const name = `${nextSeason.charAt(0).toUpperCase() + nextSeason.slice(1)} ${nextYear}`;
      return [
        ...prev,
        {
          name,
          season: nextSeason,
          year: nextYear,
          maxUnits: nextSeason === "summer" ? 12 : 19,
          courses: [],
        },
      ];
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Course Planning
            </h1>
            <p className="text-slate-500 text-sm">
              Draft your plan. Changes only save when you click "Save Changes".
            </p>
          </div>
          <div className="flex gap-3">
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-[#303AB2] text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
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

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <Sidebar courses={unassignedCourses} />
          <div className="flex-1 w-full space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {semesters.map((semester, sIdx) => (
                <DroppableSemester
                  key={semester.name}
                  semester={semester}
                  sIdx={sIdx}
                  onDelete={() => handleDeleteSemester(semester.name)}
                  allSemesters={semesters}
                />
              ))}
            </div>
            <button
              onClick={handleAddTerm}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:bg-white hover:border-slate-300 transition-all"
            >
              + Add Term
            </button>
          </div>
        </div>
      </div>
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.5" } },
          }),
        }}
      >
        {activeCourse ? (
          <CourseCard course={activeCourse} isOverlay={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
