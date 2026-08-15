import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-cookies';

// No landing page in scope — root just routes based on session presence.
// middleware.ts enforces the same rule on protected routes; this covers "/".
export default async function RootPage() {
  const cookieStore = await cookies(); // Next 15: cookies() is async
  const hasSession = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
  redirect(hasSession ? '/dashboard' : '/login');
}
