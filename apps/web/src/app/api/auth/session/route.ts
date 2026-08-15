import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE } from '@/lib/auth-cookies';

// Decodes the JWT payload without verifying its signature — that's safe here only
// because this is a UI hint (show a name/email, decide whether to render a "logged
// in" state), never an authorization decision. Every real authorization check happens
// backend-side against the same cookie forwarded on each apiFetch call.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies(); // Next 15: cookies() is async
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: (payload.sub as string) ?? (payload.userId as string) ?? 'unknown',
      email: (payload.email as string) ?? '',
      name: payload.name as string | undefined,
    },
  });
}
