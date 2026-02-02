import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTable, studentPlansTable, userTargetsTable, completedSemestersTable, completedCoursesTable, } from "@/db/schema";
import { eq } from "drizzle-orm";
import { planningEngine } from "@/lib/planner/engine";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { getRequirements, getUniversityCode } from "@/data/registry";
import DashboardClient from "./dashboardClient";
import {
  Semester,
  Season,
  RequirementGraph,
  RequirementNode,
} from "@/lib/planner/types";
import { PlannedCourse } from "@/lib/planner/types";

type StudentPlanRow = typeof studentPlansTable.$inferSelect;

export default async function Dashboard() {
  const { user } = await validateRequest();
  if (!user) redirect("/signin");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id));

  const userTargets = await db
    .select()
    .from(userTargetsTable)
    .where(eq(userTargetsTable.userId, user.id));

  const savedPlanRows = await db
    .select()
    .from(studentPlansTable)
    .where(eq(studentPlansTable.userId, user.id));

  const completedSemesterRows = await db
    .select()
    .from(completedSemestersTable)
    .where(eq(completedSemestersTable.userId, user.id));

  const completedCourseRows = await db
    .select()
    .from(completedCoursesTable)
    .where(eq(completedCoursesTable.userId, user.id));

  const plannedRows = savedPlanRows.filter(
    (row) => row.semesterName !== "unassigned",
  );
  const unassignedRows = savedPlanRows.filter(
    (row) => row.semesterName === "unassigned",
  );

  let semesters: Semester[] = [];
  let hydratedUnassigned: PlannedCourse[] = [];

  const targetRequirementGraphs: RequirementGraph[] = userTargets.map((t) => {
    const graph = getRequirements(t.university, t.major);
    const universityCode = getUniversityCode(t.university, t.major);

    if (graph && universityCode) {
      const graphCopy = JSON.parse(JSON.stringify(graph));
      graphCopy.requiredChains.forEach((node: RequirementNode) => {
        node.origin = universityCode;
      });
      return graphCopy;
    }

    return { requiredChains: [], categories: {} };
  });

  if (targetRequirementGraphs.length === 0) {
    targetRequirementGraphs.push({ requiredChains: [], categories: {} });
  }

  const requirementsMap = new Map<
    string,
    { isCritical: boolean; requiredBy: Set<string> }
  >();

  targetRequirementGraphs.forEach((graph) => {
    graph.requiredChains.forEach((req) => {
      if (!requirementsMap.has(req.canonicalId)) {
        requirementsMap.set(req.canonicalId, {
          isCritical: false,
          requiredBy: new Set(),
        });
      }
      const entry = requirementsMap.get(req.canonicalId)!;
      if (req.isCritical) entry.isCritical = true;
      if (req.origin) entry.requiredBy.add(req.origin);
    });
  });

  const completedSemesterNames = completedSemesterRows.map(
    (r) => r.semesterName,
  );
const completedCourses: PlannedCourse[] = completedCourseRows
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  .map((r) => {
    const catalog = DVC_CATALOG.find((c) => c.localCode === r.courseCode);
    const reqData = catalog
      ? requirementsMap.get(catalog.canonicalId)
      : undefined;
    return {
      localCode: r.courseCode,
      canonicalId: catalog?.canonicalId ?? "unknown", // Sets "unknown" if missing
      title: catalog?.title ?? "Unknown",
      units: catalog?.units ?? 0,
      isCritical: reqData?.isCritical ?? false,
      requiredBy: reqData ? Array.from(reqData.requiredBy) : [],
    };
  })
  .filter((c) => c.canonicalId !== "unknown"); // Drops the "ghost" courses

  hydratedUnassigned = unassignedRows
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((r) => {
      const catalog = DVC_CATALOG.find((c) => c.localCode === r.courseCode);
      const reqData = catalog
        ? requirementsMap.get(catalog.canonicalId)
        : undefined;
      return {
        localCode: r.courseCode,
        canonicalId: catalog?.canonicalId ?? "unknown",
        title: catalog?.title ?? "Unknown",
        units: catalog?.units ?? 0,
        isCritical: reqData?.isCritical ?? false,
        requiredBy: reqData ? Array.from(reqData.requiredBy) : [],
      };
    })
    .filter((c) => c.canonicalId !== "unknown"); 


  if (plannedRows.length > 0) {
    const grouped = new Map<string, StudentPlanRow[]>();
    plannedRows.forEach((row) => {
      if (!grouped.has(row.semesterName)) grouped.set(row.semesterName, []);
      grouped.get(row.semesterName)!.push(row);
    });

    semesters = Array.from(grouped.entries()).map(([name, rows]) => {
      const parts = name.split(" ");
      const seasonStr = parts[0]?.toLowerCase() || "fall";
      const yearNum = parseInt(parts[1]) || 2025;

      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        name,
        season: seasonStr as Season,
        year: yearNum,
        courses: rows.map((r) => {
          const catalog = DVC_CATALOG.find((c) => c.localCode === r.courseCode);

          const reqData = catalog
            ? requirementsMap.get(catalog.canonicalId)
            : undefined;

          return {
            localCode: r.courseCode,
            canonicalId: catalog?.canonicalId ?? "unknown",
            title: catalog?.title ?? "Unknown",
            units: catalog?.units ?? 0,
            isCritical: reqData?.isCritical ?? false,
            requiredBy: reqData ? Array.from(reqData.requiredBy) : [],
          };
        })
          .filter((c) => c.canonicalId !== "unknown"), 
        maxUnits: seasonStr === "summer" ? 12 : 19,
      };
    });

    const seasonPriority: Record<string, number> = {
      spring: 0,
      summer: 1,
      fall: 2,
    };

    semesters.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      const priorityA = seasonPriority[a.season] ?? 0;
      const priorityB = seasonPriority[b.season] ?? 0;

      return priorityA - priorityB;
    });
  } else if (unassignedRows.length === 0) {
    const startSeason = (dbUser.startSeason as Season) || "fall";
    const startYear = dbUser.startYear || 2025;
    semesters = planningEngine(
      targetRequirementGraphs,
      DVC_CATALOG,
      startSeason,
      startYear,
    );
    // semesters = []
  } else {
    semesters = [];
  }
  const targetCount = userTargets.length;

  // Security: Parse persisted UI data with robust fallbacks
  const initialIgetcTasks = dbUser.igetcTasks
    ? JSON.parse(dbUser.igetcTasks)
    : null;
  const initialPatternTasks = dbUser.patternTasks
    ? JSON.parse(dbUser.patternTasks)
    : null;
  const initialDeadlines = dbUser.deadlines ? JSON.parse(dbUser.deadlines) : [];

  return (
    <DashboardClient
      initialSemesters={semesters}
      initialUnassigned={hydratedUnassigned}
      initialCompletedCourses={completedCourses}
      initialCompletedSemesters={completedSemesterNames}
      dbUser={dbUser}
      targetCount={targetCount}
      initialIgetcTasks={initialIgetcTasks}
      initialPatternTasks={initialPatternTasks}
      initialDeadlines={initialDeadlines}
    />
  );
}
