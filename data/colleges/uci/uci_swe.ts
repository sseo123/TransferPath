import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCI_SWE_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.INTRO_CS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.ADVANCED_CS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.OBJECT_ORIENTED_PROGRAMMING, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, category: "CS", isCritical: false },
  ],
  categories: {}, 
};

//accurate: last checked feb 26, 2026