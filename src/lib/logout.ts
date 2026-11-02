import { signOut } from 'next-auth/react';

/**
 * Guaranteed, fail-proof logout function across localhost and Vercel.
 * 1. Signals NextAuth to sign out without automatic redirection.
 * 2. Invokes custom /api/auth/logout to forcefully wipe all auth cookies.
 * 3. Forces full-page browser navigation to callbackUrl.
 */
export async function executeSignOut(callbackUrl = '/login') {
  try {
    await signOut({ redirect: false });
  } catch (err) {
    console.warn('NextAuth signOut warning:', err);
  }

  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Custom logout API warning:', err);
  }

  // Force clean full reload to ensure server components update state immediately
  window.location.href = callbackUrl;
}
