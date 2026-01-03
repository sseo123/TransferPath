import { CANONICAL_COURSES } from "@/data/canonical/canonical-courses";
import type { RequirementGraph } from "@/lib/planner/types";

export const UCB_EECS_REQUIREMENTS: RequirementGraph = {
  requiredChains: [
    // Mathematics Sequence (Critical Path)
    {
      canonicalId: CANONICAL_COURSES.CALC_1,
      category: "MATH",
      isCritical: true,
      prerequisites: [],
    },
    {
      canonicalId: CANONICAL_COURSES.CALC_2,
      category: "MATH",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.CALC_1],
    },
    {
      canonicalId: CANONICAL_COURSES.CALC_3,
      category: "MATH",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.CALC_2],
    },
    {
      canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA,
      category: "MATH",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.CALC_1],
    },
    {
      canonicalId: CANONICAL_COURSES.DISCRETE_MATH,
      category: "MATH",
      isCritical: true,
      prerequisites: [],
    },
    {
      canonicalId: CANONICAL_COURSES.DIFF_EQ,
      category: "MATH",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.CALC_2],
    },

    // Computer Science Sequence (Critical Path)
    {
      canonicalId: CANONICAL_COURSES.INTRO_CS,
      category: "CS",
      isCritical: true,
      prerequisites: [],
    },
    {
      canonicalId: CANONICAL_COURSES.DATA_STRUCTURES,
      category: "CS",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.INTRO_CS],
    },
    {
      canonicalId: CANONICAL_COURSES.COMPUTER_ARCHITECTURE,
      category: "CS",
      isCritical: true,
      prerequisites: [CANONICAL_COURSES.DATA_STRUCTURES],
    },

    // Physics Sequence (Critical Path)
    // {
    //   canonicalId: CANONICAL_COURSES.PHYSICS_MECHANICS,
    //   category: "PHYSICS",
    //   isCritical: true,
    //   prerequisites: [CANONICAL_COURSES.CALC_1],
    // },
    // {
    //   canonicalId: CANONICAL_COURSES.PHYSICS_EM,
    //   category: "PHYSICS",
    //   isCritical: true,
    //   prerequisites: [
    //     CANONICAL_COURSES.PHYSICS_MECHANICS,
    //     CANONICAL_COURSES.CALC_2,
    //   ],
    // },

    // English Requirement
    {
      canonicalId: CANONICAL_COURSES.ENGL_COMP_1,
      category: "BREADTH",
      isCritical: false,
      prerequisites: [],
    },
    {
      canonicalId: CANONICAL_COURSES.ENGL_COMP_2,
      category: "BREADTH",
      isCritical: false,
      prerequisites: [CANONICAL_COURSES.ENGL_COMP_1],
    },
  ],

  categories: {
    // UC Berkeley requires 7 breadth courses
    breadth: {
      count: 4,
      pool: [
        CANONICAL_COURSES.BREADTH_ARTS,
        CANONICAL_COURSES.BREADTH_HUMANITIES,
        CANONICAL_COURSES.BREADTH_SOCIAL,
        CANONICAL_COURSES.BREADTH_BIOLOGICAL,
        CANONICAL_COURSES.BREADTH_HISTORY,
        CANONICAL_COURSES.BREADTH_PHILOSOPHY,
      ],
    },
  },
};
