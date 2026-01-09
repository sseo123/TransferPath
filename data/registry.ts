import type { RequirementGraph } from "@/lib/planner/types";
import { UCB_CS_REQUIREMENTS } from "@/data/colleges/ucberkeley/ucb_cs";
import { UCLA_CS_REQUIREMENTS } from "@/data/colleges/ucla/ucla_cs";
import { UCSD_CS_REQUIREMENTS } from "@/data/colleges/ucsd/ucsd_cs";

/**
 * Centralized Registry for University + Major Combinations
 * 
 * This is the "Phone Book" for the app. It maps university + major combinations
 * to their requirement data files, eliminating the need for brittle string matching.
 * 
 * To add a new university/major:
 * 1. Create the data file in data/colleges/{university}/{major}.ts
 * 2. Import it above
 * 3. Add an entry to the REGISTRY below
 */

export interface MajorEntry {
  /** Display name for the major (shown in UI) */
  displayName: string;
  /** The requirement graph data */
  requirements: RequirementGraph;
  /** University code (e.g., "UCB", "UCLA") for tracking origin */
  universityCode: string;
}

export interface UniversityEntry {
  /** Display name for the university (shown in UI) */
  displayName: string;
  /** Available majors at this university */
  majors: Record<string, MajorEntry>;
}

/**
 * Normalize a string for matching (lowercase, remove special chars, handle variations)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Normalize major name for matching (handles variations like "Computer Science", "CS", "EECS")
 */
function normalizeMajor(major: string): string {
  const normalized = normalizeString(major);
  // Handle common variations
  if (normalized.includes("computer_science") || normalized.includes("cs") || normalized.includes("eecs")) {
    return "computer_science";
  }
  return normalized;
}

/**
 * Normalize university name for matching
 */
function normalizeUniversity(university: string): string {
  const normalized = normalizeString(university);
  // Handle common variations
  if (normalized.includes("uc_berkeley") || normalized.includes("ucb") || normalized.includes("berkeley")) {
    return "uc_berkeley";
  }
  if (normalized.includes("ucla") || normalized.includes("los_angeles")) {
    return "ucla";
  }
  if (normalized.includes("uc_san_diego") || normalized.includes("ucsd")) {
    return "uc_san_diego";
  }
  return normalized;
}

/**
 * The Central Registry
 * 
 * Key structure: { normalizedUniversity: { normalizedMajor: MajorEntry } }
 */
const REGISTRY: Record<string, UniversityEntry> = {
  uc_berkeley: {
    displayName: "UC Berkeley",
    majors: {
      computer_science: {
        displayName: "Computer Science",
        requirements: UCB_CS_REQUIREMENTS,
        universityCode: "UCB",
      },
    },
  },
  ucla: {
    displayName: "UCLA",
    majors: {
      computer_science: {
        displayName: "Computer Science",
        requirements: UCLA_CS_REQUIREMENTS,
        universityCode: "UCLA",
      },
    },
  },
  uc_san_diego: {
    displayName: "UC San Diego",
    majors: {
      computer_science: {
        displayName: "Computer Science",
        requirements: UCSD_CS_REQUIREMENTS,
        universityCode: "UCSD",
      },
    },
  },
};

/**
 * Get requirement graph for a university + major combination
 * Returns null if not found
 */
export function getRequirements(
  university: string,
  major: string
): RequirementGraph | null {
  const normUni = normalizeUniversity(university);
  const normMajor = normalizeMajor(major);

  const universityEntry = REGISTRY[normUni];
  if (!universityEntry) return null;

  const majorEntry = universityEntry.majors[normMajor];
  if (!majorEntry) return null;

  return majorEntry.requirements;
}

/**
 * Get university code for a university + major combination
 * Returns null if not found
 */
export function getUniversityCode(
  university: string,
  major: string
): string | null {
  const normUni = normalizeUniversity(university);
  const normMajor = normalizeMajor(major);

  const universityEntry = REGISTRY[normUni];
  if (!universityEntry) return null;

  const majorEntry = universityEntry.majors[normMajor];
  if (!majorEntry) return null;

  return majorEntry.universityCode;
}

/**
 * Get all available universities (display names)
 */
export function getAllUniversities(): string[] {
  return Object.values(REGISTRY).map((entry) => entry.displayName);
}

/**
 * Get all available majors for a specific university
 * Returns empty array if university not found
 */
export function getMajorsForUniversity(university: string): string[] {
  const normUni = normalizeUniversity(university);
  const universityEntry = REGISTRY[normUni];
  if (!universityEntry) return [];

  return Object.values(universityEntry.majors).map((entry) => entry.displayName);
}

/**
 * Get all available majors across all universities (unique list)
 */
export function getAllMajors(): string[] {
  const majorSet = new Set<string>();
  Object.values(REGISTRY).forEach((universityEntry) => {
    Object.values(universityEntry.majors).forEach((majorEntry) => {
      majorSet.add(majorEntry.displayName);
    });
  });
  return Array.from(majorSet).sort();
}

/**
 * Check if a university + major combination is supported
 */
export function isSupported(university: string, major: string): boolean {
  return getRequirements(university, major) !== null;
}
