import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_STATS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },

    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: false },
    { canonicalId: CANONICAL_COURSES.DIFF_EQ, category: "MATH", isCritical: false },
    { canonicalId: CANONICAL_COURSES.INTRO_DS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.INTRO_STATS, category: "MATH", isCritical: false },

  ],
  categories: {}, 
};

//accurate: last checked feb 26, 2026