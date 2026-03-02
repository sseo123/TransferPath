import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCSB_STATS_DS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true }, 
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DIFF_EQ, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.UPPER_DIVISION_MATH, category: "MATH", isCritical: true },

    { canonicalId: CANONICAL_COURSES.INTRO_CS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.ADVANCED_CS, category: "CS", isCritical: false },
    ],
  categories: {}, 
};


//last updated feb 26, 2026