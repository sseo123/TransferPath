import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logout } from "./actions";

// Import the new Engine
import { planningEngine } from "@/lib/planner/engine";
// Data Imports (Temporarily static until we use the dynamic Registry)
import { DVC_CATALOG } from "@/data/cc/dvc";
import { UCB_TEST_REQUIREMENTS } from "@/data/colleges/ucberkeley/ucb_test";

export default async function Dashboard() {
  const { user } = await validateRequest();
  if (!user) redirect("/signin");

  // 1. Get User Profile from DB
  const { env } = await getCloudflareContext();
  const db = drizzle((env as any).DB);

  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id));

  if (!dbUser) redirect("/onboarding");

  // 2. Generate the Timeline
  // We pass starting season, year, and a 15-unit cap
  const semesters = planningEngine(
    UCB_TEST_REQUIREMENTS,
    DVC_CATALOG,
    "fall",
    2025,
    15
  );

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome, {dbUser.firstName}!
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            Path to{" "}
            <span className="text-blue-600 font-semibold">
              {dbUser.targetUni}
            </span>{" "}
            for {dbUser.major}
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-red-600 transition-all shadow-sm"
          >
            Sign Out
          </button>
        </form>
      </header>

      {/* 3. The Semester Timeline */}
      <div className="space-y-12">
        {semesters.map((semester) => {
          const totalUnits = semester.courses.reduce(
            (sum, c) => sum + c.units,
            0
          );

          return (
            <section key={semester.name} className="relative">
              {/* Visual Vertical Line for the Timeline */}
              <div className="absolute left-[-20px] top-0 bottom-0 w-1 bg-blue-100 hidden md:block" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-4 rounded-full bg-blue-500 hidden md:block border-4 border-white shadow-sm" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    {semester.name}
                  </h2>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
                  {totalUnits} Units Total
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {semester.courses.map((course) => (
                  <div
                    key={course.canonicalId}
                    className="group p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-blue-600 tracking-tighter uppercase">
                            {course.localCode}
                          </span>
                          {course.isCritical && (
                            <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-bold uppercase">
                              Critical
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                        <span className="text-[10px] text-gray-400 font-mono">
                          {course.canonicalId}
                        </span>
                        <span className="text-sm font-black text-gray-700">
                          {course.units} units
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* 4. Empty State Fallback */}
      {semesters.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">
            No courses scheduled. Check your requirements data.
          </p>
        </div>
      )}
    </div>
  );
}
