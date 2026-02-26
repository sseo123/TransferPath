import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCSD_DS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.INTRO_DS, category: "CS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.MACROECONOMICS, category: "ECON", isCritical: true },
    { canonicalId: CANONICAL_COURSES.MICROECONOMICS, category: "ECON", isCritical: true },
  ],
  categories: {}, 
};

//accurate: last checked feb 26, 2026