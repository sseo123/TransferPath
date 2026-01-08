"use server";

import { getLucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { studentPlansTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveStudentPlan(
  planData: { semesterName: string; courseCode: string; order: number }[]
) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const { env } = await getCloudflareContext();
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  // Atomic operation: Clear old plan and insert new one
  await db.batch([
    db.delete(studentPlansTable).where(eq(studentPlansTable.userId, user.id)),
    ...planData.map((item) =>
      db.insert(studentPlansTable).values({
        id: crypto.randomUUID(),
        userId: user.id,
        semesterName: item.semesterName,
        courseCode: item.courseCode,
        order: item.order,
      })
    ),
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
    sessionCookie.attributes
  );

  return redirect("/signin");
}
