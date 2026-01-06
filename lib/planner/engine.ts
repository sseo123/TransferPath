import {
  RequirementGraph,
  CollegeCourse,
  Semester,
  Season,
  RequirementNode,
} from "./types";

function getFullRequirementList(
  universityReqs: RequirementNode[],
  catalog: CollegeCourse[]
): RequirementNode[] {
  const catalogMap = new Map(catalog.map((c) => [c.canonicalId, c]));
  const finalRequirements = new Map<string, RequirementNode>();
  const queue: string[] = universityReqs.map((r) => r.canonicalId);
  universityReqs.forEach((req) => finalRequirements.set(req.canonicalId, req));

  let head = 0;
  while (head < queue.length) {
    const currentId = queue[head++];
    const courseData = catalogMap.get(currentId);

    if (courseData && courseData.prerequisites) {
      for (const prereqId of courseData.prerequisites) {
        if (!finalRequirements.has(prereqId)) {
          const newNode: RequirementNode = {
            canonicalId: prereqId,
            category: "PREP",
            isCritical: true,
          };
          finalRequirements.set(prereqId, newNode);
          queue.push(prereqId);
        }
      }
    }
  }
  return Array.from(finalRequirements.values());
}

/**
 * MAIN PLANNING ENGINE
 */
export function planningEngine(
  requirements: RequirementGraph,
  catalog: CollegeCourse[],
  startSeason: Season,
  startYear: number,
  maxUnits: number = 15
): Semester[] {
  // 1. Resolve all hidden CC prerequisites first
  const totalRequiredNodes = getFullRequirementList(
    requirements.requiredChains,
    catalog
  );

  const semesters: Semester[] = [];
  const completedCourses = new Set<string>();
  const scheduledCourses = new Set<string>();

  const seasonCycle: Season[] = ["fall", "spring", "summer"];
  let currentSeasonIndex = seasonCycle.indexOf(startSeason);
  let currentYear = startYear;

  // 2. Schedule until all resolved requirements are met
  // We use a safety break of 12 semesters to prevent infinite loops
  while (
    scheduledCourses.size < totalRequiredNodes.length &&
    semesters.length < 12
  ) {
    const season = seasonCycle[currentSeasonIndex];
    const currentSemester: Semester = {
      name: `${
        season.charAt(0).toUpperCase() + season.slice(1)
      } ${currentYear}`,
      season: season,
      year: currentYear,
      maxUnits: maxUnits,
      courses: [],
    };

    let currentUnits = 0;

    // Check each required node against the catalog and current completion status
    for (const node of totalRequiredNodes) {
      if (scheduledCourses.has(node.canonicalId)) continue;

      const catalogData = catalog.find(
        (c) => c.canonicalId === node.canonicalId
      );
      if (!catalogData) continue;

      // Check CC-defined prerequisites
      const prereqsMet = catalogData.prerequisites.every((p) =>
        completedCourses.has(p)
      );

      if (
        prereqsMet &&
        catalogData.offerings.includes(season) &&
        currentUnits + catalogData.units <= maxUnits
      ) {
        currentSemester.courses.push({
          localCode: catalogData.localCode,
          canonicalId: catalogData.canonicalId,
          title: catalogData.title,
          units: catalogData.units,
          isCritical: node.isCritical,
        });
        currentUnits += catalogData.units;
        scheduledCourses.add(node.canonicalId);
      }
    }

    semesters.push(currentSemester);

    // Add courses to completed set ONLY after the semester is finished
    // to ensure prereqs aren't taken in the same semester
    currentSemester.courses.forEach((c) => completedCourses.add(c.canonicalId));

    // Increment time
    currentSeasonIndex = (currentSeasonIndex + 1) % 3;
    if (season === "spring") currentYear++;
  }

  return semesters;
}
