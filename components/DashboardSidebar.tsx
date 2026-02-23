"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarSidebar from "@/app/dashboard/components/CalendarSidebar";
import { ProfileMenu } from "@/components/ProfileMenu";
import { User } from "@/lib/types/user";


export default function DashboardSidebar({ 
  user, 
  isCollapsed, 
  toggleSidebar 
}: { 
  user: User; 
  isCollapsed: boolean;
  toggleSidebar: () => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/dashboard/addCollege",
      label: "Universities",
      icon: GraduationCap,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-card border-r border-border transition-[width] duration-300 flex flex-col z-50 
        ${isCollapsed ? "w-0 lg:w-16 overflow-hidden lg:overflow-visible border-none lg:border-solid" : "w-64"}
      `}
    >
      <div
        className={`flex items-center p-4 min-h-[80px] ${isCollapsed ? "justify-center" : "justify-between"}`}
      >
        {!isCollapsed && (
          <h1 className="text-xl font-black text-foreground tracking-tight whitespace-nowrap px-2">
            Transfer<span className="text-primary">Path</span>
          </h1>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className={`p-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-[background-color,color,transform] duration-200 active:scale-95
              ${isCollapsed ? "fixed left-4 top-6 bg-card shadow-sm lg:static lg:shadow-none" : "static"}
            `}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-[transform,box-shadow,background-color] duration-200 hover:scale-[1.03] active:scale-100 hover:shadow-md ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              } ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-semibold text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}

        {!isCollapsed && (
          <div className="pt-10">
            <CalendarSidebar />
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <ProfileMenu user={user} isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

