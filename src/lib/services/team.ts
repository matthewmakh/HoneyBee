import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import type { Company, User } from '@prisma/client';

export interface AdminTeamMember
  extends Pick<User, 'id' | 'name' | 'email' | 'phone' | 'lastActiveAt' | 'createdAt'> {
  company: Pick<Company, 'id' | 'name' | 'memberId'>;
}

/**
 * An error whose message is safe to show the operator. Anything else that
 * escapes these services is an internal fault and must not be surfaced
 * verbatim — Prisma errors in particular embed file paths and query internals.
 */
export class TeamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamError';
  }
}

/**
 * Every platform super admin, oldest first — the first row is the account the
 * platform was bootstrapped with.
 */
export async function getAdminUsers(): Promise<AdminTeamMember[]> {
  return prisma.user.findMany({
    where: { role: 'SUPERADMIN' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      lastActiveAt: true,
      createdAt: true,
      company: { select: { id: true, name: true, memberId: true } },
    },
  });
}

interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  /** Company the new admin joins — normally the platform company. */
  companyId: string;
}

/**
 * Add a super admin to an existing company. Admins are not given their own
 * company: they share the platform company so the member roster stays clean.
 */
export async function createAdminUser(input: CreateAdminInput): Promise<AdminTeamMember> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new TeamError('That email is already registered');
  }

  const company = await prisma.company.findUnique({ where: { id: input.companyId } });
  if (!company) {
    throw new TeamError('Platform company not found');
  }

  const passwordHash = await hash(input.password, 12);

  return prisma.user.create({
    data: {
      companyId: input.companyId,
      name: input.name.trim(),
      email,
      passwordHash,
      role: 'SUPERADMIN',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      lastActiveAt: true,
      createdAt: true,
      company: { select: { id: true, name: true, memberId: true } },
    },
  });
}

/**
 * Remove a super admin. Refuses to remove the last one so the platform can
 * never be locked out of its own admin panel.
 */
export async function revokeAdminUser(userId: string, actingUserId: string): Promise<void> {
  if (userId === actingUserId) {
    throw new TeamError('You cannot remove your own admin account');
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!target || target.role !== 'SUPERADMIN') {
    throw new TeamError('Admin account not found');
  }

  const adminCount = await prisma.user.count({ where: { role: 'SUPERADMIN' } });
  if (adminCount <= 1) {
    throw new TeamError('Cannot remove the last remaining admin');
  }

  await prisma.user.delete({ where: { id: userId } });
}
