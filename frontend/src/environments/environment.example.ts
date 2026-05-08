// Copy this file reference for what to configure if you change the backend port.
// The actual environment files are environment.ts (production) and
// environment.development.ts (development) — Angular swaps them at build time.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',  // Change port if backend runs elsewhere
} as const;
