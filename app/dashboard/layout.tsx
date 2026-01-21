"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, ChevronLeft, ChevronRight, LogOut, } from "lucide-react";
import { logout } from "./actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userManuallyClosed = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 1024) {
        setIsCollapsed(true);
      } else {
        if (!userManuallyClosed.current) {
          setIsCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      if (window.innerWidth >= 1024) {
        userManuallyClosed.current = newState === true;
      }
      return newState;
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/dashboard/addCollege",
      label: "Universities",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 
          ${isCollapsed ? "w-0 lg:w-16 overflow-hidden border-none lg:border-solid" : "w-64"}
        `}
      >
        <div
          className={`flex items-center p-4 min-h-[80px] ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {!isCollapsed && (
            <h1 className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap px-2">
              TransferPath
            </h1>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all
              ${isCollapsed ? "fixed left-4 top-6 bg-white shadow-sm lg:static lg:shadow-none" : "static"}
            `}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-103 active:scale-100 hover:shadow-xl ${
                  isActive
                    ? "bg-[#82A7A6] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                } ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-semibold text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all ${
                isCollapsed ? "lg:justify-center lg:px-0" : ""
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
                  <span className="font-semibold text-sm">Sign Out</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </aside>

      <main
        className={`flex-1 transition-all duration-300 min-w-0 ${isCollapsed ? "ml-0 lg:ml-16" : "ml-64"}`}
      >
        <div className={`p-8 ${isCollapsed ? "pt-24 lg:pt-8" : "pt-8"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
