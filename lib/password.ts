import { Scrypt } from "oslo/password";

const scrypt = new Scrypt();

export async function hashPassword(password: string) {
  return await scrypt.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  if (!password || !hash) {
    console.error("Missing password or hash for verification");
    return false;
  }

  try {
    return await scrypt.verify(hash, password);
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}
