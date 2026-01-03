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
  transferEdge: text("transfer_edge"),
});

// ADD THIS TABLE - Lucia requires it
export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const studentPlansTable = sqliteTable("student_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => userTable.id),
  courseCode: text("course_code").notNull(),
  semesterName: text("semester_name").notNull(),
  order: integer("order"),
});
