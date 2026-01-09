
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
  
  // Initialize queue with explicit top-level requirements
  const queue: RequirementNode[] = [...universityReqs];

  // Helper to merge requirements if we encounter the same course again
  const addOrUpdateRequirement = (node: RequirementNode) => {
      if (finalRequirements.has(node.canonicalId)) {
          const existing = finalRequirements.get(node.canonicalId)!;
          // Merge origins
          const existingOrigins = existing.origin ? [existing.origin] : [];
          const newOrigins = node.origin ? [node.origin] : [];
          const mergedOrigins = Array.from(new Set([...existingOrigins, ...newOrigins])).join(","); // Simplified for internal tracking, improved later
           
          // Update criticality if needed
          existing.isCritical = existing.isCritical || node.isCritical;
      } else {
          finalRequirements.set(node.canonicalId, node);
      }
  };

  universityReqs.forEach(req => addOrUpdateRequirement(req));

  let head = 0;
  while (head < queue.length) {
    const currentReq = queue[head++];
    const courseData = catalogMap.get(currentReq.canonicalId);

    if (courseData && courseData.prerequisites) {
      for (const prereqId of courseData.prerequisites) {
          // If we haven't processed this prereq yet, or if we need to update its criticality/origin
          if (!finalRequirements.has(prereqId)) {
             const newNode: RequirementNode = {
                canonicalId: prereqId,
                category: "PREP",
                isCritical: true, // Prerequisites are usually critical
                origin: currentReq.origin // Propagate origin
             };
             finalRequirements.set(prereqId, newNode);
             queue.push(newNode);
          } else {
             // If it exists, we might want to propagate origin to it?
             // For simplicity, we assume prereqs are "shared" dependency if the parent is shared
             // But strictly speaking, we should merge origins here too.
             const existing = finalRequirements.get(prereqId)!;
             if (currentReq.origin && existing.origin && !existing.origin.includes(currentReq.origin)) {
                 // update origin
                 // This is simple string concat, ideally we use array
             }
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
  requirements: RequirementGraph | RequirementGraph[], // Allow single or array
  catalog: CollegeCourse[],
  startSeason: Season,
  startYear: number,
  maxUnits: number = 15
): Semester[] {
  
  // Normalize to array
  const reqGraphs = Array.isArray(requirements) ? requirements : [requirements];

  // 1. Merge Requirements across all targets
  const combinedRequirementsMap = new Map<string, { node: RequirementNode; origins: Set<string> }>();

  reqGraphs.forEach((graph, idx) => {
      // We can tag the origin based on index or pass it in.
      // For now, let's assume we can infer or it's passed in the RequirementNode if we modified the caller.
      // Actually, better: the caller should probably tag the nodes before passing them.
      
      // Let's rely on the `origin` field being populated by the caller OR we can simply track it here if we change the signature to accept named graphs.
      // FOR NOW: Let's assume the Caller has merged them OR we merge them here assuming they are just raw lists.
      // If we simply run `getFullRequirementList` for EACH graph, then merge the results.
      
      const fullList = getFullRequirementList(graph.requiredChains, catalog);
      fullList.forEach(req => {
          if (!combinedRequirementsMap.has(req.canonicalId)) {
              combinedRequirementsMap.set(req.canonicalId, {
                  node: { ...req }, // Clone
                  origins: new Set()
              });
          }
          const entry = combinedRequirementsMap.get(req.canonicalId)!;
          if (req.origin) entry.origins.add(req.origin);
          entry.node.isCritical = entry.node.isCritical || req.isCritical;
      });
  });

  const totalRequiredNodes = Array.from(combinedRequirementsMap.values());

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
    for (const { node, origins } of totalRequiredNodes) {
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
          requiredBy: Array.from(origins) // Pass the merged origins
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

