import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/config';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth-cookies';

// Route Handler exists specifically because client components can't set httpOnly
// cookies — per architecture-plan.md §D, web auth is httpOnly+Secure+SameSite=strict
// cookies, not localStorage. This is the only place the raw JWTs are ever visible.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ message: 'Unable to reach the API server.' }, { status: 502 });
  }

  const backendBody = await backendRes.json().catch(() => ({}));
  if (!backendRes.ok) {
    return NextResponse.json(
      { message: backendBody?.message ?? 'Invalid email or password.' },
      { status: backendRes.status },
    );
  }

  const { accessToken, refreshToken, user } = backendBody as {
    accessToken: string;
    refreshToken?: string;
    user?: unknown;
  };

  const response = NextResponse.json({ user: user ?? null });
  const isProd = process.env.NODE_ENV === 'production';

  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15, // matches the 15-minute access token lifetime in §D
  });

  if (refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
