import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_DS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.CALC_1, category: "MATH", isCritical: true }, 
    { canonicalId: CANONICAL_COURSES.CALC_2, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, category: "MATH", isCritical: true },
    { canonicalId: CANONICAL_COURSES.DIFF_EQ, category: "MATH", isCritical: true },


    { canonicalId: CANONICAL_COURSES.INTRO_DS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.PYTHON_CS, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, category: "CS", isCritical: false },
    { canonicalId: CANONICAL_COURSES.ENGINEERING_USING_MATLAB, category: "ENGINEERING", isCritical: false },

    ],
  categories: {}, 
};


//last updated feb 25, 2026