import { Semester, CollegeCourse, PlannedCourse } from "./types";

/**
 * Checks if a specific course in a plan is valid based on its position.
 * Completed courses are treated as "semester -1" - they're available to ALL semesters.
 */
export function checkPrerequisites(
  course: CollegeCourse, 
  semesterIndex: number, 
  allSemesters: Semester[],
  completedCourses: PlannedCourse[] = []
): { isValid: boolean; missing: string[] } {
  // 1. Collect all courses taken in semesters BEFORE the current one
  const completedBefore = new Set<string>();
  
  // CRITICAL: Add ALL completed courses FIRST (they're available to all semesters)
  completedCourses.forEach(c => completedBefore.add(c.canonicalId));
  
  // Then add courses from semesters BEFORE the current one
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