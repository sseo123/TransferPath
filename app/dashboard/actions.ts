"use server";

import { getLucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { studentPlansTable, userTable, completedSemestersTable, completedCoursesTable, } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { userTargetsTable } from "@/db/schema";

export async function setStartTerm(
  season: "fall" | "spring" | "summer",
  year: number,
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  await db
    .update(userTable)
    .set({ startSeason: season, startYear: year })
    .where(eq(userTable.id, user.id));

  revalidatePath("/dashboard");
}

export async function saveStudentPlan(
  planData: { semesterName: string; courseCode: string; order: number }[],
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  // Delete first
  await db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id));

  // Chunk the inserts to stay under D1's SQL variable limit.
  // Each row has 4 columns (id, userId, semesterName, courseCode, order = 5 actually),
  // so with a limit of ~32 variables, safe chunk size is 6 rows.
  const CHUNK_SIZE = 6;
  const rows = planData.map((item) => ({
    id: crypto.randomUUID(),
    userId: user.id,
    semesterName: item.semesterName,
    courseCode: item.courseCode,
    order: item.order,
  }));

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(studentPlansTable).values(chunk);
  }

  revalidatePath("/dashboard");
}

export async function addTargetCollege(university: string, major: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  // Basic validation
  if (!university || !major) {
    throw new Error("University and Major are required");
  }

  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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
    db
      .delete(completedCoursesTable)
      .where(eq(completedCoursesTable.userId, user.id)),
    db
      .delete(completedSemestersTable)
      .where(eq(completedSemestersTable.userId, user.id)),
  ]);

  revalidatePath("/dashboard");
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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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

export async function syncUserData(data: {
  igetcTasks?: any[];
  patternTasks?: any[];
  deadlines?: any[];
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const updateData: any = {};
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

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

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
