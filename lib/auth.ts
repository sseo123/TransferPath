import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { userTable, sessionTable } from "../db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { cache } from "react";
import { cookies } from "next/headers";

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

  return result;
});

declare module "lucia" {
  interface Register {
    Lucia: Awaited<ReturnType<typeof getLucia>>;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}
