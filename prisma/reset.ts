/**
 * Wipes every record from the database and bootstraps a single super admin.
 *
 * This is destructive and irreversible — it is meant to be run once, to clear
 * test data before handing the platform over. It refuses to run without an
 * explicit confirmation flag.
 *
 *   npm run db:reset -- --yes
 *
 * The admin password is never stored in this file or in the repo. Set
 * ADMIN_PASSWORD in the environment, or leave it unset and the script will
 * prompt for it with the input hidden.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';
import type { Writable } from 'stream';

// Pick up DATABASE_URL from .env when running locally. On a host that injects
// env vars directly (Railway) there is no file and this is a no-op.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the ambient environment
}

if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL is not set. Add it to .env or export it.\n');
  process.exit(1);
}

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'matt@tyeny.com').trim().toLowerCase();
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Matthew Makh';
const PLATFORM_COMPANY = process.env.PLATFORM_COMPANY_NAME ?? 'Honeybee Platform';
const MIN_PASSWORD_LENGTH = 12;

/** Read a password from the TTY without echoing it. */
function promptPassword(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error(
          'ADMIN_PASSWORD is not set and there is no interactive terminal to prompt from.'
        )
      );
      return;
    }

    let muted = false;
    const mutedOut: Writable = Object.create(process.stdout, {
      write: {
        value: (chunk: string, ...args: unknown[]) => {
          if (!muted) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (process.stdout.write as any)(chunk, ...args);
          }
          return true;
        },
      },
    });

    const rl = createInterface({ input: process.stdin, output: mutedOut, terminal: true });

    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });

    muted = true;
  });
}

async function resolvePassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv) {
    if (fromEnv.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    return fromEnv;
  }

  const password = await promptPassword(`Password for ${ADMIN_EMAIL}: `);
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const confirm = await promptPassword('Confirm password: ');
  if (password !== confirm) {
    throw new Error('Passwords do not match.');
  }

  return password;
}

async function main() {
  if (!process.argv.includes('--yes')) {
    console.error(
      '\n⚠️  This deletes EVERY record in the database pointed at by DATABASE_URL.\n' +
        '   Re-run with --yes to confirm:\n\n' +
        '     npm run db:reset -- --yes\n'
    );
    process.exitCode = 1;
    return;
  }

  const dbHost = process.env.DATABASE_URL?.replace(/^.*@/, '').replace(/\?.*$/, '');
  console.log(`\n🎯 Target database: ${dbHost ?? 'unknown'}`);

  const before = await prisma.$transaction([
    prisma.company.count(),
    prisma.user.count(),
    prisma.lead.count(),
    prisma.walletTransaction.count(),
  ]);
  console.log(
    `   Currently holds ${before[0]} companies, ${before[1]} users, ` +
      `${before[2]} leads, ${before[3]} transactions.\n`
  );

  const password = await resolvePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  console.log('🧹 Deleting all records...');
  // Children first — the schema cascades, but explicit ordering keeps this
  // correct even if a relation stops cascading later.
  await prisma.review.deleteMany();
  await prisma.priceChangeRequest.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('✅ Database cleared\n');

  console.log('👑 Creating super admin...');
  const company = await prisma.company.create({
    data: {
      name: PLATFORM_COMPANY,
      memberId: 'HB-000001',
      canUseReferrerPortal: true,
      canUseProviderPortal: true,
      isSuspended: false,
    },
  });

  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: UserRole.SUPERADMIN,
    },
  });

  const after = await prisma.$transaction([
    prisma.company.count(),
    prisma.user.count(),
    prisma.lead.count(),
    prisma.walletTransaction.count(),
  ]);

  console.log(`✅ Super admin created: ${admin.email}`);
  console.log(`   Company: ${company.name} (${company.memberId})\n`);
  console.log(
    `📊 Database now holds ${after[0]} company, ${after[1]} user, ` +
      `${after[2]} leads, ${after[3]} transactions.`
  );
  console.log(`\n🔑 Sign in at /login as ${admin.email} — you'll land on /admin.`);
  console.log('   Add more admins from Admin → Team.\n');
}

main()
  .catch((error) => {
    console.error(`\n❌ ${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
