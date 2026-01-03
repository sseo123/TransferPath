import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateRequest } from "@/lib/auth";

import { logout } from "./actions";

// Logic Imports
import { planningEngine } from "@/lib/planner/engine";
import { DVC_CATALOG } from "@/data/catalogs/dvc";
import { UCB_EECS_REQUIREMENTS } from "@/data/requirements/ucberkeley/ucberkeley-eecs";
import { StudentIntent } from "@/lib/planner/types";

// UI Components
import {
  LogOut,
  Calendar,
  CheckCircle,
  BookOpen,
  TrendingUp,
  MoreVertical,
  Pencil,
  GraduationCap,
} from "lucide-react";

export default async function DashboardPage() {
  const { user } = await validateRequest();
  if (!user) return redirect("/signin");

  const { env } = await getCloudflareContext();
  const db = drizzle((env as Env).DB);

  // 3. Fetch User Intent
  const [userData] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id))
    .limit(1);

  if (!userData || !userData.major) {
    return redirect("/onboarding");
  }

  // 4. Construct Intent Object
  const studentIntent: StudentIntent = {
    firstName: userData.firstName || "Student",
    major: userData.major,
    currentCollege: userData.currentCollege || "DVC",
    targetUniversity: userData.targetUni || "UC Berkeley",
    transferEdge: (userData.transferEdge as any) || "balance",
    startTerm: { season: "fall", year: 2025 },
  };

  // 5. RUN THE ENGINE (Server-Side)
  const plan = planningEngine(
    studentIntent,
    UCB_EECS_REQUIREMENTS,
    DVC_CATALOG
  );

  // This wrapper satisfies the TypeScript requirement for (formData: FormData) => void | Promise<void>
  async function handleLogout(formData: FormData) {
    "use server";
    await logout();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === LEFT COLUMN: HEADER & TIMELINE (8 cols) === */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <header className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {userData.targetUni} Transfer Target
                </h1>
                <p className="text-slate-500 mt-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Applying to {userData.major} • Starting{" "}
                  {studentIntent.startTerm.season}{" "}
                  {studentIntent.startTerm.year}
                </p>
              </div>

              <div className="flex items-center gap-6">
                {/* Sign Out Button - Linked to handleLogout */}
                <form action={handleLogout}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </form>

                <div className="flex flex-col items-end border-l pl-6 border-slate-100">
                  <div
                    className="radial-progress text-emerald-500 text-xs font-bold"
                    style={{ "--value": 45, "--size": "3rem" } as any}
                  >
                    45%
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Ready</span>
                </div>
              </div>
            </div>
          </header>

          {/* Strategic Timeline */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Your Strategic Timeline
              </h2>
              <button className="text-sm text-indigo-600 font-medium hover:underline cursor-pointer">
                View Full Plan
              </button>
            </div>

            <div className="space-y-6">
              {plan.semesters.map((semester) => {
                const semesterUnits = semester.courses.reduce(
                  (sum, c) => sum + c.units,
                  0
                );

                return (
                  <div
                    key={semester.name}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Semester Header */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800">
                          {semester.name}
                        </span>
                        <span className="text-sm text-slate-500">
                          • {semesterUnits} Units
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Batch 1 Registration
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-200 rounded-full text-slate-400 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Course List */}
                    <div className="divide-y divide-slate-100">
                      {semester.courses.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No courses scheduled for this term.
                        </div>
                      ) : (
                        semester.courses.map((course) => (
                          <div
                            key={course.canonicalId}
                            className="p-5 hover:bg-slate-50 transition-colors group flex items-start justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-slate-900">
                                  {course.localCode}
                                </h3>
                                {course.isCritical && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                    Required: UCB
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 font-medium">
                                {course.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {course.units} Units
                              </p>
                            </div>

                            <button className="p-2 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: DIAGNOSTICS & SIDEBAR (4 cols) === */}
        <div className="lg:col-span-4 space-y-6">
          {/* University Fit Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              University Fit
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-2 h-2 rounded-full ${
                    plan.diagnostics.onTrack ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    UC Berkeley (EECS)
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      plan.diagnostics.onTrack
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {plan.diagnostics.onTrack
                      ? "On Track"
                      : "Missing Requirements"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="mt-1 w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <p className="font-semibold text-sm text-slate-900">
                    UCLA (CS)
                  </p>
                  <p className="text-xs font-medium text-amber-600">
                    Missing 1 Course (PHYS-130)
                  </p>
                </div>
              </div>

              {!plan.diagnostics.onTrack && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-800 font-medium mb-2">
                    Missing Critical Courses:
                  </p>
                  {plan.diagnostics.missingCanonicalCourses.map((c, index) => (
                    <span
                      key={`${c}-${index}`}
                      className="block text-[10px] text-amber-700 font-mono bg-amber-100/50 px-1 rounded mb-1 w-fit"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Golden Four Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Golden Four Status
            </h3>

            <div className="space-y-3">
              {[
                { label: "Oral Communication", done: false, code: "COMM-120" },
                {
                  label: "Written Communication",
                  done: true,
                  code: "ENGL-122",
                },
                { label: "Critical Thinking", done: false, code: "ENGL-123" },
                { label: "Math/Quantitative", done: true, code: "MATH-192" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  {item.done ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.done ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deadline Watch */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2">Deadline Watch</h3>
            <div className="bg-white/60 p-3 rounded-lg border border-orange-200/50 mb-2">
              <p className="text-xs font-bold text-orange-800">Nov 1–30</p>
              <p className="text-xs text-orange-700">UC Application Window</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
