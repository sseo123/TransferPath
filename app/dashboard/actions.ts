"use server";

import { getLucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { studentPlansTable, userTable, completedSemestersTable, completedCoursesTable, customCoursesTable, calendarTasksTable, calendarNotesTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { userTargetsTable } from "@/db/schema";

export async function setStartTerm(
  season: "fall" | "spring" | "summer",
  year: number,
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  await db
    .update(userTable)
    .set({ startSeason: season, startYear: year })
    .where(eq(userTable.id, user.id));

  revalidatePath("/dashboard");
}

export async function saveStudentPlan(
  planData: { semesterName: string; courseCode: string; order: number }[],
  customCoursesData: { 
    localCode: string; 
    title: string; 
    units: number; 
    requiredBy: string[] 
  }[]
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
    db.delete(customCoursesTable).where(eq(customCoursesTable.userId, user.id)),
  ]);

  // Insert plan data
  const CHUNK_SIZE = 6;
  const planRows = planData.map((item) => ({
    id: crypto.randomUUID(),
    userId: user.id,
    semesterName: item.semesterName,
    courseCode: item.courseCode,
    order: item.order,
  }));

  for (let i = 0; i < planRows.length; i += CHUNK_SIZE) {
    const chunk = planRows.slice(i, i + CHUNK_SIZE);
    await db.insert(studentPlansTable).values(chunk);
  }

  // Insert custom courses
  if (customCoursesData.length > 0) {
    const customRows = customCoursesData.map((item) => ({
      id: crypto.randomUUID(),
      userId: user.id,
      localCode: item.localCode,
      title: item.title,
      units: item.units,
      requiredBy: JSON.stringify(item.requiredBy),
      createdAt: new Date(),
    }));

    for (let i = 0; i < customRows.length; i += CHUNK_SIZE) {
      const chunk = customRows.slice(i, i + CHUNK_SIZE);
      await db.insert(customCoursesTable).values(chunk);
    }
  }

  revalidatePath("/dashboard");
}

export async function addTargetCollege(university: string, major: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  // Basic validation
  if (!university || !major) {
    throw new Error("University and Major are required");
  }

  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
    db.delete(customCoursesTable).where(eq(customCoursesTable.userId, user.id)),
    db
      .delete(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id)),
    db
      .delete(completedSemestersTable)
      .where(eq(completedSemestersTable.userId, user.id)),
  ]);

  await db.insert(userTargetsTable).values({
    id: crypto.randomUUID(),
    userId: user.id,
    university,
    major,
  });

  revalidatePath("/dashboard");
}

export async function removeTargetCollege(targetId: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  // Security: Verify target belongs to the authenticated user (prevents IDOR attacks)
  const [target] = await db
    .select()
    .from(userTargetsTable)
    .where(
      and(
        eq(userTargetsTable.id, targetId),
        eq(userTargetsTable.userId, user.id)
      )
    );
  if (!target) {
    throw new Error("Target college not found or access denied");
  }

  await db.delete(userTargetsTable).where(
    and(
      eq(userTargetsTable.id, targetId),
      eq(userTargetsTable.userId, user.id)
    )
  );

  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
    db.delete(customCoursesTable).where(eq(customCoursesTable.userId, user.id)),
    db
      .delete(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id)),
    db
      .delete(completedSemestersTable)
      .where(eq(completedSemestersTable.userId, user.id)),
  ]);

  revalidatePath("/dashboard");
}

/** Batch save: replace all user targets with the given list. Clears plans/custom/completed and revalidates. */
export async function saveTargetUniversities(
  finalTargets: { university: string; major: string }[]
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  if (!Array.isArray(finalTargets)) {
    throw new Error("Invalid targets");
  }

  // Clear existing targets and all dependent data
  await db.delete(userTargetsTable).where(eq(userTargetsTable.userId, user.id));
  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
    db.delete(customCoursesTable).where(eq(customCoursesTable.userId, user.id)),
    db
      .delete(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id)),
    db
      .delete(completedSemestersTable)
      .where(eq(completedSemestersTable.userId, user.id)),
  ]);

  // Insert new targets
  for (const t of finalTargets) {
    if (!t.university || !t.major) continue;
    await db.insert(userTargetsTable).values({
      id: crypto.randomUUID(),
      userId: user.id,
      university: t.university,
      major: t.major,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/addCollege");
}

export async function logout() {
  const { session } = await validateRequest();

  if (!session) {
    redirect("/signin");
  }

  const lucia = await getLucia();
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  const cookieStore = await cookies();

  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/signin");
}

// COMPLETED SEMESTERS ACTIONS
export async function markSemesterComplete(semesterName: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  try {
    const existing = await db
      .select()
      .from(completedSemestersTable)
      .where(
        and(
          eq(completedSemestersTable.userId, user.id),
          eq(completedSemestersTable.semesterName, semesterName),
        ),
      );

    if (existing.length === 0) {
      await db.insert(completedSemestersTable).values({
        id: crypto.randomUUID(),
        userId: user.id,
        semesterName,
      });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error marking semester complete:", error);
    throw new Error("Failed to mark semester complete");
  }
}

export async function unmarkSemesterComplete(semesterName: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  try {
    await db
      .delete(completedSemestersTable)
      .where(
        and(
          eq(completedSemestersTable.userId, user.id),
          eq(completedSemestersTable.semesterName, semesterName),
        ),
      );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error unmarking semester complete:", error);
    throw new Error("Failed to unmark semester complete");
  }
}

export async function getCompletedSemesters(): Promise<string[]> {
  const { user } = await validateRequest();
  if (!user) return [];

  const db = await getDb();

  try {
    const completed = await db
      .select()
      .from(completedSemestersTable)
      .where(eq(completedSemestersTable.userId, user.id));

    return completed.map((c) => c.semesterName);
  } catch (error) {
    console.error("Error fetching completed semesters:", error);
    return [];
  }
}

// COMPLETED COURSES ACTIONS
export async function saveCompletedCourses(
  courseCodes: string[],
): Promise<{ success: boolean }> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  try {
    await db
      .delete(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id));

    if (courseCodes.length > 0) {
      await db.insert(completedCoursesTable).values(
        courseCodes.map((courseCode, index) => ({
          id: crypto.randomUUID(),
          userId: user.id,
          courseCode,
          order: index,
        })),
      );
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error saving completed courses:", error);
    throw new Error("Failed to save completed courses");
  }
}

interface SyncTask {
  id: string;
  label: string;
  completed: boolean;
}

export async function syncUserData(data: {
  igetcTasks?: SyncTask[];
  patternTasks?: SyncTask[];
  deadlines?: { id: string; title: string; date: string }[];
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  const updateData: {
    igetcTasks?: string;
    patternTasks?: string;
    deadlines?: string;
  } = {};
  
  if (data.igetcTasks) updateData.igetcTasks = JSON.stringify(data.igetcTasks);
  if (data.patternTasks)
    updateData.patternTasks = JSON.stringify(data.patternTasks);
  if (data.deadlines) updateData.deadlines = JSON.stringify(data.deadlines);

  if (Object.keys(updateData).length > 0) {
    await db
      .update(userTable)
      .set(updateData)
      .where(eq(userTable.id, user.id));
  }
}

export async function getCompletedCourses(): Promise<string[]> {
  const { user } = await validateRequest();
  if (!user) return [];

  const db = await getDb();

  try {
    const completed = await db
      .select()
      .from(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id));

    completed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return completed.map((c) => c.courseCode);
  } catch (error) {
    console.error("Error fetching completed courses:", error);
    return [];
  }
}

export async function getCalendarData() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const db = await getDb();

  const [tasks, notes] = await Promise.all([
    db.select().from(calendarTasksTable).where(eq(calendarTasksTable.userId, user.id)).orderBy(desc(calendarTasksTable.createdAt)),
    db.select().from(calendarNotesTable).where(eq(calendarNotesTable.userId, user.id)).orderBy(desc(calendarNotesTable.createdAt)),
  ]);

  return { tasks, notes };
}

export async function addCalendarTask(title: string, date: string, type: "homework" | "deadline" | "other") {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  // Security: Input Validation
  if (!title || title.trim().length === 0 || title.length > 500) throw new Error("Invalid title");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format");
  if (!["homework", "deadline", "other"].includes(type)) throw new Error("Invalid task type");

  const db = await getDb();

  const id = crypto.randomUUID();
  await db.insert(calendarTasksTable).values({
    id,
    userId: user.id,
    title: title.trim(),
    date,
    type,
  });

  revalidatePath("/dashboard");
  return { id };
}

export async function deleteCalendarTask(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  if (!id) throw new Error("Invalid ID");

  const db = await getDb();

  await db.delete(calendarTasksTable).where(
    and(
      eq(calendarTasksTable.id, id),
      eq(calendarTasksTable.userId, user.id)
    )
  );

  revalidatePath("/dashboard");
}

export async function addCalendarNote(content: string, date: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  // Security: Input Validation
  if (!content || content.trim().length === 0 || content.length > 2000) throw new Error("Invalid content");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format");

  const db = await getDb();

  const id = crypto.randomUUID();
  await db.insert(calendarNotesTable).values({
    id,
    userId: user.id,
    content: content.trim(),
    date,
  });

  revalidatePath("/dashboard");
  return { id };
}

export async function deleteCalendarNote(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  if (!id) throw new Error("Invalid ID");

  const db = await getDb();

  await db.delete(calendarNotesTable).where(
    and(
      eq(calendarNotesTable.id, id),
      eq(calendarNotesTable.userId, user.id)
    )
  );

  revalidatePath("/dashboard");
}
