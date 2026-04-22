import { PrismaClient, UserRole, CommissionType, LeadStatus, WalletTransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.walletTransaction.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('✅ Cleaned\n');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // Create Super Admin Company first
  console.log('👑 Creating Super Admin...');
  const adminCompany = await prisma.company.create({
    data: {
      name: 'Honeybee Platform',
      memberId: 'HB-000001',
      canUseReferrerPortal: true,
      canUseProviderPortal: true,
      isSuspended: false,
    },
  });

  const superAdmin = await prisma.user.create({
    data: {
      companyId: adminCompany.id,
      email: 'admin@honeybee.com',
      passwordHash: hashedPassword,
      name: 'System Admin',
      role: UserRole.SUPERADMIN,
    },
  });
  console.log(`✅ Super Admin: ${superAdmin.email}\n`);

  // Create Referrer Company
  console.log('🐝 Creating Referrer Company...');
  const referrerCompany = await prisma.company.create({
    data: {
      name: 'Golden Referrals LLC',
      memberId: 'HB-000002',
      canUseReferrerPortal: true,
      canUseProviderPortal: false,
      isSuspended: false,
    },
  });

  const referrer1 = await prisma.user.create({
    data: {
      companyId: referrerCompany.id,
      email: 'john@goldenreferrals.com',
      passwordHash: hashedPassword,
      name: 'John Smith',
      role: UserRole.USER,
    },
  });

  const referrer2 = await prisma.user.create({
    data: {
      companyId: referrerCompany.id,
      email: 'jane@goldenreferrals.com',
      passwordHash: hashedPassword,
      name: 'Jane Doe',
      role: UserRole.USER,
    },
  });

  await prisma.company.update({
    where: { id: referrerCompany.id },
    data: { cashBalance: 250, benefitsBalance: 200 },
  });

  console.log(`✅ Referrer Company: ${referrerCompany.name}`);
  console.log(`   - ${referrer1.email}`);
  console.log(`   - ${referrer2.email}\n`);

  // Create Provider Companies
  console.log('🔧 Creating Provider Companies...');

  const providerCompany1 = await prisma.company.create({
    data: {
      name: 'Cool Air HVAC Services',
      memberId: 'HB-000003',
      canUseReferrerPortal: true, // Providers automatically get referrer access
      canUseProviderPortal: true,
    },
  });

  await prisma.user.create({
    data: {
      companyId: providerCompany1.id,
      email: 'mike@coolair.com',
      passwordHash: hashedPassword,
      name: 'Mike Johnson',
      role: UserRole.USER,
    },
  });

  await prisma.providerProfile.create({
    data: {
      companyId: providerCompany1.id,
      zipCode: '11201',
      serviceCategories: ['HVAC Installation', 'HVAC Repair', 'Maintenance'],
      shortDescription: 'Full-service HVAC installation, repair, and maintenance. 20+ years experience.',
      commissionType: CommissionType.FLAT,
      commissionValue: 150,
      isPublished: true,
    },
  });

  const providerCompany2 = await prisma.company.create({
    data: {
      name: 'FastFlow Plumbing',
      memberId: 'HB-000004',
      canUseReferrerPortal: true, // Providers automatically get referrer access
      canUseProviderPortal: true,
    },
  });

  await prisma.user.create({
    data: {
      companyId: providerCompany2.id,
      email: 'sarah@fastflow.com',
      passwordHash: hashedPassword,
      name: 'Sarah Williams',
      role: UserRole.USER,
    },
  });

  await prisma.providerProfile.create({
    data: {
      companyId: providerCompany2.id,
      zipCode: '10001',
      serviceCategories: ['Plumbing', 'Emergency Services', 'Water Heaters'],
      shortDescription: 'Emergency plumbing services 24/7. Drain cleaning, pipe repair, water heater installation.',
      commissionType: CommissionType.PERCENT,
      commissionValue: 10,
      isPublished: true,
    },
  });

  const providerCompany3 = await prisma.company.create({
    data: {
      name: 'Bright Spark Electric',
      memberId: 'HB-000005',
      canUseReferrerPortal: true, // Providers automatically get referrer access
      canUseProviderPortal: true,
    },
  });

  await prisma.user.create({
    data: {
      companyId: providerCompany3.id,
      email: 'tom@brightspark.com',
      passwordHash: hashedPassword,
      name: 'Tom Brown',
      role: UserRole.USER,
    },
  });

  await prisma.providerProfile.create({
    data: {
      companyId: providerCompany3.id,
      zipCode: '11375',
      serviceCategories: ['Electrical', 'Smart Home', 'Commercial'],
      shortDescription: 'Residential and commercial electrical services. Panel upgrades, rewiring, smart home.',
      commissionType: CommissionType.FLAT,
      commissionValue: 200,
      isPublished: true,
    },
  });

  console.log('✅ Provider Companies created\n');

  // Create sample leads
  console.log('📋 Creating Sample Leads...');

  await prisma.lead.create({
    data: {
      providerCompanyId: providerCompany1.id,
      referrerCompanyId: referrerCompany.id,
      homeownerName: 'Robert Garcia',
      homeownerPhone: '555-888-1111',
      homeownerAddress: '123 Main St, Brooklyn, NY 11201',
      projectDescription: 'Central AC installation for 3-bedroom home',
      category: 'HVAC Installation',
      status: LeadStatus.SUBMITTED,
      commissionTypeSnapshot: CommissionType.FLAT,
      commissionValueSnapshot: 150,
    },
  });

  await prisma.lead.create({
    data: {
      providerCompanyId: providerCompany2.id,
      referrerCompanyId: referrerCompany.id,
      homeownerName: 'Lisa Chen',
      homeownerPhone: '555-888-2222',
      homeownerAddress: '456 Oak Ave, Manhattan, NY 10001',
      projectDescription: 'Water heater replacement - 50 gallon tank',
      category: 'Water Heaters',
      status: LeadStatus.ACCEPTED,
      commissionTypeSnapshot: CommissionType.PERCENT,
      commissionValueSnapshot: 10,
    },
  });

  await prisma.lead.create({
    data: {
      providerCompanyId: providerCompany3.id,
      referrerCompanyId: referrerCompany.id,
      homeownerName: 'David Kim',
      homeownerPhone: '555-888-3333',
      homeownerAddress: '789 Elm St, Queens, NY 11375',
      projectDescription: 'Electrical panel upgrade 100A to 200A',
      category: 'Electrical',
      status: LeadStatus.AWAITING_ADMIN_CONFIRMATION,
      commissionTypeSnapshot: CommissionType.FLAT,
      commissionValueSnapshot: 200,
      reportedJobValue: 2500,
      calculatedCommission: 200,
    },
  });

  const completedLead = await prisma.lead.create({
    data: {
      providerCompanyId: providerCompany1.id,
      referrerCompanyId: referrerCompany.id,
      homeownerName: 'Amanda Foster',
      homeownerPhone: '555-888-4444',
      homeownerAddress: '321 Pine Rd, Brooklyn, NY 11215',
      projectDescription: 'Furnace repair and maintenance',
      category: 'HVAC Repair',
      status: LeadStatus.COMPLETED_CONFIRMED,
      commissionTypeSnapshot: CommissionType.FLAT,
      commissionValueSnapshot: 150,
      reportedJobValue: 800,
      calculatedCommission: 150,
    },
  });

  await prisma.walletTransaction.createMany({
    data: [
      {
        companyId: referrerCompany.id,
        leadId: completedLead.id,
        type: WalletTransactionType.CASH,
        amount: 75,
      },
      {
        companyId: referrerCompany.id,
        leadId: completedLead.id,
        type: WalletTransactionType.BENEFITS,
        amount: 60,
      },
    ],
  });

  await prisma.lead.create({
    data: {
      providerCompanyId: providerCompany2.id,
      referrerCompanyId: referrerCompany.id,
      homeownerName: 'James Wilson',
      homeownerPhone: '555-888-5555',
      homeownerAddress: '555 Cedar Ln, Staten Island, NY 10301',
      projectDescription: 'Bathroom remodel plumbing',
      category: 'Plumbing',
      status: LeadStatus.REJECTED,
      commissionTypeSnapshot: CommissionType.PERCENT,
      commissionValueSnapshot: 10,
    },
  });

  console.log('✅ Created 5 sample leads\n');
  console.log('🎉 Seed completed!\n');
  console.log('Login Credentials (password: Test123!):');
  console.log('  Super Admin: admin@honeybee.com');
  console.log('  Referrer:    john@goldenreferrals.com / jane@goldenreferrals.com');
  console.log('  Providers:   mike@coolair.com / sarah@fastflow.com / tom@brightspark.com');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
