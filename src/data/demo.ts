/** Demo logins for local development. Seeded into Postgres with bcrypt hashes. */
export const demoCredentials = {
  superAdmin: { email: "super@health.gov.sl", password: "Password123" },
  admin: { email: "admin@health.gov.sl", password: "Password123" },
  officer: { email: "office@health.gov.sl", password: "Password123" },
  staff: { email: "staff@health.gov.sl", password: "Password123" },
  conductor: { staffNumber: "CND-001", password: "Password123" },
} as const;

/** Aminata Sesay — use this NIN at the Youyi Building desk in local demo. */
export const demoOfficeLookup = {
  nin: "900004182",
  qr: "MOHSL1.qrt_7f3a9c2e1b8d4f6a9e0c1d2b3a4e5f67",
  staff: "Aminata Sesay",
} as const;
