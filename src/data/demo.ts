/** Demo logins for local development. Seeded into Postgres with bcrypt hashes. */
export const demoCredentials = {
  admin: { email: "admin@health.gov.sl", password: "Password123" },
  staff: { email: "staff@health.gov.sl", password: "Password123" },
  conductor: { staffNumber: "CND-001", password: "Password123" },
} as const;
