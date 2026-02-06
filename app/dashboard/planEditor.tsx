"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Save, Trash2, Info } from "lucide-react";
import { Semester, PlannedCourse } from "@/lib/planner/types";
import { checkPrerequisites } from "@/lib/planner/validator";
import { calculateTotalUnits, getUnitLimit } from "@/lib/planner/utils";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { saveStudentPlan, saveCompletedCourses } from "./actions";
import CourseItem from "@/components/CourseItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PlanEditorProps {
  initialSemesters: Semester[];
  initialUnassigned: PlannedCourse[];
  initialCompletedCourses: PlannedCourse[];
  initialCustomCourses: PlannedCourse[];
  targetUniversities: { name: string; code: string }[];
  onExit: () => void;
}

function getCourseLocation(
  courseId: string,
  semesters: Semester[],
  unassigned: PlannedCourse[],
  completed: PlannedCourse[],
): { container: string; index: number } | null {
  const completedIdx = completed.findIndex((c) => c.canonicalId === courseId);
  if (completedIdx !== -1) {
    return { container: "completed", index: completedIdx };
  }

  const unassignedIdx = unassigned.findIndex((c) => c.canonicalId === courseId);
  if (unassignedIdx !== -1) {
    return { container: "sidebar", index: unassignedIdx };
  }

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
  completed: PlannedCourse[],
): {
  semesters: Semester[];
  unassigned: PlannedCourse[];
  completed: PlannedCourse[];
} | null {
  const sourceLocation = getCourseLocation(
    courseId,
    semesters,
    unassigned,
    completed,
  );
  if (!sourceLocation) return null;

  if (sourceLocation.container === targetContainer) {
    return { semesters, unassigned, completed };
  }

  let course: PlannedCourse | null = null;
  if (sourceLocation.container === "sidebar") {
    course = unassigned[sourceLocation.index];
  } else if (sourceLocation.container === "completed") {
    course = completed[sourceLocation.index];
  } else {
    const sem = semesters.find((s) => s.name === sourceLocation.container);
    if (sem) {
      course = sem.courses[sourceLocation.index];
    }
  }

  if (!course) return null;

  const newUnassigned = [...unassigned];
  const newCompleted = [...completed];
  const newSemesters = semesters.map((s) => ({
    ...s,
    courses: [...s.courses],
  }));

  if (sourceLocation.container === "sidebar") {
    newUnassigned.splice(sourceLocation.index, 1);
  } else if (sourceLocation.container === "completed") {
    newCompleted.splice(sourceLocation.index, 1);
  } else {
    const semIdx = newSemesters.findIndex(
      (s) => s.name === sourceLocation.container,
    );
    if (semIdx !== -1) {
      newSemesters[semIdx].courses.splice(sourceLocation.index, 1);
    }
  }

  if (targetContainer === "sidebar") {
    newUnassigned.push(course);
  } else if (targetContainer === "completed") {
    newCompleted.push(course);
  } else {
    const targetSemIdx = newSemesters.findIndex(
      (s) => s.name === targetContainer,
    );
    if (targetSemIdx !== -1) {
      newSemesters[targetSemIdx].courses.push(course);
    }
  }

  return {
    semesters: newSemesters,
    unassigned: newUnassigned,
    completed: newCompleted,
  };
}

function reorderCourseInContainer(
  courseId: string,
  targetCourseId: string,
  semesters: Semester[],
  unassigned: PlannedCourse[],
  completed: PlannedCourse[],
): {
  semesters: Semester[];
  unassigned: PlannedCourse[];
  completed: PlannedCourse[];
} | null {
  const sourceLocation = getCourseLocation(
    courseId,
    semesters,
    unassigned,
    completed,
  );
  const targetLocation = getCourseLocation(
    targetCourseId,
    semesters,
    unassigned,
    completed,
  );

  if (!sourceLocation || !targetLocation) return null;
  if (sourceLocation.container !== targetLocation.container) return null;
  if (sourceLocation.index === targetLocation.index) {
    return { semesters, unassigned, completed };
  }

  if (sourceLocation.container === "sidebar") {
    return {
      semesters,
      unassigned: arrayMove(
        unassigned,
        sourceLocation.index,
        targetLocation.index,
      ),
      completed,
    };
  } else if (sourceLocation.container === "completed") {
    return {
      semesters,
      unassigned,
      completed: arrayMove(
        completed,
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
    return { semesters: newSemesters, unassigned, completed };
  }
}

function CreateCourseModal({
  isOpen,
  onClose,
  onCreate,
  targetUniversities,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    localCode: string;
    title: string;
    units: number;
    requiredBy: string[];
  }) => void;
  targetUniversities: { name: string; code: string }[];
}) {
  const [localCode, setLocalCode] = useState("");
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState(3.0);
  const [requiredBy, setRequiredBy] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localCode.trim() || !title.trim()) {
      setError("Course code and title are required.");
      return;
    }
    if (units < 0.5 || units > 6) {
      setError("Units must be between 0.5 and 6.");
      return;
    }
    onCreate({ localCode: localCode.trim(), title: title.trim(), units, requiredBy });
    setLocalCode("");
    setTitle("");
    setUnits(3.0);
    setRequiredBy([]);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Add Custom Course</h2>
            <p className="text-slate-500 text-sm mt-1">Courses not found in the DVC catalog</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Trash2 size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Note: Custom courses won&apos;t have prerequisite validation. Please ensure you&apos;ve met any requirements before enrolling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Course Code</label>
              <input
                autoFocus
                type="text"
                value={localCode}
                onChange={(e) => setLocalCode(e.target.value)}
                placeholder="e.g., MATH 999"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Units</label>
              <input
                type="number"
                min="0"
                max="10"
                step="1"
                value={units}
                onChange={(e) => setUnits(parseFloat(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Course Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Calculus"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-bold text-slate-800"
            />
          </div>

          {targetUniversities.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Required By Universities</label>
              <div className="grid grid-cols-2 gap-2">
                {targetUniversities.map((uni) => (
                  <label key={uni.code} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={requiredBy.includes(uni.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRequiredBy([...requiredBy, uni.code]);
                        } else {
                          setRequiredBy(requiredBy.filter(c => c !== uni.code));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-bold text-slate-700">{uni.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-xl transition-all active:scale-95"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function SortableCourse({
  course,
  isValid,
  missing,
  isSidebar = false,
  onDelete,
}: {
  course: PlannedCourse;
  isValid: boolean;
  missing: string[];
  isSidebar?: boolean;
  onDelete?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.canonicalId });

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
      <CourseItem
        course={course}
        isValid={isValid}
        missing={missing}
        isSidebar={isSidebar}
        onDelete={onDelete}
      />
    </div>
  );
}

function DroppableSemester({
  semester,
  sIdx,
  onDelete,
  onDeleteCourse,
  allSemesters,
  completedCourses,
}: {
  semester: Semester;
  sIdx: number;
  onDelete: () => void;
  onDeleteCourse: (canonicalId: string) => void;
  allSemesters: Semester[];
  completedCourses: PlannedCourse[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: semester.name,
  });

  const totalUnits = calculateTotalUnits(semester.courses);
  const maxUnits = getUnitLimit(semester.season);
  const isOverLimit = totalUnits > maxUnits;

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
              if (course.isCustom) {
                return (
                  <SortableCourse
                    key={course.canonicalId}
                    course={course}
                    isValid={true}
                    missing={[]}
                    onDelete={() => onDeleteCourse(course.canonicalId)}
                  />
                );
              }

              const catalogData = DVC_CATALOG.find(
                (c) => c.canonicalId === course.canonicalId,
              );

              if (!catalogData) {
                return (
                  <div key={course.canonicalId} className="p-4 border-2 border-red-200 bg-red-50 rounded-2xl mb-3">
                    <p className="text-xs font-bold text-red-600 uppercase">
                      ⚠️ Missing from Catalog
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {course.localCode}
                    </p>
                  </div>
                );
              }
              const { isValid, missing } = checkPrerequisites(
                catalogData,
                sIdx,
                allSemesters,
                completedCourses,
              );
              return (
                <SortableCourse
                  key={course.canonicalId}
                  course={course}
                  isValid={isValid}
                  missing={missing}
                  onDelete={() => onDeleteCourse(course.canonicalId)}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function Sidebar({ 
  courses,
  onDeleteCourse,
}: { 
  courses: PlannedCourse[];
  onDeleteCourse: (canonicalId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "sidebar",
  });

  const courseIds = courses.map((c) => c.canonicalId);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-fit min-h-[400px] w-65 bg-white rounded-3xl border-2 p-5 transition-all ${
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
            <div className="border-2 border-dashed border-slate-100 rounded-2xl h-50 flex items-center justify-center text-slate-300 text-xs font-medium text-center p-2">
              Deleted courses will appear here. Drag and drop to add them back or delete them.
            </div>
          ) : (
            courses.map((course) => (
              <SortableCourse
                key={course.canonicalId}
                course={course}
                isValid={true}
                missing={[]}
                isSidebar={true}
                onDelete={() => onDeleteCourse(course.canonicalId)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function CompletedCoursesBox({ 
  courses,
  onDeleteCourse,
}: { 
  courses: PlannedCourse[];
  onDeleteCourse: (canonicalId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "completed",
  });

  const courseIds = courses.map((c) => c.canonicalId);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-fit min-h-[400px] w-65 bg-white rounded-3xl border-2 p-5 transition-all mt-4 ${
        isOver ? "border-[#82A7A6] ring-4 ring-teal-50" : "border-slate-200"
      }`}
    >
      <h3 className="font-black text-slate-800 text-lg mb-2">
        Completed Courses
      </h3>
      <div className="space-y-3 flex-1">
        <SortableContext
          items={courseIds}
          strategy={verticalListSortingStrategy}
        >
          {courses.length === 0 ? (
            <div className="border-2 border-dashed border-slate-100 rounded-2xl h-50 flex items-center justify-center text-slate-300 text-xs font-medium text-center p-2">
              Drag completed courses here: Courses you&apos;ve already taken, AP credits, etc.
            </div>
          ) : (
            courses.map((course) => (
              <SortableCourse
                key={course.canonicalId}
                course={course}
                isValid={true}
                missing={[]}
                isSidebar={true}
                onDelete={() => onDeleteCourse(course.canonicalId)}
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
  initialCompletedCourses,
  initialCustomCourses,
  targetUniversities,
  onExit,
}: PlanEditorProps) {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [unassigned, setUnassigned] =
    useState<PlannedCourse[]>(initialUnassigned);
  const [completed, setCompleted] = useState<PlannedCourse[]>(
    initialCompletedCourses,
  );
  const [customCourses, setCustomCourses] = useState<PlannedCourse[]>(initialCustomCourses);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  const [activeCourse, setActiveCourse] = useState<PlannedCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  const pendingOperationRef = useRef<{
    type: "move" | "reorder";
    courseId: string;
    target: string;
  } | null>(null);

  const isDirty =
    JSON.stringify(semesters) !== JSON.stringify(initialSemesters) ||
    unassigned.length > 0 ||
    JSON.stringify(completed) !== JSON.stringify(initialCompletedCourses) ||
    JSON.stringify(customCourses) !== JSON.stringify(initialCustomCourses);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
        completed,
      );
      if (result) {
        setSemesters(result.semesters);
        setUnassigned(result.unassigned);
        setCompleted(result.completed);
      }
    } else if (operation.type === "reorder") {
      const result = reorderCourseInContainer(
        operation.courseId,
        operation.target,
        semesters,
        unassigned,
        completed,
      );
      if (result) {
        setSemesters(result.semesters);
        setUnassigned(result.unassigned);
        setCompleted(result.completed);
      }
    }
  }, [triggerUpdate]);

  const handleDeleteCourse = useCallback(
    (canonicalId: string, location: 'semester' | 'sidebar' | 'completed') => {
      if (location === 'semester' || location === 'completed') {
        const result = moveCourseToContainer(canonicalId, 'sidebar', semesters, unassigned, completed);
        if (result) {
          setSemesters(result.semesters);
          setUnassigned(result.unassigned);
          setCompleted(result.completed);
        }
      } else {
        // location === 'sidebar'
        const courseToDelete = unassigned.find(c => c.canonicalId === canonicalId);
        setUnassigned(prev => prev.filter(c => c.canonicalId !== canonicalId));
        if (courseToDelete?.isCustom) {
          setCustomCourses(prev => prev.filter(c => c.canonicalId !== canonicalId));
        }
      }
    },
    [semesters, unassigned, completed]
  );

  const handleCreateCourse = (courseData: {
    localCode: string;
    title: string;
    units: number;
    requiredBy: string[];
  }) => {
    const newCourse: PlannedCourse = {
      canonicalId: `custom-${crypto.randomUUID()}`,
      localCode: courseData.localCode,
      title: courseData.title,
      units: courseData.units,
      isCritical: courseData.requiredBy.length > 0,
      requiredBy: courseData.requiredBy,
      isCustom: true,
    };

    setCustomCourses((prev) => [...prev, newCourse]);
    setUnassigned((prev) => [...prev, newCourse]);
    setShowCreateCourseModal(false);
  };

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const courseId = event.active.id as string;
      const location = getCourseLocation(
        courseId,
        semesters,
        unassigned,
        completed,
      );

      if (location) {
        let course: PlannedCourse | null = null;
        if (location.container === "sidebar") {
          course = unassigned[location.index];
        } else if (location.container === "completed") {
          course = completed[location.index];
        } else {
          const sem = semesters.find((s) => s.name === location.container);
          if (sem) course = sem.courses[location.index];
        }
        setActiveCourse(course);
      }
    },
    [semesters, unassigned, completed],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveCourse(null);

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeLocation = getCourseLocation(
        activeId,
        semesters,
        unassigned,
        completed,
      );
      if (!activeLocation) return;

      const isSemesterDrop = semesters.some((s) => s.name === overId);
      const isSidebarDrop = overId === "sidebar";
      const isCompletedDrop = overId === "completed";

      if (isSemesterDrop || isSidebarDrop || isCompletedDrop) {
        const targetContainer = isSidebarDrop
          ? "sidebar"
          : isCompletedDrop
            ? "completed"
            : overId;
        if (activeLocation.container !== targetContainer) {
          pendingOperationRef.current = {
            type: "move",
            courseId: activeId,
            target: targetContainer,
          };
          setTriggerUpdate((prev) => prev + 1);
        }
      } else {
        const overLocation = getCourseLocation(
          overId,
          semesters,
          unassigned,
          completed,
        );
        if (overLocation) {
          if (activeLocation.container === overLocation.container) {
            pendingOperationRef.current = {
              type: "reorder",
              courseId: activeId,
              target: overId,
            };
            setTriggerUpdate((prev) => prev + 1);
          } else {
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
    [semesters, unassigned, completed],
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
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

      const customCoursesData = customCourses.map((c) => ({
        localCode: c.localCode,
        title: c.title,
        units: c.units,
        requiredBy: c.requiredBy || [],
      }));

      const completedCourseCodes = completed
        .map((c) => c.localCode)
        .filter(Boolean);

      console.log("Saving plan with custom courses");

      try {
        await saveStudentPlan([...flatData, ...unassignedData], customCoursesData);
        console.log("Plan and custom courses saved successfully");
      } catch (planError) {
        console.error("Plan save error:", planError);
        throw new Error("Failed to save plan");
      }

      try {
        await saveCompletedCourses(completedCourseCodes);
        console.log("Completed courses saved successfully");
      } catch (completedError) {
        console.error("Completed courses save error:", completedError);
        throw new Error("Failed to save completed courses");
      }

      setIsSaving(false);
      onExit();
    } catch (error) {
      console.error("Error saving:", error);
      setIsSaving(false);
      alert(
        `Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
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
      <div className="min-h-screen bg-white p-4 md:p-8 font-sans">
        {/* HEADER FIX: Added flex-wrap and items-start for small screens */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Course Planning
            </h1>
            <p className="text-slate-500 text-sm">
              Draft your plan. Changes only save when you click &quot;Save
              Changes&quot;.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-[#82A7A6] text-white font-bold rounded-xl shadow-lg hover:bg-[#6B8A89] transition-all disabled:opacity-50 whitespace-nowrap flex-1 sm:flex-none"
              >
                <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
            <button
              onClick={() => setShowCreateCourseModal(true)}
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-all whitespace-nowrap flex-1 sm:flex-none"
            >
              + Add Custom Course
            </button>
            <button
              onClick={onExit}
              className="px-6 py-2 bg-white border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all whitespace-nowrap flex-1 sm:flex-none"
            >
              Escape Edit Mode
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* SIDEBAR FIX: Changed to Grid for side-by-side mobile view */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-4 w-full lg:w-auto">
            <Sidebar 
              courses={unassigned} 
              onDeleteCourse={(id) => handleDeleteCourse(id, 'sidebar')} 
            />
            <CompletedCoursesBox 
              courses={completed} 
              onDeleteCourse={(id) => handleDeleteCourse(id, 'completed')}
            />
          </div>

          <div className="flex-1 w-full flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
              {semesters.map((semester, sIdx) => (
                <DroppableSemester
                  key={semester.name}
                  semester={semester}
                  sIdx={sIdx}
                  onDelete={() => handleDeleteSemester(semester.name)}
                  onDeleteCourse={(id) => handleDeleteCourse(id, 'semester')}
                  allSemesters={semesters}
                  completedCourses={completed}
                />
              ))}
            </div>

            <button
              onClick={handleAddTerm}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:bg-white hover:border-slate-300 transition-all mb-10"
            >
              + Add Term
            </button>

            <footer className="w-full text-center pb-6">
              <p className="text-[12px] text-slate-500/80 font-medium tracking-tight">
                Academic departments may not offer summer courses for all
                requirements. Verify availability with a counselor and confirm
                articulation on{" "}
                <a
                  href="https://assist.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-slate-300 underline-offset-2 hover:text-slate-800 transition-colors"
                >
                  Assist.org
                </a>
              </p>
            </footer>
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
          <CourseItem course={activeCourse} isOverlay={true} />
        ) : null}
      </DragOverlay>
      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
        onCreate={handleCreateCourse}
        targetUniversities={targetUniversities}
      />
    </DndContext>
  );
}
