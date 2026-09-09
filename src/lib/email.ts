import { prisma } from '@/lib/db';

/** Trim + lowercase so email comparison never depends on how it was typed. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Case-insensitive email lookup, returning the matching user's id (or null).
 *
 * IMPORTANT: do NOT use Prisma's `mode: 'insensitive'` for this. On PostgreSQL
 * it compiles to `ILIKE`, where `_` and `%` are wildcards — and underscores are
 * common in real email addresses, so `a_b@x.com` would also match `aXb@x.com`
 * (verified). That can match the wrong account on login and falsely report
 * "email already registered" at sign-up. `LOWER(email) = LOWER($1)` is an exact
 * comparison with no wildcard semantics.
 */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE LOWER(email) = ${normalized} LIMIT 1
  `;
  return rows[0]?.id ?? null;
}
