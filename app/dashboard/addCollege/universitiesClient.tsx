"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, GraduationCap, Plus, School, CheckCircle, LayoutDashboard } from "lucide-react";
import AddTargetModal from "./addTargetModal";
import { saveTargetUniversities } from "../actions";

interface UniversitiesClientProps {
  targets: {
    id: string;
    university: string;
    major: string;
  }[];
  availableUniversities: string[];
  majorsByUniversity: Record<string, string[]>;
}

const LOADING_STEPS = [
  { progress: 20, delay: 200 },
  { progress: 45, delay: 400 },
  { progress: 70, delay: 600 },
  { progress: 90, delay: 800 },
  { progress: 100, delay: 1000 },
];

export default function UniversitiesClient({
  targets: serverTargets,
  availableUniversities,
  majorsByUniversity,
}: UniversitiesClientProps) {
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [pendingAdds, setPendingAdds] = useState<{ university: string; major: string }[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveComplete, setSaveComplete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const displayTargets = useMemo(() => {
    const kept = serverTargets.filter((t) => !pendingDeletes.has(t.id));
    // Filter pendingAdds to exclude any that might have just been saved/refreshed into serverTargets
    // although handleSave clears pendingAdds, this provides an extra layer of UI safety
    const filteredPending = pendingAdds.filter(
      (p) => !kept.some((k) => k.university === p.university && k.major === p.major)
    );

    return [
      ...kept.map((t) => ({ ...t, pending: false as const })),
      ...filteredPending.map((p) => ({
        id: `pending-${p.university}-${p.major}`,
        university: p.university,
        major: p.major,
        pending: true as const,
      })),
    ];
  }, [serverTargets, pendingDeletes, pendingAdds]);

  const hasPendingChanges = pendingAdds.length > 0 || pendingDeletes.size > 0;

  const handleAdd = (item: { university: string; major: string }) => {
    setPendingAdds((prev) => [...prev, item]);
  };

  const handleRemove = (item: { id: string; university: string; major: string; pending: boolean }) => {
    if (item.pending) {
      setPendingAdds((prev) => prev.filter((p) => !(p.university === item.university && p.major === item.major)));
    } else {
      setPendingDeletes((prev) => new Set(prev).add(item.id));
    }
  };

  const handleSave = async () => {
    if (!hasPendingChanges) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveProgress(0);

    const finalTargets = serverTargets
      .filter((t) => !pendingDeletes.has(t.id))
      .map((t) => ({ university: t.university, major: t.major }))
      .concat(pendingAdds);

    // Animate progress steps (cool loading animation)
    LOADING_STEPS.forEach(({ progress, delay }) => {
      setTimeout(() => setSaveProgress(progress), delay);
    });

    const minDisplayMs = 1200;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      await Promise.all([
        saveTargetUniversities(finalTargets),
        delay(minDisplayMs),
      ]);
      setSaveProgress(100);
      setIsSaving(false);
      setSaveComplete(true);
      setPendingAdds([]);
      setPendingDeletes(new Set());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
      setIsSaving(false);
      setSaveProgress(0);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const handleAddMoreUniversities = () => {
    setSaveComplete(false);
    router.refresh();
  };

  if (saveComplete) {
    return (
      <div className="min-h-screen bg-white dark:bg-[var(--background)] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#82A7A6]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#82A7A6]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">All set!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Your changes have been saved. View your plan and all courses on the dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBackToDashboard}
              className="w-full px-6 py-4 bg-[#82A7A6] hover:bg-[#6B8A89] text-white font-bold rounded-xl shadow-lg shadow-[#82A7A6]/30 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={20} />
              Back to dashboard
            </button>
            <button
              onClick={handleAddMoreUniversities}
              className="w-full px-6 py-4 border-2 border-[#82A7A6] text-[#82A7A6] dark:border-[#82A7A6] dark:text-[#82A7A6] font-bold rounded-xl hover:bg-[#82A7A6]/10 dark:hover:bg-[#82A7A6]/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add more universities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        existingTargets={serverTargets.filter((t) => !pendingDeletes.has(t.id)).map((t) => ({ university: t.university, major: t.major }))}
        pendingAdds={pendingAdds}
        availableUniversities={availableUniversities}
        majorsByUniversity={majorsByUniversity}
        onAdd={handleAdd}
      />

      {/* Full-screen loading overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#82A7A6]/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#82A7A6] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Saving your universities</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Updating your plan…</p>
              </div>
              <div className="w-full">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#82A7A6] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${saveProgress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 text-center">{saveProgress}%</p>
              </div>
            </div>
          </div>
          {saveError && (
            <p className="mt-4 text-red-500 text-sm font-medium">{saveError}</p>
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto p-8 font-sans text-slate-900 dark:text-slate-100">
        <header className="mb-12">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Target Universities
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">
                Select the universities you wish to transfer to. Add as many as you like, then save to update your plan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddTargetOpen(true)}
                className="px-6 py-2 bg-[#82A7A6] hover:bg-[#6B8A89] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                + Add University
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#82a79d] rounded-xl flex items-center justify-center flex-shrink-0">
              <School size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                TARGET SCHOOLS
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {displayTargets.length}
                {hasPendingChanges && (
                  <span className="text-base font-medium text-slate-500 dark:text-slate-400 ml-2">
                    (unsaved)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#82a79d] dark:bg-[#6d8d8c] rounded-3xl border border-slate-200 dark:border-slate-600 p-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Universities
          </h2>

          <div className="space-y-4">
            {displayTargets.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
                <GraduationCap
                  size={48}
                  className="text-slate-300 dark:text-slate-500 mx-auto mb-4"
                />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No target universities yet. Add one to get started!
                </p>
              </div>
            ) : (
              displayTargets.map((target) => (
                <div
                  key={target.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#82a79d] rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {target.university}
                        </h3>
                        {target.pending && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                            Not saved yet
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {target.major}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(target)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    aria-label="Remove target"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
          {hasPendingChanges ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex flex-col items-center justify-center p-8 border-none rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-400 hover:to-amber-600 shadow-xl shadow-amber-500/30 transition-all group mt-8 disabled:opacity-70 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-950/10 rounded-xl flex items-center justify-center group-hover:bg-amber-950/20 transition-colors">
                  <CheckCircle size={24} className="text-amber-800" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-bold text-amber-950 block">
                    Save Changes
                  </span>
                  <span className="text-sm font-medium text-amber-900/80">
                    Apply updates to your transfer plan
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAddTargetOpen(true)}
              className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/50 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group mt-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Plus size={24} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Add another university
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
