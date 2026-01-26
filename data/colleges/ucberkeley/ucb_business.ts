import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_BUSINESS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.BUSINESS_CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.BUSINESS_CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.BUSINESS_STATS, category: "BUSINESS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.INTRO_BUSINESS, category: "BUSINESS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.INTRO_ECON, category: "BUSINESS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ENGL_COMP_1, category: "ENGLISH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.ENGL_COMP_2, category: "ENGLISH", isCritical: true },
  ],
  categories: {}, 
};
