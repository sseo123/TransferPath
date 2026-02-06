import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cfEnv = env as Env;
  return drizzle(cfEnv.DB);
}
