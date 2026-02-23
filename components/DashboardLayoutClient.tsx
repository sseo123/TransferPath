"use client";

import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { User } from "@/lib/types/user";


export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userManuallyClosed = useRef(false);

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

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar 
        user={user} 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />

      <main
        className={`flex-1 transition-[margin] duration-300 min-w-0 bg-background ${isCollapsed ? "ml-0 lg:ml-16" : "ml-64"}`}
      >
        <div className={`p-8 ${isCollapsed ? "pt-24 lg:pt-8" : "pt-8"}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
