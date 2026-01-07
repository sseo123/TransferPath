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

  const { env } = await getCloudflareContext();
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id));

  if (!dbUser) redirect("/onboarding");

  const semesters = planningEngine(
    UCB_TEST_REQUIREMENTS,
    DVC_CATALOG,
    "fall",
    2025,
    15
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-8 font-sans text-slate-900">
        <header className="mb-12 flex justify-between items-end border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome, {dbUser.firstName}!
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Transferring to{" "}
              <span className="text-indigo-600 font-bold">
                {dbUser.targetUni}
              </span>{" "}
              for <span className="text-slate-900">{dbUser.major}</span>
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="px-6 py-2 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              Sign Out
            </button>
          </form>
        </header>

        <div className="space-y-16">
          {semesters.map((semester) => {
            const totalUnits = semester.courses.reduce(
              (sum, c) => sum + c.units,
              0
            );

            return (
              <section key={semester.name}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                    {semester.name}
                    <span className="text-slate-300 text-lg font-medium">
                      ·
                    </span>
                    <span className="text-slate-400 text-lg font-medium">
                      {totalUnits} Units
                    </span>
                  </h2>
                </div>

                {/* Course Rows - Styled like Screenshot */}
                <div className="space-y-3">
                  {semester.courses.map((course) => (
                    <div
                      key={course.canonicalId}
                      className="group relative flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-600/50 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-indigo-600 tracking-wide uppercase">
                          {course.localCode}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Tags matching the pill style in your screenshot */}
                        {course.isCritical && (
                          <div className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                              Required: {dbUser.targetUni}
                            </span>
                          </div>
                        )}

                        {/* Prereq logic placeholder tag */}
                        <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {course.units} Units
                          </span>
                        </div>

                        <svg
                          className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors ml-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
