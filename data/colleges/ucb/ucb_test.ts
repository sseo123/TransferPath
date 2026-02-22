import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_TEST_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    { canonicalId: CANONICAL_COURSES.GENERAL_CHEM_1, category: "CHEMISTRY", isCritical: true },
  ],
  categories: {}, 
};