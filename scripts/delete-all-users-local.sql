-- Delete all users and related data from LOCAL D1 only.
-- Run with: pnpm run db:reset-local
-- (uses wrangler d1 execute --local so production is never touched)

DELETE FROM session;
DELETE FROM student_plans;
DELETE FROM user_targets;
DELETE FROM completed_semesters;
DELETE FROM completed_courses;
DELETE FROM custom_courses;
DELETE FROM calendar_tasks;
DELETE FROM calendar_notes;
DELETE FROM user;
