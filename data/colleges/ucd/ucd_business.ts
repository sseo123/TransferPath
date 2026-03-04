import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCD_BUSINESS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.FINANCIAL_ACCOUNTING, category: "BUSINESS", isCritical: true },
    { canonicalId: CANONICAL_COURSES.MANAGERIAL_ACCOUNTING, category: "BUSINESS", isCritical: true },


    { canonicalId: CANONICAL_COURSES.MICROECONOMICS, category: "ECON", isCritical: true },
    { canonicalId: CANONICAL_COURSES.MICROECONOMICS, category: "ECON", isCritical: true },

    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.CALC_3, category: "MATH", isCritical: true },

    { canonicalId: CANONICAL_COURSES.BUSINESS_STATS, category: "BUSINESS", isCritical: true },

  ],
  categories: {}, 
};

//accurate: last checked feb 5, 2026