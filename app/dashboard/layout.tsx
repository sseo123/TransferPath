import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import DashboardLayoutClient from "@/components/DashboardLayoutClient";
import { User } from "@/lib/types/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/signin");

  const db = await getDb();
  const [dbUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id));

  if (!dbUser) redirect("/signin");

  return (
    <DashboardLayoutClient user={dbUser as User}>
      {children}
    </DashboardLayoutClient>
  );
}