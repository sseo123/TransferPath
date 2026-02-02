"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, GraduationCap, Plus } from "lucide-react";
import AddTargetModal from "./addTargetModal";
import { removeTargetCollege } from "../actions";

interface UniversitiesClientProps {
  targets: {
    id: string;
    university: string;
    major: string;
  }[];
  availableUniversities: string[];
  majorsByUniversity: Record<string, string[]>;
}

export default function UniversitiesClient({
  targets,
  availableUniversities,
  majorsByUniversity,
}: UniversitiesClientProps) {
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const router = useRouter();

  const handleRemoveTarget = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to remove this target college? This will wipe all plan data and regenerate from the original requirements.",
      )
    ) {
      await removeTargetCollege(id);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        existingTargets={targets}
        availableUniversities={availableUniversities}
        majorsByUniversity={majorsByUniversity}
      />

      <div className="max-w-7xl mx-auto p-8 font-sans text-slate-900">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Target Universities
              </h1>
              <p className="text-slate-500 mt-2 text-lg font-medium">
                Select the universites you wish to transfer to, and the required
                courses will be displayed on your Dashboard!
              </p>
            </div>

            <button
              onClick={() => setIsAddTargetOpen(true)}
              className="px-6 py-2 bg-[#82A7A6] hover:bg-[#6B8A89] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              + Add University
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#82a79d] rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                TARGET SCHOOLS
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {targets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Gray Background Wrapper */}
        <div className="bg-[#f8fafc] rounded-3xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Your Universities
          </h2>

          <div className="space-y-4">
            {targets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <GraduationCap
                  size={48}
                  className="text-slate-300 mx-auto mb-4"
                />
                <p className="text-slate-500 font-medium">
                  No target universities yet. Add one to get started!
                </p>
              </div>
            ) : (
              targets.map((target) => (
                <div
                  key={target.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#82a79d] rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {target.university}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {target.major}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveTarget(target.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Remove target"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setIsAddTargetOpen(true)}
            className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-400 transition-all group mt-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f1f5f9] rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                <Plus size={24} className="text-slate-600" />
              </div>
              <span className="text-lg font-bold text-slate-600">
                Add University
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
