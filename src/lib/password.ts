import bcrypt from "bcryptjs";

const ROUNDS = 10;

export const DEMO_PASSWORD = "Password123";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
