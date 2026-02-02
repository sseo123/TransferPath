import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  currentCollege: text("current_college"),
  major: text("major"),
  targetUni: text("target_uni"),
  startSeason: text("start_season"),
  startYear: integer("start_year"),
  igetcTasks: text("igetc_tasks"), // Stringified JSON
  patternTasks: text("pattern_tasks"), // Stringified JSON
  deadlines: text("deadlines"), // Stringified JSON
});

// ADD THIS TABLE - Lucia requires it
export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const requestTable = sqliteTable("request", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  body: text("body").notNull(),
});

export const studentPlansTable = sqliteTable("student_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => userTable.id),
  courseCode: text("course_code").notNull(),
  semesterName: text("semester_name").notNull(),
  order: integer("order"),
});

export const userTargetsTable = sqliteTable("user_targets", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => userTable.id),
  university: text("university").notNull(), 
  major: text("major").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .defaultNow(),
});

export const completedSemestersTable = sqliteTable("completed_semesters", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  semesterName: text("semester_name").notNull(),
});

export const completedCoursesTable = sqliteTable("completed_courses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  courseCode: text("course_code").notNull(),
  order: integer("order"),
});
