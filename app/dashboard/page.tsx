import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTable, studentPlansTable, userTargetsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { planningEngine } from "@/lib/planner/engine";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { getRequirements, getUniversityCode, getAllUniversities, getMajorsForUniversity } from "@/data/registry";
import DashboardClient from "./dashboardClient";
import {
  Semester,
  Season,
  PlannedCourse,
  RequirementGraph,
  RequirementNode,
} from "@/lib/planner/types";
import { CANONICAL_COURSES } from "@/data/courses/allCourses";

// Define the type for the database row based on your schema
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

  // --- Runtime Migration Logic ---
  // Check if we have targets in the new table
  let userTargets = await db
    .select()
    .from(userTargetsTable)
    .where(eq(userTargetsTable.userId, user.id));

  // If no targets but user has legacy data, migrate it
  if (userTargets.length === 0 && dbUser.targetUni && dbUser.major) {
    const newTargetId = crypto.randomUUID();
    await db.insert(userTargetsTable).values({
      id: newTargetId,
      userId: user.id,
      university: dbUser.targetUni,
      major: dbUser.major,
    });
    console.log(`Migrated user ${user.id} to userTargetsTable`);

    // Refresh targets
    userTargets = [
      {
        id: newTargetId,
        userId: user.id,
        university: dbUser.targetUni,
        major: dbUser.major,
        createdAt: new Date(),
      },
    ];
  }

  const savedPlanRows = await db
    .select()
    .from(studentPlansTable)
    .where(eq(studentPlansTable.userId, user.id));

  let semesters: Semester[] = [];

  // Construct Requirement Graphs for Planning Engine
  // We attach "origin" to the requirements so we can track them
  const targetRequirementGraphs: RequirementGraph[] = userTargets.map((t) => {
    // Use the centralized registry instead of hardcoded string matching
    const graph = getRequirements(t.university, t.major);
    const universityCode = getUniversityCode(t.university, t.major);

    if (graph && universityCode) {
      // Deep copy to avoid mutation issues
      const graphCopy = JSON.parse(JSON.stringify(graph));
      graphCopy.requiredChains.forEach((node: RequirementNode) => {
        node.origin = universityCode;
      });
      return graphCopy;
    }

    // Return empty graph if unknown (or handle gracefully)
    return { requiredChains: [], categories: {} };
  });

  if (targetRequirementGraphs.length === 0) {
    // Fallback if no targets?
    targetRequirementGraphs.push({ requiredChains: [], categories: {} });
  }

  // --- HYDRATION & VALIDATION LOGIC ---
  // Create a lookup map for current requirements
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

  if (savedPlanRows.length > 0) {
    // Reconstruct plan from DB
    const seasonOrder = { spring: 0, summer: 1, fall: 2 };

    // Group by delivery semester
    const grouped = new Map<string, StudentPlanRow[]>();
    savedPlanRows.forEach((row) => {
      if (!grouped.has(row.semesterName)) grouped.set(row.semesterName, []);
      grouped.get(row.semesterName)!.push(row);
    });

    semesters = Array.from(grouped.entries()).map(([name, rows]) => {
      const [seasonStr, yearStr] = name.split(" ");
      const season = seasonStr.toLowerCase() as Season;
      const year = parseInt(yearStr);

      // Sort by order
      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const courses: PlannedCourse[] = rows
        .map((row) => {
          const catalogCourse = DVC_CATALOG.find(
            (c) => c.localCode === row.courseCode
          );

          const reqData = catalogCourse
            ? requirementsMap.get(catalogCourse.canonicalId)
            : undefined;

          return {
            localCode: row.courseCode,
            canonicalId: catalogCourse?.canonicalId ?? "unknown",
            title: catalogCourse?.title ?? "Unknown Course",
            units: catalogCourse?.units ?? 0,
            isCritical: reqData?.isCritical ?? false,
            requiredBy: reqData ? Array.from(reqData.requiredBy) : [],
          };
        })
        // FILTER: Remove stale courses that are likely auto-added GEs but no longer required
        // Specifically targeting ETHNIC_STUDIES as requested
        .filter((c) => {
          if (
            c.canonicalId === CANONICAL_COURSES.ETHNIC_STUDIES &&
            !c.isCritical
          ) {
            return false;
          }
          return true;
        });

      return {
        name,
        season,
        year,
        maxUnits: season === "summer" ? 12 : 19,
        courses,
      };
    });

    // Sort semesters chronologically
    semesters.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return seasonOrder[a.season] - seasonOrder[b.season];
    });
  } else {
    const startSeason = (dbUser.startSeason as Season) || "fall";
    const startYear = dbUser.startYear || 2025;
    semesters = planningEngine(
      targetRequirementGraphs,
      DVC_CATALOG,
      startSeason,
      startYear
    );
  }

  // Pass sanitized targets to client
  const clientTargets = userTargets.map((t) => ({
    id: t.id,
    university: t.university,
    major: t.major,
  }));

  // Get registry data for the UI
  const availableUniversities = getAllUniversities();
  // Pre-compute majors for each university (can't pass server functions to client components)
  const majorsByUniversity: Record<string, string[]> = {};
  availableUniversities.forEach((uni) => {
    majorsByUniversity[uni] = getMajorsForUniversity(uni);
  });

  return (
    <DashboardClient
      initialSemesters={semesters}
      dbUser={dbUser}
      targets={clientTargets}
      availableUniversities={availableUniversities}
      majorsByUniversity={majorsByUniversity}
    />
  );
}
