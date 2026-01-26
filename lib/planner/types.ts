export type Season = "fall" | "spring" | "summer";
export type CourseCategory =
  | "MATH"
  | "CS"
  | "PHYSICS"
  | "CHEMISTRY"
  | "ENGLISH"
  | "ENGINEERING"
  | "HISTORY"
  | "PREP"
  | "BUSINESS"
  | "ECON"

//Student's transfer intent and constraints
export interface StudentIntent {
  firstName: string;
  major: string;
  currentCollege: string;
  targetUniversity: string;
  startTerm: {
    season: Season;
    year: number;
  };
}

// A college course with local identifiers
export interface CollegeCourse {
  localCode: string;
  canonicalId: string;
  title: string;
  units: number;
  offerings: Season[];
  prerequisites: string[];
}


// A university requirement expressed in canonical terms
export interface RequirementNode {
  canonicalId: string;
  category: CourseCategory;
  isCritical: boolean;
  origin?: string; 
}

// Category-based requirements (breadth, electives, etc.)
export interface CategoryRequirement {
  count: number;
  pool: string[];
}

// Complete university requirement graph
export interface RequirementGraph {
  requiredChains: RequirementNode[];
  categories: {
    breadth?: CategoryRequirement;
    electives?: CategoryRequirement;
  };
}

// A planned course in a semester
export interface PlannedCourse {
  localCode: string;
  canonicalId: string;
  title: string;
  units: number;
  isCritical: boolean;
  requiredBy?: string[]; // List of university codes
}


// A semester in the transfer plan
export interface Semester {
  name: string;
  season: Season;
  year: number;
  maxUnits: number;
  courses: PlannedCourse[];
}

// Diagnostic information about the plan
export interface PlanDiagnostics {
  onTrack: boolean;
  missingCanonicalCourses: string[];
  blockedBySeasonality: string[];
  prerequisiteViolations: {
    course: string;
    missing: string[];
  }[];
}

// The complete output of the planning engine
export interface PlanningResult {
  semesters: Semester[];
  diagnostics: PlanDiagnostics;
}
