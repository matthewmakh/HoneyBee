/**
 * Grants SUPERADMIN to an account and sets its password. Creates the account
 * if it does not exist yet.
 *
 *   npm run db:grant-admin -- --prod matt@tyeny.com
 *   npm run db:grant-admin -- matt@tyeny.com          (uses DATABASE_URL)
 *
 * Deliberately uses raw SQL for every statement. The production database runs
 * the MLM schema (CommissionPlan, TeamMembership, PayoutLedger, teamRole,
 * PROVIDER_CHARGE) which the Prisma client generated from this branch's
 * schema.prisma cannot decode. Raw SQL touches only the columns named here,
 * so this works against either schema.
 *
 * Writes nothing but one User row. No wipe, no other tables.
 *
 * The password is read from ADMIN_PASSWORD if set, otherwise prompted for with
 * the input hidden. It is never stored in this file or in the repo.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';
import { randomBytes } from 'crypto';
import type { Writable } from 'stream';

try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the ambient environment
}

const MIN_PASSWORD_LENGTH = 12;
const args = process.argv.slice(2);
const useProd = args.includes('--prod');
const email = args.find((a) => !a.startsWith('-'))?.trim().toLowerCase();

const url = useProd ? process.env.PRODUCTION_DATABASE_URL : process.env.DATABASE_URL;

if (!email) {
  console.error('\n❌ Pass the account email:\n\n     npm run db:grant-admin -- --prod you@example.com\n');
  process.exit(1);
}
if (!url) {
  console.error(
    `\n❌ ${useProd ? 'PRODUCTION_DATABASE_URL' : 'DATABASE_URL'} is not set in .env.\n`
  );
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

/** Prisma generates cuids client-side and User.id has no database default. */
function cuid(): string {
  return `c${Date.now().toString(36)}${randomBytes(9).toString('hex')}`;
}

function promptPassword(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(new Error('ADMIN_PASSWORD is not set and there is no interactive terminal to prompt from.'));
      return;
    }
    let muted = false;
    const mutedOut: Writable = Object.create(process.stdout, {
      write: {
        value: (chunk: string, ...rest: unknown[]) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!muted) return (process.stdout.write as any)(chunk, ...rest);
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
  const password = await promptPassword('New password: ');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if ((await promptPassword('Confirm password: ')) !== password) {
    throw new Error('Passwords do not match.');
  }
  return password;
}

async function main() {
  // Always state the target first. Pointing a script at the wrong database is
  // exactly how this account ended up missing in the first place.
  console.log(`\n🎯 Database: ${url!.replace(/^.*@/, '').replace(/\?.*$/, '')}`);

  const admins = await prisma.$queryRawUnsafe<{ email: string }[]>(
    `SELECT email FROM "User" WHERE role = 'SUPERADMIN' ORDER BY "createdAt"`
  );
  console.log(`   Existing super admins: ${admins.map((a) => a.email).join(', ') || '(none)'}`);

  const found = await prisma.$queryRawUnsafe<{ id: string; role: string; name: string }[]>(
    `SELECT id, role::text AS role, name FROM "User" WHERE lower(email) = $1`,
    email
  );
  const existing = found[0];
  console.log(
    existing
      ? `   ${email} exists (currently ${existing.role}) — promoting and setting password.`
      : `   ${email} does not exist — creating as SUPERADMIN.`
  );

  let companyId: string | undefined;
  if (!existing) {
    // Join the company the platform already uses for admins rather than
    // creating one: Company carries MLM columns this script must not guess at.
    const host = await prisma.$queryRawUnsafe<{ id: string; name: string; memberId: string }[]>(
      `SELECT c.id, c.name, c."memberId" FROM "Company" c
       JOIN "User" u ON u."companyId" = c.id
       WHERE u.role = 'SUPERADMIN' ORDER BY c."createdAt" LIMIT 1`
    );
    if (!host[0]) {
      throw new Error('No existing super-admin company to attach to. Create one first.');
    }
    companyId = host[0].id;
    console.log(`   Joining company: ${host[0].name} (${host[0].memberId})`);
  }

  const password = await resolvePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "passwordHash" = $1, role = 'SUPERADMIN' WHERE id = $2`,
      passwordHash,
      existing.id
    );
  } else {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, "companyId", name, email, "passwordHash", role, "createdAt")
       VALUES ($1, $2, $3, $4, $5, 'SUPERADMIN', CURRENT_TIMESTAMP)`,
      cuid(),
      companyId,
      process.env.ADMIN_NAME ?? 'Matthew Makh',
      email,
      passwordHash
    );
  }

  // Read back and verify rather than trusting the write.
  const check = await prisma.$queryRawUnsafe<{ passwordHash: string; role: string }[]>(
    `SELECT "passwordHash", role::text AS role FROM "User" WHERE lower(email) = $1`,
    email
  );
  const row = check[0];
  if (!row) throw new Error('Account not found after write.');
  if (row.role !== 'SUPERADMIN') throw new Error(`Role is ${row.role}, expected SUPERADMIN.`);
  if (!(await bcrypt.compare(password, row.passwordHash))) {
    throw new Error('Password was written but did not verify. Try again.');
  }

  console.log(`\n✅ ${email} is SUPERADMIN and the password verifies.`);
  console.log('   Sign in at /login — you will land on /admin.\n');
}

main()
  .catch((error) => {
    console.error(`\n❌ ${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
