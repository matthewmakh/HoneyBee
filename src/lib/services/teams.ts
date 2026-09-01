import { prisma } from '@/lib/db';
import type { Company, TeamNode, UplineSnapshot, TeamRole, CompanyContact } from '@/lib/types';

const PRIMARY_CONTACT_SELECT = {
  users: {
    select: { name: true, email: true, phone: true },
    orderBy: { createdAt: 'asc' as const },
    take: 1,
  },
};

/**
 * Map each company id to its primary (oldest) user contact. Powers the
 * upline/downline "contact this person" links.
 */
export async function getContactsForCompanies(
  ids: string[]
): Promise<Map<string, CompanyContact>> {
  const map = new Map<string, CompanyContact>();
  if (ids.length === 0) return map;
  const users = await prisma.user.findMany({
    where: { companyId: { in: ids } },
    select: { companyId: true, name: true, email: true, phone: true },
    orderBy: { createdAt: 'asc' },
  });
  for (const u of users) {
    if (!map.has(u.companyId)) {
      map.set(u.companyId, { name: u.name, email: u.email, phone: u.phone });
    }
  }
  return map;
}

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
    select: { id: true, name: true, memberId: true, teamRole: true, ...PRIMARY_CONTACT_SELECT },
  });
  if (!root) throw new Error('Root company not found');

  type Row = NonNullable<typeof root>;
  const toNode = (node: Row, directDownline: TeamNode[]): TeamNode => {
    const contact = node.users[0];
    return {
      id: node.id,
      name: node.name,
      memberId: node.memberId,
      teamRole: node.teamRole,
      contactName: contact?.name ?? null,
      email: contact?.email ?? null,
      phone: contact?.phone ?? null,
      directDownline,
    };
  };

  async function build(node: Row, depth: number): Promise<TeamNode> {
    if (depth >= maxDepth) {
      return toNode(node, []);
    }
    const children = await prisma.company.findMany({
      where: { l1ManagerCompanyId: node.id },
      select: { id: true, name: true, memberId: true, teamRole: true, ...PRIMARY_CONTACT_SELECT },
      orderBy: { name: 'asc' },
    });
    const built = await Promise.all(children.map((c) => build(c, depth + 1)));
    return toNode(node, built);
  }

  return build(root, 0);
}

// ============================================================================
// Team page cards (identity + My Team / My Upline / My Downline)
// ============================================================================

export interface TeamMemberCard {
  id: string;
  name: string;
  memberId: string;
  teamRole: TeamRole;
  logoUrl: string | null;
  publicSlug: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
}

const MEMBER_CARD_SELECT = {
  id: true,
  name: true,
  memberId: true,
  teamRole: true,
  logoUrl: true,
  providerProfile: { select: { publicSlug: true } },
  users: {
    select: { name: true, email: true, phone: true },
    orderBy: { createdAt: 'asc' as const },
    take: 1,
  },
};

type MemberCardRow = {
  id: string;
  name: string;
  memberId: string;
  teamRole: TeamRole;
  logoUrl: string | null;
  providerProfile: { publicSlug: string | null } | null;
  users: { name: string; email: string; phone: string | null }[];
};

function toMemberCard(row: MemberCardRow): TeamMemberCard {
  const contact = row.users[0];
  return {
    id: row.id,
    name: row.name,
    memberId: row.memberId,
    teamRole: row.teamRole,
    logoUrl: row.logoUrl,
    publicSlug: row.providerProfile?.publicSlug ?? null,
    contactName: contact?.name ?? null,
    email: contact?.email ?? null,
    phone: contact?.phone ?? null,
  };
}

/** The member's own identity card. */
export async function getMemberCard(companyId: string): Promise<TeamMemberCard | null> {
  const row = await prisma.company.findUnique({
    where: { id: companyId },
    select: MEMBER_CARD_SELECT,
  });
  return row ? toMemberCard(row as MemberCardRow) : null;
}

/**
 * "My Team" — everyone who shares my L-1 Manager (my crossline peers), excluding
 * me. If I have no manager I report to the club and have no crossline yet.
 */
export async function getCrossline(companyId: string): Promise<TeamMemberCard[]> {
  const me = await prisma.company.findUnique({
    where: { id: companyId },
    select: { l1ManagerCompanyId: true },
  });
  if (!me?.l1ManagerCompanyId) return [];
  const rows = await prisma.company.findMany({
    where: {
      l1ManagerCompanyId: me.l1ManagerCompanyId,
      id: { not: companyId },
    },
    select: MEMBER_CARD_SELECT,
    orderBy: { name: 'asc' },
  });
  return (rows as MemberCardRow[]).map(toMemberCard);
}

/**
 * "My Upline" — L-1 (sponsor), L-2, L-3 managers and the Club Admin, each as a
 * card (or null if not present).
 */
export async function getUplineCards(companyId: string): Promise<{
  l1: TeamMemberCard | null;
  l2: TeamMemberCard | null;
  l3: TeamMemberCard | null;
  clubAdmin: TeamMemberCard | null;
}> {
  const snap = await getUplineSnapshot(companyId);
  const ids = [
    snap.l1ManagerCompanyId,
    snap.l2ManagerCompanyId,
    snap.l3ManagerCompanyId,
    snap.clubAdminCompanyId,
  ].filter((id): id is string => !!id);

  const rows =
    ids.length > 0
      ? ((await prisma.company.findMany({
          where: { id: { in: ids } },
          select: MEMBER_CARD_SELECT,
        })) as MemberCardRow[])
      : [];
  const byId = new Map(rows.map((r) => [r.id, toMemberCard(r)]));
  const pick = (id: string | null) => (id ? byId.get(id) ?? null : null);
  return {
    l1: pick(snap.l1ManagerCompanyId),
    l2: pick(snap.l2ManagerCompanyId),
    l3: pick(snap.l3ManagerCompanyId),
    clubAdmin: pick(snap.clubAdminCompanyId),
  };
}

/**
 * "My Downline" — members for whom I'm the L-1, L-2, or L-3 manager, bucketed by
 * level (L-1 = direct, most prominent).
 */
export async function getDownlineCards(companyId: string): Promise<{
  l1: TeamMemberCard[];
  l2: TeamMemberCard[];
  l3: TeamMemberCard[];
}> {
  const l1Rows = (await prisma.company.findMany({
    where: { l1ManagerCompanyId: companyId },
    select: MEMBER_CARD_SELECT,
    orderBy: { name: 'asc' },
  })) as MemberCardRow[];

  const l1Ids = l1Rows.map((r) => r.id);
  const l2Rows =
    l1Ids.length > 0
      ? ((await prisma.company.findMany({
          where: { l1ManagerCompanyId: { in: l1Ids } },
          select: MEMBER_CARD_SELECT,
          orderBy: { name: 'asc' },
        })) as MemberCardRow[])
      : [];

  const l2Ids = l2Rows.map((r) => r.id);
  const l3Rows =
    l2Ids.length > 0
      ? ((await prisma.company.findMany({
          where: { l1ManagerCompanyId: { in: l2Ids } },
          select: MEMBER_CARD_SELECT,
          orderBy: { name: 'asc' },
        })) as MemberCardRow[])
      : [];

  return {
    l1: l1Rows.map(toMemberCard),
    l2: l2Rows.map(toMemberCard),
    l3: l3Rows.map(toMemberCard),
  };
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

/**
 * Resolve a sponsor from the member ID carried in an invite link.
 * Only an active (non-suspended) company with referrer access can sponsor;
 * anything else returns null and registration proceeds unsponsored.
 */
export async function resolveSponsorByMemberId(memberId: string): Promise<{
  id: string;
  name: string;
  memberId: string;
  teamRole: TeamRole;
} | null> {
  const normalized = memberId.trim().toUpperCase();
  if (!normalized) return null;
  const company = await prisma.company.findFirst({
    where: {
      memberId: { equals: normalized, mode: 'insensitive' },
      isSuspended: false,
      canUseReferrerPortal: true,
    },
    select: { id: true, name: true, memberId: true, teamRole: true },
  });
  return company;
}

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
