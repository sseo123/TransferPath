"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { LogOut, Sun, Moon, Monitor, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout, setStartTerm } from "@/app/dashboard/actions";

interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  startSeason: string | null;
  startYear: number | null;
}

export function ProfileMenu({ user, isCollapsed }: { user: User; isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!mounted) return null;

  const initials = (user.firstName ? user.firstName.charAt(0) : user.username.charAt(0)).toUpperCase();

  const seasons = ["fall", "spring", "summer"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  const handleSetTerm = async (season: string, year: number) => {
    try {
      await setStartTerm(season as "fall" | "spring" | "summer", year);
    } catch (error) {
      console.error("Failed to set start term:", error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all hover:bg-muted ${isCollapsed ? "justify-center" : ""}`}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        {!isCollapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.username}
            </p>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -8 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute bottom-full left-0 mb-2 w-72 bg-popover border border-border rounded-2xl shadow-2xl z-[60] overflow-hidden`}
          >
            <div className="p-4 border-b border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {user.username}
              </p>
            </div>

            <div className="p-2 space-y-1">
              {/* Theme Selector */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme</p>
                <div className="grid grid-cols-3 gap-1 bg-secondary p-1 rounded-lg">
                  {[
                    { val: "light", icon: Sun },
                    { val: "dark", icon: Moon },
                    { val: "system", icon: Monitor },
                  ].map(({ val, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => setTheme(val)}
                      className={`flex flex-col items-center justify-center p-2 rounded-md transition-all ${
                        theme === val
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="text-[10px] mt-1 capitalize">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Term Selector */}
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar size={10} /> Start Term
                </p>
                <div className="flex gap-2">
                  <select
                    value={user.startSeason || "fall"}
                    onChange={(e) => handleSetTerm(e.target.value, user.startYear || currentYear)}
                    className="flex-1 bg-secondary text-xs p-2 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-foreground"
                  >
                    {seasons.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    value={user.startYear || currentYear}
                    onChange={(e) => handleSetTerm(user.startSeason || "fall", parseInt(e.target.value))}
                    className="flex-1 bg-secondary text-xs p-2 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none text-foreground"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-border/50">
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
