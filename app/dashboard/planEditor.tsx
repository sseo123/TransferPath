"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import { checkPrerequisites } from "@/lib/planner/validator";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { saveStudentPlan } from "./actions";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDroppable, DragOverlay, defaultDropAnimationSideEffects, } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PlanEditorProps {
  initialSemesters: Semester[];
  initialUnassigned: PlannedCourse[];
  onExit: () => void;
}

// PURE HELPER FUNCTIONS (No React, No Side Effects)
function getCourseLocation(
  courseId: string,
  semesters: Semester[],
  unassigned: PlannedCourse[],
): { container: string; index: number } | null {
  // Check unassigned first
  const unassignedIdx = unassigned.findIndex((c) => c.canonicalId === courseId);
  if (unassignedIdx !== -1) {
    return { container: "sidebar", index: unassignedIdx };
  }

  // Check semesters
  for (const semester of semesters) {
    const courseIdx = semester.courses.findIndex(
      (c) => c.canonicalId === courseId,
    );
    if (courseIdx !== -1) {
      return { container: semester.name, index: courseIdx };
    }
  }

  return null;
}

function moveCourseToContainer(
  courseId: string,
  targetContainer: string,
  semesters: Semester[],
  unassigned: PlannedCourse[],
): { semesters: Semester[]; unassigned: PlannedCourse[] } | null {
  const sourceLocation = getCourseLocation(courseId, semesters, unassigned);
  if (!sourceLocation) return null;

  // Already in target container
  if (sourceLocation.container === targetContainer) {
    return { semesters, unassigned };
  }

  // Find the course object
  let course: PlannedCourse | null = null;
  if (sourceLocation.container === "sidebar") {
    course = unassigned[sourceLocation.index];
  } else {
    const sem = semesters.find((s) => s.name === sourceLocation.container);
    if (sem) {
      course = sem.courses[sourceLocation.index];
    }
  }

  if (!course) return null;

  // Remove from source
  let newUnassigned = [...unassigned];
  let newSemesters = semesters.map((s) => ({ ...s, courses: [...s.courses] }));

  if (sourceLocation.container === "sidebar") {
    newUnassigned.splice(sourceLocation.index, 1);
  } else {
    const semIdx = newSemesters.findIndex(
      (s) => s.name === sourceLocation.container,
    );
    if (semIdx !== -1) {
      newSemesters[semIdx].courses.splice(sourceLocation.index, 1);
    }
  }

  // Add to target
  if (targetContainer === "sidebar") {
    newUnassigned.push(course);
  } else {
    const targetSemIdx = newSemesters.findIndex(
      (s) => s.name === targetContainer,
    );
    if (targetSemIdx !== -1) {
      newSemesters[targetSemIdx].courses.push(course);
    }
  }

  return { semesters: newSemesters, unassigned: newUnassigned };
}

function reorderCourseInContainer(
  courseId: string,
  targetCourseId: string,
  semesters: Semester[],
  unassigned: PlannedCourse[],
): { semesters: Semester[]; unassigned: PlannedCourse[] } | null {
  const sourceLocation = getCourseLocation(courseId, semesters, unassigned);
  const targetLocation = getCourseLocation(
    targetCourseId,
    semesters,
    unassigned,
  );

  if (!sourceLocation || !targetLocation) return null;
  if (sourceLocation.container !== targetLocation.container) return null;
  if (sourceLocation.index === targetLocation.index) {
    return { semesters, unassigned };
  }

  if (sourceLocation.container === "sidebar") {
    return {
      semesters,
      unassigned: arrayMove(
        unassigned,
        sourceLocation.index,
        targetLocation.index,
      ),
    };
  } else {
    const newSemesters = semesters.map((semester) => {
      if (semester.name === sourceLocation.container) {
        return {
          ...semester,
          courses: arrayMove(
            semester.courses,
            sourceLocation.index,
            targetLocation.index,
          ),
        };
      }
      return semester;
    });
    return { semesters: newSemesters, unassigned };
  }
}

// COMPONENTS
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
          className={`text-[10px] font-black uppercase ${
            isSidebar
              ? "text-slate-400"
              : isValid
                ? "text-emerald-500"
                : "text-red-500"
          }`}
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, } 
  = useSortable({ id: course.canonicalId, });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
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
  const { setNodeRef, isOver } = useDroppable({
    id: semester.name,
  });

  const totalUnits = semester.courses.reduce((sum, c) => sum + c.units, 0);
  const maxUnits = semester.season === "summer" ? 12 : 19;
  const isOverLimit = totalUnits > maxUnits;

  // Create stable array of IDs
  const courseIds = semester.courses.map((c) => c.canonicalId);

  return (
    <div
      ref={setNodeRef}
      className={`relative bg-white rounded-3xl border-2 transition-all duration-200 overflow-hidden flex flex-col min-h-[350px] ${
        isOver
          ? "border-[#82A7A6] ring-4 ring-teal-50"
          : isOverLimit
            ? "border-red-400 ring-4 ring-red-50"
            : "border-slate-200"
      }`}
    >
      {isOver && (
        <div className="absolute inset-0 z-10 bg-teal-50/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-full border-2 border-dashed border-[#82A7A6] text-[#82A7A6] font-bold text-sm shadow-sm">
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
            className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${
              isOverLimit ? "text-red-600" : "text-slate-400"
            }`}
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
      {isOverLimit && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-600 text-xs font-bold text-center">
          ⚠️ Counselor approval is needed for more than {maxUnits} units
        </div>
      )}
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
  });

  const courseIds = courses.map((c) => c.canonicalId);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-fit min-h-[500px] w-65 bg-white rounded-3xl border-2 p-5 transition-all ${
        isOver ? "border-[#82A7A6] ring-4 ring-teal-50" : "border-slate-200"
      }`}
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
              Courses from deleted semesters will appear here
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

// MAIN COMPONENT - NEW ARCHITECTURE
export default function PlanEditor({
  initialSemesters,
  initialUnassigned,
  onExit,
}: PlanEditorProps) {
  // State - Single source of truth
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [unassigned, setUnassigned] =
    useState<PlannedCourse[]>(initialUnassigned);
  const [activeCourse, setActiveCourse] = useState<PlannedCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  // Pending operation ref - batches updates to avoid infinite loops
  const pendingOperationRef = useRef<{
    type: "move" | "reorder";
    courseId: string;
    target: string;
  } | null>(null);

  const isDirty =
    JSON.stringify(semesters) !== JSON.stringify(initialSemesters) ||
    unassigned.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Process pending operation after render completes
  useEffect(() => {
    if (!pendingOperationRef.current) return;

    const operation = pendingOperationRef.current;
    pendingOperationRef.current = null;

    if (operation.type === "move") {
      const result = moveCourseToContainer(
        operation.courseId,
        operation.target,
        semesters,
        unassigned,
      );
      if (result) {
        setSemesters(result.semesters);
        setUnassigned(result.unassigned);
      }
    } else if (operation.type === "reorder") {
      const result = reorderCourseInContainer(
        operation.courseId,
        operation.target,
        semesters,
        unassigned,
      );
      if (result) {
        setSemesters(result.semesters);
        setUnassigned(result.unassigned);
      }
    }
  }, [triggerUpdate]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const courseId = event.active.id as string;
      const location = getCourseLocation(courseId, semesters, unassigned);

      if (location) {
        let course: PlannedCourse | null = null;
        if (location.container === "sidebar") {
          course = unassigned[location.index];
        } else {
          const sem = semesters.find((s) => s.name === location.container);
          if (sem) course = sem.courses[location.index];
        }
        setActiveCourse(course);
      }
    },
    [semesters, unassigned],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCourse(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeLocation = getCourseLocation(activeId, semesters, unassigned);
      if (!activeLocation) return;

      // Check if overId is a semester name or sidebar
      const isSemesterDrop = semesters.some((s) => s.name === overId);
      const isSidebarDrop = overId === "sidebar";

      if (isSemesterDrop || isSidebarDrop) {
        // Dropping onto a container
        const targetContainer = isSidebarDrop ? "sidebar" : overId;
        if (activeLocation.container !== targetContainer) {
          // Schedule move operation
          pendingOperationRef.current = {
            type: "move",
            courseId: activeId,
            target: targetContainer,
          };
          setTriggerUpdate((prev) => prev + 1);
        }
      } else {
        // Dropping onto another course - could be reorder or move
        const overLocation = getCourseLocation(overId, semesters, unassigned);
        if (overLocation) {
          if (activeLocation.container === overLocation.container) {
            // Same container - reorder
            pendingOperationRef.current = {
              type: "reorder",
              courseId: activeId,
              target: overId,
            };
            setTriggerUpdate((prev) => prev + 1);
          } else {
            // Different container - move to that container
            pendingOperationRef.current = {
              type: "move",
              courseId: activeId,
              target: overLocation.container,
            };
            setTriggerUpdate((prev) => prev + 1);
          }
        }
      }
    },
    [semesters, unassigned],
  );

  const handleSave = async () => {
    setIsSaving(true);

    const flatData = semesters.flatMap((sem) =>
      sem.courses.map((c, i) => ({
        semesterName: sem.name,
        courseCode: c.localCode,
        order: i,
      })),
    );

    const unassignedData = unassigned.map((c, i) => ({
      semesterName: "unassigned",
      courseCode: c.localCode,
      order: i,
    }));

    await saveStudentPlan([...flatData, ...unassignedData]);

    setIsSaving(false);
    onExit();
  };

  const handleDeleteSemester = useCallback(
    (name: string) => {
      const semToDelete = semesters.find((s) => s.name === name);
      if (!semToDelete) return;

      setSemesters((prev) => prev.filter((s) => s.name !== name));
      if (semToDelete.courses.length > 0) {
        setUnassigned((prev) => [...prev, ...semToDelete.courses]);
      }
    },
    [semesters],
  );

  const handleAddTerm = useCallback(() => {
    setSemesters((prev) => {
      const latest =
        prev.length > 0
          ? prev[prev.length - 1]
          : { season: "fall" as const, year: 2024 };

      let nextSeason: "fall" | "spring" | "summer";
      let nextYear: number;

      if (latest.season === "fall") {
        nextSeason = "spring";
        nextYear = latest.year + 1;
      } else if (latest.season === "spring") {
        nextSeason = "summer";
        nextYear = latest.year;
      } else {
        // summer -> fall
        nextSeason = "fall";
        nextYear = latest.year;
      }

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
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Course Planning
            </h1>
            <p className="text-slate-500 text-sm">
              Draft your plan. Changes only save when you click &quot;Save
              Changes&quot;.
            </p>
          </div>
          <div className="flex gap-3">
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-[#82A7A6] text-white font-bold rounded-xl shadow-lg hover:bg-[#6B8A89] transition-all disabled:opacity-50"
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
          <Sidebar courses={unassigned} />
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
