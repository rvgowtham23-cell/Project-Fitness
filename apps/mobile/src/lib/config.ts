// EXPO_PUBLIC_-prefixed vars are inlined at build time by Metro — never put secrets here,
// only values that are safe to ship inside the client binary (see apps/mobile/.env.example).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

// The backend (apps/backend) is scaffolded in parallel and may not be running while this
// app is developed against. Hooks in src/features/* fall back to mock data on network
// failure so every screen still renders real UI — see src/lib/mock-data.ts.
export const IS_DEV = __DEV__;
