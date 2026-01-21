import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { userTargetsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllUniversities, getMajorsForUniversity } from "@/data/registry";
import UniversitiesClient from "./universitiesClient";

export default async function UniversitiesPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/signin");

  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);

  const userTargets = await db
    .select()
    .from(userTargetsTable)
    .where(eq(userTargetsTable.userId, user.id));

  const clientTargets = userTargets.map((t) => ({
    id: t.id,
    university: t.university,
    major: t.major,
  }));

  const availableUniversities = getAllUniversities();
  const majorsByUniversity: Record<string, string[]> = {};
  availableUniversities.forEach((uni) => {
    majorsByUniversity[uni] = getMajorsForUniversity(uni);
  });

  return (
    <UniversitiesClient
      targets={clientTargets}
      availableUniversities={availableUniversities}
      majorsByUniversity={majorsByUniversity}
    />
  );
}
