import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTable, studentPlansTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { planningEngine } from "@/lib/planner/engine";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { UCB_TEST_REQUIREMENTS } from "@/data/colleges/ucberkeley/ucb_test";
import DashboardClient from "./dashboardClient";
import { Semester, Season, PlannedCourse } from "@/lib/planner/types";

// Define the type for the database row based on your schema
type StudentPlanRow = typeof studentPlansTable.$inferSelect;

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

  const savedPlanRows = await db
    .select()
    .from(studentPlansTable)
    .where(eq(studentPlansTable.userId, user.id));

  let semesters: Semester[] = [];

  if (savedPlanRows.length > 0) {
    const semesterGroups = savedPlanRows.reduce<
      Record<string, StudentPlanRow[]>
    >((acc, row) => {
      if (!acc[row.semesterName]) acc[row.semesterName] = [];
      acc[row.semesterName].push(row);
      return acc;
    }, {});

    semesters = Object.entries(semesterGroups).map(
      ([name, rows]): Semester => ({
        name,
        courses: rows
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((r): PlannedCourse => {
            const course = DVC_CATALOG.find(
              (c) => c.localCode === r.courseCode
            );

            if (!course) {
              return {
                localCode: r.courseCode,
                title: "Unknown",
                units: 0,
                canonicalId: "unknown",
                isCritical: false,
              };
            }

            return {
              localCode: course.localCode,
              title: course.title,
              units: course.units,
              canonicalId: course.canonicalId,
              isCritical: false, // default for DB-loaded plans
            };
          }),

        season: (name.toLowerCase().includes("fall")
          ? "fall"
          : "spring") as Season,
        year: parseInt(name.split(" ")[1]) || 2025,
        maxUnits: 18,
      })
    );
  } else {
    semesters = planningEngine(
      UCB_TEST_REQUIREMENTS,
      DVC_CATALOG,
      "fall",
      2025
    );
  }

  return <DashboardClient initialSemesters={semesters} dbUser={dbUser} />;
}
