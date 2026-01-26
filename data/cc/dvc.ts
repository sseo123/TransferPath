import { CANONICAL_COURSES } from "@/data/courses/allCourses";
import type { CollegeCourse } from "@/lib/planner/types";

export const DVC_CATALOG: CollegeCourse[] = [
  // MATH
  { localCode: "MATH-192", canonicalId: CANONICAL_COURSES.CALC_1, title: "Calculus I", units: 5, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "MATH-193", canonicalId: CANONICAL_COURSES.CALC_2, title: "Calculus II", units: 5, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_1]  },
  { localCode: "MATH-292", canonicalId: CANONICAL_COURSES.CALC_3, title: "Analytic Geometry and Calculus III", units: 5, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_2]  },
  { localCode: "MATH-194", canonicalId: CANONICAL_COURSES.LINEAR_ALGEBRA, title: "Linear Algebra", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_2]  },
  { localCode: "MATH-195", canonicalId: CANONICAL_COURSES.DISCRETE_MATH, title: "Discrete Mathematics", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_2]  },
  { localCode: "MATH-294", canonicalId: CANONICAL_COURSES.DIFF_EQ, title: "Differential Equations", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_3, CANONICAL_COURSES.LINEAR_ALGEBRA]  },
  { localCode: "MATH-182", canonicalId: CANONICAL_COURSES.BUSINESS_CALC_1, title: "Calculus for Management, Life Science, and Social Science I", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "MATH-183", canonicalId: CANONICAL_COURSES.BUSINESS_CALC_2, title: "Calculus for Management, Life Science, and Social Science II", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.BUSINESS_CALC_1]  },

  // Computer Science
  { localCode: "COMSC-110", canonicalId: CANONICAL_COURSES.INTRO_CS, title: "Intro to Programming", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [] },
  { localCode: "COMSC-140", canonicalId: CANONICAL_COURSES.PYTHON_CS, title: "Python Programming", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [] },
  { localCode: "COMSC-165", canonicalId: CANONICAL_COURSES.ADVANCED_CS, title: "Advanced Programming with C and C++", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.INTRO_CS] },
  { localCode: "COMSC-200", canonicalId: CANONICAL_COURSES.OBJECT_ORIENTED_PROGRAMMING, title: "Object Oriented Programming C++", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.ADVANCED_CS] },
  { localCode: "COMSC-210", canonicalId: CANONICAL_COURSES.DATA_STRUCTURES, title: "Program Design and Data Structures", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.ADVANCED_CS]  },
  { localCode: "COMSC-260", canonicalId: CANONICAL_COURSES.COMPUTER_ARCHITECTURE, title: "Assembly Language Programming/Computer Organization", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.ADVANCED_CS]  },

  // Physics
  { localCode: "PHYS-129", canonicalId: CANONICAL_COURSES.PRE_PHYSICS, title: "Intro to Physics for Engineers", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "PHYS-130", canonicalId: CANONICAL_COURSES.PHYSICS_1, title: "Physics for Engineers: Mechanics and Wave Motion", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.PRE_PHYSICS]  },
  { localCode: "PHYS-230", canonicalId: CANONICAL_COURSES.PHYSICS_2, title: "Physics for Engineers: Heat and Electromagnetism", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.PHYSICS_1]  },
  { localCode: "PHYS-231", canonicalId: CANONICAL_COURSES.PHYSICS_3, title: "Physics for Engineers: Optics and Modern Physics", units: 4, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.PHYSICS_2]  },

  // Chemistry
  { localCode: "CHEM-120", canonicalId: CANONICAL_COURSES.GENERAL_CHEM_1, title: "General Chemistry I", units: 5, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "CHEM-121", canonicalId: CANONICAL_COURSES.GENERAL_CHEM_2, title: "General Chemistry II", units: 5, offerings: ["fall", "spring"], prerequisites: []  },

  // English
  { localCode: "ENGL-C1000", canonicalId: CANONICAL_COURSES.ENGL_COMP_1, title: "Academic Reading and Writing", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "ENGL-123", canonicalId: CANONICAL_COURSES.ENGL_COMP_2, title: "Critical Thinking and Composition", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.ENGL_COMP_1]  },

  //Business Classes
  { localCode: "BUS-109", canonicalId: CANONICAL_COURSES.INTRO_BUSINESS, title: "Introduction to Business", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: []  },
  { localCode: "BUS-240", canonicalId: CANONICAL_COURSES.BUSINESS_STATS, title: "Business Statistics", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: [CANONICAL_COURSES.CALC_1]  },

  //Econ
  { localCode: "ECON-200", canonicalId: CANONICAL_COURSES.INTRO_ECON, title: "Introduction to Economics", units: 3, offerings: ["fall", "spring", "summer"], prerequisites: []  },


];
