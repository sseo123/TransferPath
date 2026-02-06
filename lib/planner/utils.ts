import { PlannedCourse } from "./types";

/**
 * Calculates the total units for a list of courses.
 */
export function calculateTotalUnits(courses: PlannedCourse[]): number {
  return courses.reduce((sum, course) => sum + course.units, 0);
}

/**
 * Common unit limits for semesters.
 */
export const UNIT_LIMITS = {
  REGULAR: 19,
  SUMMER: 12,
} as const;

export function getUnitLimit(season: string): number {
  return season.toLowerCase() === "summer" ? UNIT_LIMITS.SUMMER : UNIT_LIMITS.REGULAR;
}
