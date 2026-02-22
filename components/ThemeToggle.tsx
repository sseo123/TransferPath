"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-[10px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800" aria-hidden />
    );
  }

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-[10px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-300 hover:border-[#82A7A6] hover:text-[#82A7A6] dark:hover:border-[#82A7A6] dark:hover:text-[#82A7A6] transition-colors shadow-sm"
        aria-label="Theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon className="w-5 h-5" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 min-w-[120px] py-1.5 rounded-[10px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg z-50"
          role="menu"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                (theme || "system") === opt.value
                  ? "text-[#82A7A6] bg-[#82A7A6]/10 dark:bg-[#82A7A6]/20"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
