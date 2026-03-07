const ITERATIONS = 100000;
const SALT_SIZE = 16;
const KEY_LEN = 32;
const ALGO = "SHA-256";

/**
 * Encodes a buffer or array view to a base64 string
 */
function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const uint8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to a buffer
 */
function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: ALGO,
    },
    passwordKey,
    KEY_LEN * 8
  );

  const hashBase64 = toBase64(derivedBits);
  const saltBase64 = toBase64(salt);

  // Format: pbkdf2:iterations:salt:hash
  return `pbkdf2:${ITERATIONS}:${saltBase64}:${hashBase64}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    console.error("Missing password or hash for verification");
    return false;
  }

  try {
    const parts = hash.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      console.error("Invalid hash format");
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = fromBase64(parts[2]);
    const storedHash = parts[3];

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: iterations,
        hash: ALGO,
      },
      passwordKey,
      KEY_LEN * 8
    );

    const newHashBase64 = toBase64(derivedBits);
    return newHashBase64 === storedHash;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}
