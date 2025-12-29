import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/d1";
import { userTable, sessionTable } from "../db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getLucia() {
  const { env } = await getCloudflareContext();
  const db = drizzle((env as Env).DB); 
  const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);

  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production"
      }
    },
    getUserAttributes: (attributes) => {
      return {
        username: attributes.username
      };
    }
  });
}

declare module "lucia" {
  interface Register {
    Lucia: Awaited<ReturnType<typeof getLucia>>;
    DatabaseUserAttributes: {
      username: string;
    };
  }
}