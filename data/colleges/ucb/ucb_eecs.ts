import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_EECS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DIFF_EQ, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_1, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_2, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_3, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ENGL_COMP_1, category: "ENGLISH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ENGL_COMP_2, category: "ENGLISH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PYTHON_CS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.COMPUTER_ARCHITECTURE, category: "CS", isCritical: true },
  ],
  categories: {}, 
};

//accurate: last checked feb 5, 2026