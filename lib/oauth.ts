import { Google } from "arctic";

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const redirectUri = process.env.NODE_ENV === "production" 
  ? "https://transferpathway.com/login/google/callback" 
  : "http://localhost:3000/login/google/callback";

export const google = new Google(
	googleClientId,
	googleClientSecret,
	redirectUri
);
