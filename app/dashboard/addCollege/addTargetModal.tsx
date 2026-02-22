"use client";

import React, { useState } from "react";
import { X, Plus, School, BookOpen } from "lucide-react";

interface AddTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTargets: { university: string; major: string }[];
  pendingAdds: { university: string; major: string }[];
  availableUniversities: string[];
  majorsByUniversity: Record<string, string[]>;
  onAdd: (item: { university: string; major: string }) => void;
}

export default function AddTargetModal({
  isOpen,
  onClose,
  existingTargets,
  pendingAdds,
  availableUniversities,
  majorsByUniversity,
  onAdd,
}: AddTargetModalProps) {
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const allTaken = [...existingTargets, ...pendingAdds];
  const availableMajors = university
    ? majorsByUniversity[university] || []
    : [];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!university || !major) return;

    if (allTaken.some((t) => t.university === university)) {
      alert(
        "You have already added this university. To change major, please remove it first.",
      );
      return;
    }

    onAdd({ university, major });
    setUniversity("");
    setMajor("");
    setJustAdded(true);
  };

  const handleAddAnother = () => {
    setJustAdded(false);
  };

  const handleDone = () => {
    setJustAdded(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
        <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {justAdded ? "Added! Add another?" : "Select a University to Add"}
            </h2>
            {!justAdded && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                <b>WARNING:</b> Saving changes will reset any edited courses
                and regenerate the plan from the original requirements.
              </p>
            )}
          </div>
          <button
            onClick={handleDone}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors -mt-1"
          >
            <X size={20} />
          </button>
        </header>

        {justAdded ? (
          <div className="p-6 flex flex-col gap-3">
            <p className="text-slate-600 dark:text-slate-400">You can add more universities or save when you&apos;re done.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddAnother}
                className="flex-1 px-5 py-2.5 bg-[#82A7A6] text-white font-bold rounded-xl shadow-lg shadow-[#82A7A6]/30 hover:bg-[#6B8A89] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add another
              </button>
              <button
                type="button"
                onClick={handleDone}
                className="flex-1 px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <School size={16} className="text-[#82A7A6]" />
                University
              </label>
              <select
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  setMajor("");
                }}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] font-medium text-slate-700 dark:text-white transition-all"
                required
              >
                <option value="">Select University</option>
                {availableUniversities.map((uni) => (
                  <option
                    key={uni}
                    value={uni}
                    disabled={allTaken.some((t) => t.university === uni)}
                  >
                    {uni}{" "}
                    {allTaken.some((t) => t.university === uni) ? "(Added)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen size={16} className="text-[#82A7A6]" />
                Major
              </label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82A7A6]/20 focus:border-[#82A7A6] font-medium text-slate-700 dark:text-white transition-all"
                required
                disabled={!university || availableMajors.length === 0}
              >
                <option value="">
                  {!university
                    ? "Select University First"
                    : availableMajors.length === 0
                      ? "No Majors Available"
                      : "Select Major"}
                </option>
                {availableMajors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDone}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!university || !major}
                className="px-6 py-2.5 bg-[#82A7A6] text-white font-bold rounded-xl shadow-lg shadow-[#82A7A6]/30 hover:bg-[#6B8A89] disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                Add College
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
