import { CANONICAL_COURSES } from "@/data/canonical/canonical-courses";
import type { CollegeCourse } from "@/lib/planner/types";

export const DVC_CATALOG: CollegeCourse[] = [
  // Mathematics
  {
    localCode: "MATH-192",
    canonicalId: CANONICAL_COURSES.CALC_1,
    title: "Calculus I",
    units: 5,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "MATH-193",
    canonicalId: CANONICAL_COURSES.CALC_2,
    title: "Calculus II",
    units: 5,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "MATH-194",
    canonicalId: CANONICAL_COURSES.CALC_3,
    title: "Calculus III (Multivariable)",
    units: 5,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "MATH-195",
    canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA,
    title: "Linear Algebra",
    units: 3,
    offerings: ["fall", "spring", "summer"],
  },
  {
    localCode: "MATH-170",
    canonicalId: CANONICAL_COURSES.DISCRETE_MATH,
    title: "Discrete Mathematics",
    units: 3,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "MATH-292",
    canonicalId: CANONICAL_COURSES.DIFF_EQ,
    title: "Differential Equations",
    units: 3,
    offerings: ["fall", "spring"],
  },

  // Computer Science
  {
    localCode: "COMSC-165",
    canonicalId: CANONICAL_COURSES.INTRO_CS,
    title: "Introduction to Computer Science (C++)",
    units: 4,
    offerings: ["fall", "spring", "summer"],
  },
  {
    localCode: "COMSC-210",
    canonicalId: CANONICAL_COURSES.DATA_STRUCTURES,
    title: "Data Structures and Algorithms",
    units: 4,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "COMSC-220",
    canonicalId: CANONICAL_COURSES.COMPUTER_ARCHITECTURE,
    title: "Computer Architecture and Assembly Language",
    units: 4,
    offerings: ["fall", "spring"],
  },

  // Physics
  //   {
  //     localCode: "PHYSI-230",
  //     canonicalId: CANONICAL_COURSES.PHYSICS_MECHANICS,
  //     title: "Physics for Engineers: Mechanics",
  //     units: 5,
  //     offerings: ["fall", "spring"],
  //   },
  //   {
  //     localCode: "PHYSI-231",
  //     canonicalId: CANONICAL_COURSES.PHYSICS_EM,
  //     title: "Physics for Engineers: Electricity and Magnetism",
  //     units: 5,
  //     offerings: ["fall", "spring"],
  //   },

  // Chemistry
  {
    localCode: "CHEM-120",
    canonicalId: CANONICAL_COURSES.GENERAL_CHEM_1,
    title: "General Chemistry I",
    units: 5,
    offerings: ["fall", "spring", "summer"],
  },
  {
    localCode: "CHEM-121",
    canonicalId: CANONICAL_COURSES.GENERAL_CHEM_2,
    title: "General Chemistry II",
    units: 5,
    offerings: ["fall", "spring"],
  },

  // English
  {
    localCode: "ENGL-122",
    canonicalId: CANONICAL_COURSES.ENGL_COMP_1,
    title: "English Composition",
    units: 3,
    offerings: ["fall", "spring", "summer"],
  },
  {
    localCode: "ENGL-123",
    canonicalId: CANONICAL_COURSES.ENGL_COMP_2,
    title: "Critical Thinking and Composition",
    units: 3,
    offerings: ["fall", "spring", "summer"],
  },

  // Breadth Courses
  {
    localCode: "ART-101",
    canonicalId: CANONICAL_COURSES.BREADTH_ARTS,
    title: "Art History",
    units: 3,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "HIST-101",
    canonicalId: CANONICAL_COURSES.BREADTH_HISTORY,
    title: "World History",
    units: 3,
    offerings: ["fall", "spring", "summer"],
  },
  {
    localCode: "PSYCH-101",
    canonicalId: CANONICAL_COURSES.BREADTH_SOCIAL,
    title: "Introduction to Psychology",
    units: 3,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "BIO-101",
    canonicalId: CANONICAL_COURSES.BREADTH_BIOLOGICAL,
    title: "General Biology",
    units: 4,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "PHILO-101",
    canonicalId: CANONICAL_COURSES.BREADTH_PHILOSOPHY,
    title: "Introduction to Philosophy",
    units: 3,
    offerings: ["fall", "spring"],
  },
  {
    localCode: "ENGL-141",
    canonicalId: CANONICAL_COURSES.BREADTH_HUMANITIES,
    title: "American Literature",
    units: 3,
    offerings: ["fall", "spring"],
  },
];
