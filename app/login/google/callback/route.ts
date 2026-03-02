import { google } from "@/lib/oauth";
import { getLucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { ArcticFetchError } from "arctic";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const cookieStore = await cookies();
	const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
	const codeVerifier = cookieStore.get("google_code_verifier")?.value ?? null;

	if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});
		const googleUser: GoogleUser = await googleUserResponse.json();

		const { env } = await getCloudflareContext({ async: true });
		const cfEnv = env as Env;
		const db = drizzle(cfEnv.DB);

		const existingUser = await db
			.select()
			.from(userTable)
			.where(eq(userTable.googleId, googleUser.sub))
			.get();

		if (existingUser) {
			const lucia = await getLucia();
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/dashboard"
				}
			});
		}

		// FIX: Check for existing user by email
		const existingUserByEmail = await db
			.select()
			.from(userTable)
			.where(eq(userTable.username, googleUser.email))
			.get();

		if (existingUserByEmail) {
			// Link Google ID to existing user
			await db
				.update(userTable)
				.set({
					googleId: googleUser.sub,
					firstName: googleUser.given_name,
					lastName: googleUser.family_name
				})
				.where(eq(userTable.id, existingUserByEmail.id));

			const lucia = await getLucia();
			const session = await lucia.createSession(existingUserByEmail.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/dashboard"
				}
			});
		}

		const userId = generateIdFromEntropySize(10);
		await db.insert(userTable).values({
			id: userId,
			username: googleUser.email,
			googleId: googleUser.sub,
			firstName: googleUser.given_name,
			lastName: googleUser.family_name
		});

		const lucia = await getLucia();
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/dashboard"
			}
		});
	} catch (e) {
		console.error("Google OAuth callback error:", e);
		if (e instanceof ArcticFetchError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

interface GoogleUser {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
}
