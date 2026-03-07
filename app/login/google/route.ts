import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/oauth";
import { cookies } from "next/headers";

const INTENT_COOKIE_NAME = "google_oauth_intent";
const COOKIE_MAX_AGE = 60 * 10;

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const intentParam = url.searchParams.get("intent");
	const intent = intentParam === "signup" ? "signup" : "signin";

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const authUrl = google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

	const cookieStore = await cookies();
	cookieStore.set("google_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: COOKIE_MAX_AGE,
		sameSite: "lax"
	});
	cookieStore.set("google_code_verifier", codeVerifier, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: COOKIE_MAX_AGE,
		sameSite: "lax"
	});
	cookieStore.set(INTENT_COOKIE_NAME, intent, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: COOKIE_MAX_AGE,
		sameSite: "lax"
	});

	return Response.redirect(authUrl);
}
