import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { userTable, sessionTable } from "../db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { cache } from "react";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

export async function getLucia() {
  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  const db = drizzle(cfEnv.DB);
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username,
        googleId: attributes.googleId,
        lastActiveAt: attributes.lastActiveAt,
      };
    },
  });
}

export const validateRequest = cache(async () => {
  const lucia = await getLucia();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      // FIX: Use the awaited cookieStore
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {
  }

  if (result.user && result.session) {
    try {
      const db = await getDb();
      const lastActive = result.user.lastActiveAt;
      const now = new Date();
      
      // Update lastActiveAt if it's been more than 1 hour since the last recorded activity
      if (!lastActive || now.getTime() - lastActive.getTime() > 60 * 60 * 1000) {
        await db
          .update(userTable)
          .set({ lastActiveAt: now })
          .where(eq(userTable.id, result.user.id));
      }
    } catch (e) {
      console.error("Failed to update lastActiveAt:", e);
    }
  }

  return result;
});

declare module "lucia" {
  interface Register {
    Lucia: Awaited<ReturnType<typeof getLucia>>;
    DatabaseUserAttributes: {
      username: string;
      googleId: string | null;
      lastActiveAt: Date | null;
    };
  }
}
