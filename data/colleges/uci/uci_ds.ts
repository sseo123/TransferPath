import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCI_DS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.INTRO_CS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ADVANCED_CS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.OBJECT_ORIENTED_PROGRAMMING, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true }, 
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.INTRO_STATS, category: "MATH", isCritical: false },
    ],
  categories: {}, 
};



//last updated feb 25, 2026