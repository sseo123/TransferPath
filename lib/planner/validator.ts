import { Semester, CollegeCourse } from "./types";

/**
 * Checks if a specific course in a plan is valid based on its position.
 */
export function checkPrerequisites(
  course: CollegeCourse, 
  semesterIndex: number, 
  allSemesters: Semester[]
): { isValid: boolean; missing: string[] } {
  // 1. Collect all courses taken in semesters BEFORE the current one
  const completedBefore = new Set<string>();
  for (let i = 0; i < semesterIndex; i++) {
    allSemesters[i].courses.forEach(c => completedBefore.add(c.canonicalId));
  }

  // 2. Compare against the catalog prerequisites
  const missing = course.prerequisites.filter(p => !completedBefore.has(p));

  return {
    isValid: missing.length === 0,
    missing
  };
}