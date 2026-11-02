import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();

  // All known NextAuth cookie names
  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.pkce.code_verifier',
  ];

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  cookiesToClear.forEach((name) => {
    // Expire standard cookie
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    });

    // Also expire secure variant
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  });

  return response;
}

export async function GET() {
  return POST();
}
