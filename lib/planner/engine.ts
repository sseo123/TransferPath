import type {
  StudentIntent,
  RequirementGraph,
  CollegeCourse,
  PlanningResult,
  Semester,
  PlannedCourse,
  Season,
  RequirementNode,
} from "./types";

function buildDependencyGraph(
  requirements: RequirementGraph
): Map<string, RequirementNode> {
  const graph = new Map<string, RequirementNode>();

  requirements.requiredChains.forEach((course) => {
    graph.set(course.canonicalId, course);
  });

  return graph;
}

function topologicalSort(requirements: RequirementGraph): RequirementNode[] {
  const graph = buildDependencyGraph(requirements);
  const inDegree = new Map<string, number>();
  const sorted: RequirementNode[] = [];

  // Calculate in-degrees
  requirements.requiredChains.forEach((course) => {
    inDegree.set(course.canonicalId, course.prerequisites.length);
  });

  // Find courses with no prerequisites
  const queue: string[] = [];
  inDegree.forEach((degree, courseId) => {
    if (degree === 0) {
      queue.push(courseId);
    }
  });

  // Process queue
  while (queue.length > 0) {
    const courseId = queue.shift()!;
    const course = graph.get(courseId);

    if (course) {
      sorted.push(course);

      // Reduce in-degree for dependent courses
      requirements.requiredChains.forEach((dependentCourse) => {
        if (dependentCourse.prerequisites.includes(courseId)) {
          const newDegree = inDegree.get(dependentCourse.canonicalId)! - 1;
          inDegree.set(dependentCourse.canonicalId, newDegree);

          if (newDegree === 0) {
            queue.push(dependentCourse.canonicalId);
          }
        }
      });
    }
  }

  return sorted;
}

function canScheduleCourse(
  courseId: string,
  season: Season,
  completedCourses: Set<string>,
  requirements: RequirementGraph,
  catalog: CollegeCourse[]
): boolean {
  // Find the course in catalog
  const courseData = catalog.find((c) => c.canonicalId === courseId);
  if (!courseData) return false;

  // Check if offered this season
  if (!courseData.offerings.includes(season)) return false;

  // Check prerequisites
  const requirement = requirements.requiredChains.find(
    (r) => r.canonicalId === courseId
  );
  if (!requirement) return false;

  const prereqsMet = requirement.prerequisites.every((prereq) =>
    completedCourses.has(prereq)
  );

  return prereqsMet;
}

/**
 * Generate semester structure based on student intent
 */
function generateSemesters(
  studentIntent: StudentIntent,
  maxUnits: number
): Semester[] {
  const semesters: Semester[] = [];
  const seasons: Season[] = [];

  // Build 4-semester plan (2 academic years)
  const startSeason = studentIntent.startTerm.season;
  let year = studentIntent.startTerm.year;

  if (startSeason === "fall") {
    seasons.push("fall", "spring", "fall", "spring");
  } else if (startSeason === "spring") {
    seasons.push("spring", "fall", "spring", "fall");
  } else {
    // Summer start
    seasons.push("summer", "fall", "spring", "fall");
  }

  seasons.forEach((season, idx) => {
    // Increment year after spring semester
    if (idx > 0 && seasons[idx - 1] === "spring") {
      year++;
    }

    semesters.push({
      name: `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`,
      season,
      year,
      maxUnits,
      courses: [],
    });
  });

  return semesters;
}

export function planningEngine(
  studentIntent: StudentIntent,
  requirements: RequirementGraph,
  catalog: CollegeCourse[]
): PlanningResult {
  const diagnostics = {
    onTrack: true,
    missingCanonicalCourses: [] as string[],
    blockedBySeasonality: [] as string[],
    prerequisiteViolations: [] as { course: string; missing: string[] }[],
  };

  const unitCaps: Record<string, number> = {
    speed: 18,
    balance: 15,
    gpa: 12,
  };
  const maxUnits = unitCaps[studentIntent.transferEdge];

  const semesters = generateSemesters(studentIntent, maxUnits);
  const sortedCourses = topologicalSort(requirements);

  // Track state across time
  const completedCourses = new Set<string>();
  const scheduledCourses = new Set<string>();

  // ---------------------------------------------------------
  // THE FIX: Iterate by Time (Semester), not by Category
  // ---------------------------------------------------------
  for (const semester of semesters) {
    let currentUnits = 0;

    // A. Priority 1: Critical Chains (Anchors)
    const criticalCandidates = sortedCourses.filter(
      (c) => c.isCritical && !scheduledCourses.has(c.canonicalId)
    );

    for (const course of criticalCandidates) {
      if (currentUnits >= maxUnits) break;

      // 1. Check Prerequisites (must be in completedCourses from PREVIOUS semesters)
      const prereqsMet = course.prerequisites.every((p) =>
        completedCourses.has(p)
      );
      if (!prereqsMet) continue;

      // 2. Check Seasonality & Catalog
      if (
        !canScheduleCourse(
          course.canonicalId,
          semester.season,
          completedCourses,
          requirements,
          catalog
        )
      )
        continue;

      // 3. Check Units
      const courseData = catalog.find(
        (c) => c.canonicalId === course.canonicalId
      );
      if (!courseData || currentUnits + courseData.units > maxUnits) continue;

      // Schedule it
      semester.courses.push({
        localCode: courseData.localCode,
        canonicalId: courseData.canonicalId,
        title: courseData.title,
        units: courseData.units,
        isCritical: true,
      });
      currentUnits += courseData.units;
      scheduledCourses.add(course.canonicalId);
    }

    // B. Priority 2: Non-Critical Requirements
    const requiredCandidates = sortedCourses.filter(
      (c) => !c.isCritical && !scheduledCourses.has(c.canonicalId)
    );

    for (const course of requiredCandidates) {
      if (currentUnits >= maxUnits) break;
      const prereqsMet = course.prerequisites.every((p) =>
        completedCourses.has(p)
      );
      if (!prereqsMet) continue;
      if (
        !canScheduleCourse(
          course.canonicalId,
          semester.season,
          completedCourses,
          requirements,
          catalog
        )
      )
        continue;

      const courseData = catalog.find(
        (c) => c.canonicalId === course.canonicalId
      );
      if (!courseData || currentUnits + courseData.units > maxUnits) continue;

      semester.courses.push({
        localCode: courseData.localCode,
        canonicalId: courseData.canonicalId,
        title: courseData.title,
        units: courseData.units,
        isCritical: false,
      });
      currentUnits += courseData.units;
      scheduledCourses.add(course.canonicalId);
    }

    // C. Priority 3: Breadth/Electives
    if (requirements.categories.breadth) {
      // ... (Insert your existing breadth logic here, but constrained to this semester loop)
      // Make sure breadth courses also respect `currentUnits`
      const breadthNeeded = requirements.categories.breadth.count;
      // Count how many breadth we have GLOBALLY scheduled so far
      let breadthCount = 0;
      // (You would need to calculate current breadth count from scheduledCourses)
      // For simplicity, just check if we need more.
    }

    // CRITICAL: Update completed courses ONLY after the semester is finalized
    semester.courses.forEach((c) => completedCourses.add(c.canonicalId));
  }

  // Generate diagnostics
  requirements.requiredChains.forEach((course) => {
    if (!scheduledCourses.has(course.canonicalId)) {
      diagnostics.missingCanonicalCourses.push(course.canonicalId);
      diagnostics.onTrack = false;

      // Check if it's a seasonality issue
      const courseData = catalog.find(
        (c) => c.canonicalId === course.canonicalId
      );
      if (courseData && courseData.offerings.length === 0) {
        diagnostics.blockedBySeasonality.push(course.canonicalId);
      }
    }
  });

  return { semesters, diagnostics };
}
