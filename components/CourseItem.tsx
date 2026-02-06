"use client";

import { PlannedCourse } from "@/lib/planner/types";
import { Trash2 } from "lucide-react";

interface CourseItemProps {
  course: PlannedCourse;
  variant?: "card" | "row";
  isCompleted?: boolean;
  isSidebar?: boolean;
  isValid?: boolean;
  missing?: string[];
  onDelete?: () => void;
  isOverlay?: boolean;
}

export default function CourseItem({
  course,
  variant = "card",
  isCompleted = false,
  isSidebar = false,
  isValid = true,
  missing = [],
  onDelete,
  isOverlay = false,
}: CourseItemProps) {
  const isCustom = course.isCustom;
  const allUnis = course.requiredBy || [];
  const displayedUnis = allUnis.slice(0, 3);
  const remainingUnis = allUnis.slice(3);
  const remainingCount = remainingUnis.length;

  const getBadgeStyle = () => {
    return "bg-[#7ca1ad] text-white text-[10px] font-bold uppercase tracking-wider rounded-full";
  };

  if (variant === "row") {
    return (
      <div className="group flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold leading-tight ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                {course.localCode}
              </span>
              {isCustom && (
                <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Custom
                </span>
              )}
            </div>

            {(course.isCritical || course.isCustom) && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-bold">·</span>
                <div className="flex gap-1.5 items-center">
                  {allUnis.length > 0 ? (
                    <>
                      {displayedUnis.map((uni) => (
                        <span key={uni} className={`px-2 py-0.5 border ${getBadgeStyle()}`}>
                          {uni}
                        </span>
                      ))}
                      
                      {remainingCount > 0 && (
                        <div className="relative group/tooltip">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full cursor-help">
                            +{remainingCount} more
                          </span>
                          
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col gap-1 bg-[#82A7A6] text-white p-2 rounded-lg shadow-xl z-50 min-w-[120px]">
                            {remainingUnis.map(uni => (
                              <span key={uni} className="text-[10px] font-bold border-b border-white/10 last:border-0 pb-1 last:pb-0">
                                {uni}
                              </span>
                            ))}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#82A7A6]" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : course.isCritical ? (
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-teal-200">
                      Required
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <span className={`font-medium ${isCompleted ? "line-through text-slate-400" : "text-slate-500"}`}>
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-[12px] font-bold uppercase tracking-wider rounded-full text-slate-500">
            {course.units} Units
          </span>
        </div>
      </div>
    );
  }

  // Card Variant (default - used in PlanEditor)
  return (
    <div
      className={`p-4 border-2 rounded-2xl shadow-sm transition-all group relative ${
        isOverlay ? "cursor-grabbing shadow-xl scale-105 z-50" : "cursor-grab"
      } ${
        isSidebar
          ? "bg-slate-50 border-slate-200"
          : isCustom
            ? "border-purple-100 bg-white"
            : isValid
              ? "border-emerald-100 bg-white"
              : "border-red-200 bg-white"
      }`}
    >
      {!isOverlay && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600 active:scale-95"
          title="Delete course"
        >
          <Trash2 size={12} />
        </button>
      )}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase ${
              isSidebar
                ? "text-slate-400"
                : isCustom
                  ? "text-purple-500"
                  : isValid
                    ? "text-emerald-500"
                    : "text-red-500"
            }`}
          >
            {course.localCode}
          </span>
          {isCustom && (
            <span className="bg-purple-100 text-purple-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              Custom
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-300">
          {course.units} Units
        </span>
      </div>
      <h4 className="font-bold text-slate-800 text-sm leading-tight pr-4">
        {course.title}
      </h4>
      {!isCustom && !isValid && !isSidebar && missing.length > 0 && (
        <p className="text-[9px] font-black text-red-500 uppercase mt-2">
          ⚠️ Missing: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}
