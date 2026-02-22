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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="w-10 h-10 rounded-[10px] border border-border bg-card" aria-hidden />
    );
  }

  const Icon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-[10px] border border-border bg-card flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors shadow-sm"
        aria-label="Theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Icon className="w-5 h-5" />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 min-w-[120px] py-1.5 rounded-[10px] bg-card border border-border shadow-lg z-50"
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
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:bg-muted"
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
