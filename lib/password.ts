import { Scrypt } from "oslo/password";

const scrypt = new Scrypt();

export async function hashPassword(password: string) {
  return await scrypt.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  return await scrypt.verify(hash, password);
}
