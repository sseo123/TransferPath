import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCI_CS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.INTRO_CS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ADVANCED_CS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.OBJECT_ORIENTED_PROGRAMMING, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.COMPUTER_ARCHITECTURE, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    ],
  categories: {}, 
};


//accurate: last checked feb 26, 2026