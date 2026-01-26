import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_ECON_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.INTRO_ECON, category: "ECON", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.BUSINESS_CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.BUSINESS_CALC_2, category: "MATH", isCritical: true },

  ],
  categories: {}, 
};