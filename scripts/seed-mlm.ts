/**
 * Seed a small MLM "Bee Club" tree + default 12-line commission plan.
 *
 * Run with:  npx tsx scripts/seed-mlm.ts
 *
 * This script is additive — it does NOT delete existing data. It upserts a
 * demo tree rooted at a Club Admin (`HB-MLM-0001`) so the new team UI has
 * something to display.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_COMMISSION_PLAN } from '../src/lib/types';

const prisma = new PrismaClient();

async function upsertCompany(
  memberId: string,
  name: string,
  teamRole:
    | 'CLUB_ADMIN'
    | 'L3_MANAGER'
    | 'L2_MANAGER'
    | 'L1_MANAGER'
    | 'MEMBER'
    | 'PROVIDER',
  l1ManagerCompanyId: string | null,
  extra: {
    canUseProviderPortal?: boolean;
    originalSponsorCompanyId?: string | null;
  } = {}
) {
  const existing = await prisma.company.findUnique({ where: { memberId } });
  if (existing) {
    return prisma.company.update({
      where: { memberId },
      data: {
        name,
        teamRole,
        l1ManagerCompanyId,
        canUseReferrerPortal: true,
        canUseProviderPortal: extra.canUseProviderPortal ?? false,
        originalSponsorCompanyId:
          extra.originalSponsorCompanyId ?? existing.originalSponsorCompanyId,
      },
    });
  }
  return prisma.company.create({
    data: {
      memberId,
      name,
      teamRole,
      l1ManagerCompanyId,
      canUseReferrerPortal: true,
      canUseProviderPortal: extra.canUseProviderPortal ?? false,
      originalSponsorCompanyId: extra.originalSponsorCompanyId ?? null,
    },
  });
}

async function ensureUser(companyId: string, email: string, name: string) {
  const hashed = await bcrypt.hash('password123', 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      email,
      name,
      companyId,
      passwordHash: hashed,
      role: UserRole.USER,
    },
  });
}

async function ensureMembership(
  companyId: string,
  l1ManagerCompanyId: string | null
) {
  const open = await prisma.teamMembership.findFirst({
    where: { companyId, endedAt: null },
  });
  if (open && open.l1ManagerCompanyId === l1ManagerCompanyId) return;
  if (open) {
    await prisma.teamMembership.update({
      where: { id: open.id },
      data: { endedAt: new Date() },
    });
  }
  await prisma.teamMembership.create({
    data: { companyId, l1ManagerCompanyId },
  });
}

async function seedCommissionPlan() {
  const existing = await prisma.commissionPlan.findFirst({
    where: { isActive: true },
  });
  if (existing) {
    console.log(`  Plan exists: ${existing.name}`);
    return existing;
  }
  const plan = await prisma.commissionPlan.create({
    data: {
      name: 'Default 12-Line Plan',
      isActive: true,
      lines: {
        create: DEFAULT_COMMISSION_PLAN.map((d) => ({
          lineType: d.lineType,
          label: d.label,
          percentBps: d.percentBps,
          isActive: true,
        })),
      },
    },
  });
  console.log(`  Created plan: ${plan.name}`);
  return plan;
}

async function main() {
  console.log('🐝 Seeding MLM tree + commission plan\n');

  console.log('📐 Commission plan...');
  await seedCommissionPlan();

  console.log('\n👑 Club Admin...');
  const clubAdmin = await upsertCompany(
    'HB-MLM-0001',
    'Honeybee Club Admin',
    'CLUB_ADMIN',
    null
  );
  await ensureUser(clubAdmin.id, 'clubadmin@honeybee.demo', 'Club Admin');
  await ensureMembership(clubAdmin.id, null);
  console.log(`  ${clubAdmin.memberId}  ${clubAdmin.name}`);

  console.log('\n🟣 L3 Managers...');
  const l3s = [];
  for (let i = 1; i <= 2; i++) {
    const memberId = `HB-MLM-L3${String(i).padStart(2, '0')}`;
    const c = await upsertCompany(
      memberId,
      `L3 Manager ${i}`,
      'L3_MANAGER',
      clubAdmin.id,
      { originalSponsorCompanyId: clubAdmin.id }
    );
    await ensureUser(c.id, `l3-${i}@honeybee.demo`, `L3 Manager ${i}`);
    await ensureMembership(c.id, clubAdmin.id);
    l3s.push(c);
    console.log(`  ${c.memberId}  ${c.name}`);
  }

  console.log('\n🔵 L2 Managers...');
  const l2s = [];
  for (let i = 0; i < 4; i++) {
    const parent = l3s[i % l3s.length]!;
    const memberId = `HB-MLM-L2${String(i + 1).padStart(2, '0')}`;
    const c = await upsertCompany(
      memberId,
      `L2 Manager ${i + 1}`,
      'L2_MANAGER',
      parent.id,
      { originalSponsorCompanyId: parent.id }
    );
    await ensureUser(c.id, `l2-${i + 1}@honeybee.demo`, `L2 Manager ${i + 1}`);
    await ensureMembership(c.id, parent.id);
    l2s.push(c);
    console.log(`  ${c.memberId}  under ${parent.memberId}`);
  }

  console.log('\n🟢 L1 Managers...');
  const l1s = [];
  for (let i = 0; i < 8; i++) {
    const parent = l2s[i % l2s.length]!;
    const memberId = `HB-MLM-L1${String(i + 1).padStart(2, '0')}`;
    const c = await upsertCompany(
      memberId,
      `L1 Manager ${i + 1}`,
      'L1_MANAGER',
      parent.id,
      { originalSponsorCompanyId: parent.id }
    );
    await ensureUser(c.id, `l1-${i + 1}@honeybee.demo`, `L1 Manager ${i + 1}`);
    await ensureMembership(c.id, parent.id);
    l1s.push(c);
    console.log(`  ${c.memberId}  under ${parent.memberId}`);
  }

  console.log('\n🐝 Bee Team Members...');
  for (let i = 0; i < 16; i++) {
    const parent = l1s[i % l1s.length]!;
    const memberId = `HB-MLM-M${String(i + 1).padStart(3, '0')}`;
    const c = await upsertCompany(
      memberId,
      `Bee Member ${i + 1}`,
      'MEMBER',
      parent.id,
      { originalSponsorCompanyId: parent.id }
    );
    await ensureUser(c.id, `member-${i + 1}@honeybee.demo`, `Bee Member ${i + 1}`);
    await ensureMembership(c.id, parent.id);
  }
  console.log('  16 members seeded');

  console.log('\n🛠  A-Team Providers...');
  const providers = [
    { name: 'Sunshine Solar', suffix: 'P01' },
    { name: 'Redwood Roofing', suffix: 'P02' },
    { name: 'Ironclad Fencing', suffix: 'P03' },
    { name: 'CleanSlate Painters', suffix: 'P04' },
  ];
  for (const p of providers) {
    const memberId = `HB-MLM-${p.suffix}`;
    const c = await upsertCompany(memberId, p.name, 'PROVIDER', null, {
      canUseProviderPortal: true,
    });
    await ensureUser(
      c.id,
      `${p.suffix.toLowerCase()}@honeybee.demo`,
      `${p.name} Owner`
    );
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { companyId: c.id },
    });
    if (!existingProfile) {
      await prisma.providerProfile.create({
        data: {
          companyId: c.id,
          zipCode: '10001',
          serviceCategories: [p.name.split(' ')[1] ?? 'Home Services'],
          shortDescription: `${p.name} — MLM demo provider.`,
          commissionType: 'PERCENT',
          commissionValue: 10,
          isPublished: true,
          pitchPhotos: [],
          dos: ['Ask about warranty', 'Get written quote'],
          donts: ['Pay in full upfront'],
          publicSlug: `${p.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}-${c.id.slice(-6)}`,
        },
      });
    }
    console.log(`  ${c.memberId}  ${c.name}`);
  }

  console.log('\n✅ MLM seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
