import { prisma } from '@/lib/db';
import type { Company, TeamNode, UplineSnapshot, TeamRole } from '@/lib/types';

// ============================================================================
// Upline / Downline
// ============================================================================

/**
 * Walk the direct-manager chain up to 3 levels, returning the snapshot used
 * to split payouts. Club Admin is resolved as the first CLUB_ADMIN role ancestor
 * (or the single CLUB_ADMIN company if only one exists).
 */
export async function getUplineSnapshot(
  memberCompanyId: string
): Promise<UplineSnapshot> {
  const member = await prisma.company.findUnique({
    where: { id: memberCompanyId },
    select: {
      l1ManagerCompanyId: true,
      originalSponsorCompanyId: true,
    },
  });
  if (!member) {
    return {
      l1ManagerCompanyId: null,
      l2ManagerCompanyId: null,
      l3ManagerCompanyId: null,
      clubAdminCompanyId: null,
      originalSponsorCompanyId: null,
    };
  }

  const l1 = member.l1ManagerCompanyId;
  const l2 = l1
    ? (await prisma.company.findUnique({
        where: { id: l1 },
        select: { l1ManagerCompanyId: true },
      }))?.l1ManagerCompanyId ?? null
    : null;
  const l3 = l2
    ? (await prisma.company.findUnique({
        where: { id: l2 },
        select: { l1ManagerCompanyId: true },
      }))?.l1ManagerCompanyId ?? null
    : null;

  // Club admin: first CLUB_ADMIN in chain, else the system's CLUB_ADMIN (if one).
  let clubAdminCompanyId: string | null = null;
  for (const candidate of [l1, l2, l3]) {
    if (!candidate) continue;
    const c = await prisma.company.findUnique({
      where: { id: candidate },
      select: { teamRole: true },
    });
    if (c?.teamRole === 'CLUB_ADMIN') {
      clubAdminCompanyId = candidate;
      break;
    }
  }
  if (!clubAdminCompanyId) {
    const adminCompany = await prisma.company.findFirst({
      where: { teamRole: 'CLUB_ADMIN' },
      select: { id: true },
    });
    clubAdminCompanyId = adminCompany?.id ?? null;
  }

  return {
    l1ManagerCompanyId: l1 ?? null,
    l2ManagerCompanyId: l2,
    l3ManagerCompanyId: l3,
    clubAdminCompanyId,
    originalSponsorCompanyId: member.originalSponsorCompanyId ?? null,
  };
}

/**
 * Get the direct upline chain (as Company rows) up to 3 levels + club admin.
 */
export async function getUplineCompanies(
  memberCompanyId: string
): Promise<Company[]> {
  const snap = await getUplineSnapshot(memberCompanyId);
  const ids = [
    snap.l1ManagerCompanyId,
    snap.l2ManagerCompanyId,
    snap.l3ManagerCompanyId,
    snap.clubAdminCompanyId,
  ].filter((id): id is string => !!id);
  if (ids.length === 0) return [];
  const rows = await prisma.company.findMany({ where: { id: { in: ids } } });
  // Preserve order
  return ids
    .map((id) => rows.find((r) => r.id === id))
    .filter((r): r is Company => !!r);
}

/**
 * Build a team tree rooted at `rootCompanyId` down to `maxDepth`.
 */
export async function getDownlineTree(
  rootCompanyId: string,
  maxDepth = 3
): Promise<TeamNode> {
  const root = await prisma.company.findUnique({
    where: { id: rootCompanyId },
    select: { id: true, name: true, memberId: true, teamRole: true },
  });
  if (!root) throw new Error('Root company not found');

  async function build(node: NonNullable<typeof root>, depth: number): Promise<TeamNode> {
    if (depth >= maxDepth) {
      return {
        id: node.id,
        name: node.name,
        memberId: node.memberId,
        teamRole: node.teamRole,
        directDownline: [],
      };
    }
    const children = await prisma.company.findMany({
      where: { l1ManagerCompanyId: node.id },
      select: { id: true, name: true, memberId: true, teamRole: true },
      orderBy: { name: 'asc' },
    });
    const built = await Promise.all(children.map((c) => build(c, depth + 1)));
    return {
      id: node.id,
      name: node.name,
      memberId: node.memberId,
      teamRole: node.teamRole,
      directDownline: built,
    };
  }

  return build(root, 0);
}

// ============================================================================
// Team Moves
// ============================================================================

/**
 * Change the L-1 Manager for a member company. MemberId stays the same.
 * Closes the current TeamMembership history row and opens a new one.
 */
export async function changeL1Manager(
  memberCompanyId: string,
  newL1ManagerCompanyId: string
): Promise<void> {
  if (memberCompanyId === newL1ManagerCompanyId) {
    throw new Error('Cannot be your own manager');
  }

  // Cycle check — climb new manager's chain; fail if we encounter `memberCompanyId`.
  let cursor: string | null = newL1ManagerCompanyId;
  const visited = new Set<string>();
  while (cursor) {
    if (cursor === memberCompanyId) {
      throw new Error('Cycle detected: cannot set a downline member as your manager');
    }
    if (visited.has(cursor)) break;
    visited.add(cursor);
    const parent: { l1ManagerCompanyId: string | null } | null =
      await prisma.company.findUnique({
        where: { id: cursor },
        select: { l1ManagerCompanyId: true },
      });
    cursor = parent?.l1ManagerCompanyId ?? null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.teamMembership.updateMany({
      where: { companyId: memberCompanyId, endedAt: null },
      data: { endedAt: new Date() },
    });
    await tx.teamMembership.create({
      data: {
        companyId: memberCompanyId,
        l1ManagerCompanyId: newL1ManagerCompanyId,
      },
    });
    await tx.company.update({
      where: { id: memberCompanyId },
      data: { l1ManagerCompanyId: newL1ManagerCompanyId },
    });
  });
}

/**
 * Set the original sponsor once. After first set, this function is a no-op
 * so historical 1% lifetime payouts stay attached correctly.
 */
export async function setOriginalSponsor(
  memberCompanyId: string,
  sponsorCompanyId: string
): Promise<void> {
  if (memberCompanyId === sponsorCompanyId) return;
  const existing = await prisma.company.findUnique({
    where: { id: memberCompanyId },
    select: { originalSponsorCompanyId: true },
  });
  if (!existing) throw new Error('Company not found');
  if (existing.originalSponsorCompanyId) return; // already set, immutable
  await prisma.company.update({
    where: { id: memberCompanyId },
    data: { originalSponsorCompanyId: sponsorCompanyId },
  });
}

// ============================================================================
// Lookups
// ============================================================================

export async function listManagersAndAbove(): Promise<Company[]> {
  const roles: TeamRole[] = ['L1_MANAGER', 'L2_MANAGER', 'L3_MANAGER', 'CLUB_ADMIN'];
  return prisma.company.findMany({
    where: { teamRole: { in: roles }, isSuspended: false },
    orderBy: [{ teamRole: 'asc' }, { name: 'asc' }],
  });
}

export async function listDirectDownline(
  managerCompanyId: string
): Promise<Company[]> {
  return prisma.company.findMany({
    where: { l1ManagerCompanyId: managerCompanyId },
    orderBy: { name: 'asc' },
  });
}
