import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTable, studentPlansTable, userTargetsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { planningEngine } from "@/lib/planner/engine";
import { DVC_CATALOG } from "@/data/cc/dvc";
import { getRequirements, getUniversityCode } from "@/data/registry";
import DashboardClient from "./dashboardClient";
import { Semester, Season, RequirementGraph, RequirementNode, } from "@/lib/planner/types";

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
  const userTargets = await db
    .select()
    .from(userTargetsTable)
    .where(eq(userTargetsTable.userId, user.id));

  const savedPlanRows = await db
    .select()
    .from(studentPlansTable)
    .where(eq(studentPlansTable.userId, user.id));

  let semesters: Semester[] = [];

  const targetRequirementGraphs: RequirementGraph[] = userTargets.map((t) => {
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

  // create a page that says "add universties" which has a button to university page
  if (targetRequirementGraphs.length === 0) {
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
    // 1. Group by semester name from DB
    const grouped = new Map<string, StudentPlanRow[]>();
    savedPlanRows.forEach((row) => {
      if (!grouped.has(row.semesterName)) grouped.set(row.semesterName, []);
      grouped.get(row.semesterName)!.push(row);
    });

    // 2. Rebuild semester objects
    semesters = Array.from(grouped.entries()).map(([name, rows]) => {
      // Parse "Spring 2027" -> ["Spring", "2027"]
      const parts = name.split(" ");
      const seasonStr = parts[0]?.toLowerCase() || "fall";
      const yearNum = parseInt(parts[1]) || 2025;

      // Sort courses within this specific semester by the saved 'order' index
      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        name, // Keeps the display name e.g., "Spring 2027"
        season: seasonStr as Season,
        year: yearNum,
        courses: rows.map((r) => {
          const catalog = DVC_CATALOG.find((c) => c.localCode === r.courseCode);

          // Re-hydrate requirement metadata (critical status, etc.)
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
        }),
        maxUnits: seasonStr === "summer" ? 12 : 19,
      };
    });

    // 3. STRICT Chronological Sort for the Timeline
    const seasonPriority: Record<string, number> = {
      spring: 0,
      summer: 1,
      fall: 2,
    };

    semesters.sort((a, b) => {
      // First, compare years (e.g., 2026 comes before 2027)
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      // If years are the same, compare by academic season priority
      const priorityA = seasonPriority[a.season] ?? 0;
      const priorityB = seasonPriority[b.season] ?? 0;

      return priorityA - priorityB;
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
  const targetCount = userTargets.length;

  return (
    <DashboardClient
      initialSemesters={semesters}
      dbUser={dbUser}
      targetCount={targetCount}
    />
  );

}
