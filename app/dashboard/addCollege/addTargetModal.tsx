"use client";

import React, { useState } from "react";
import { X, Plus, School, BookOpen } from "lucide-react";
import { addTargetCollege } from "../actions";

interface AddTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTargets: { university: string; major: string }[];
  availableUniversities: string[];
  majorsByUniversity: Record<string, string[]>;
}

export default function AddTargetModal({
  isOpen,
  onClose,
  existingTargets,
  availableUniversities,
  majorsByUniversity,
}: AddTargetModalProps) {
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available majors for the selected university
  const availableMajors = university
    ? majorsByUniversity[university] || []
    : [];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!university || !major) return;

    // Prevent duplicate university (since we want simple logic for now: 1 major per uni)
    if (existingTargets.some((t) => t.university === university)) {
      alert(
        "You have already added this university. To change major, please remove it first.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addTargetCollege(university, major);
      setUniversity("");
      setMajor("");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to add target college.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            Add Target College
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <School size={16} className="text-indigo-600" />
              University
            </label>
            <select
              value={university}
              onChange={(e) => {
                setUniversity(e.target.value);
                setMajor(""); // Reset major when university changes
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all"
              required
            >
              <option value="">Select University</option>
              {availableUniversities.map((uni) => (
                <option
                  key={uni}
                  value={uni}
                  disabled={existingTargets.some((t) => t.university === uni)}
                >
                  {uni}{" "}
                  {existingTargets.some((t) => t.university === uni)
                    ? "(Added)"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-600" />
              Major
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all"
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
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !university || !major}
              className="px-6 py-2.5 bg-[#303AB2] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <Plus size={18} />
                  Add College
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
