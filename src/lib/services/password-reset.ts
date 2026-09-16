import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { findUserIdByEmail } from '@/lib/email';

/** Reset links stay valid for 24 hours. */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function newToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a reset token for a user id, replacing any still-open tokens so only
 * the newest link works. Returns the raw token (goes into the reset URL).
 */
export async function createResetTokenForUser(userId: string): Promise<string> {
  const token = newToken();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId, usedAt: null },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    }),
  ]);
  return token;
}

/**
 * Self-serve "forgot password": if the email has an account, open a reset
 * request the club admin can act on. Deliberately returns nothing either way so
 * the form can't be used to probe which emails have accounts.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const userId = await findUserIdByEmail(email);
  if (!userId) return;
  await createResetTokenForUser(userId);
}

/**
 * Look up a token for the reset page. Returns who the reset is for, or null if
 * the token is unknown, already used, or expired.
 */
export async function getResetTokenInfo(
  token: string
): Promise<{ userName: string; email: string } | null> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  return { userName: row.user.name, email: row.user.email };
}

/**
 * Set a new password using a valid token. Marks the token used so a link can
 * only ever be redeemed once.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { ok: false, error: 'This reset link is invalid or has expired. Ask for a new one.' };
  }
  if (newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
  ]);
  return { ok: true };
}

export interface OpenResetRequest {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  userName: string;
  email: string;
  companyName: string;
  memberId: string;
}

/**
 * Open (unused, unexpired) reset requests for the admin panel, newest first.
 */
export async function listOpenResetRequests(): Promise<OpenResetRequest[]> {
  const rows = await prisma.passwordResetToken.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          company: { select: { name: true, memberId: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    token: r.token,
    createdAt: r.createdAt,
    expiresAt: r.expiresAt,
    userName: r.user.name,
    email: r.user.email,
    companyName: r.user.company.name,
    memberId: r.user.company.memberId,
  }));
}
