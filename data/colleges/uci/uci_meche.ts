import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCI_MECHE_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DIFF_EQ, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_1, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_2, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.PHYSICS_3, category: "PHYSICS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.GENERAL_CHEM_1, category: "CHEMISTRY", isCritical: true },
  ],
  categories: {}, 
};


//last updated feb 26, 2026