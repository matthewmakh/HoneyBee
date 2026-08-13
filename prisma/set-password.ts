/**
 * Sets the password for a single existing user. Touches nothing else — no
 * wipe, no other rows. Use this when an admin is locked out.
 *
 *   npm run db:set-password -- matt@tyeny.com
 *
 * The password is read from ADMIN_PASSWORD if set, otherwise prompted for
 * with the input hidden. It is never written to this file or to the repo.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createInterface } from 'readline';
import type { Writable } from 'stream';

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
const MIN_PASSWORD_LENGTH = 12;

function promptPassword(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      reject(
        new Error('ADMIN_PASSWORD is not set and there is no interactive terminal to prompt from.')
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

async function main() {
  const email = process.argv.slice(2).find((a) => !a.startsWith('-'))?.trim().toLowerCase();

  if (!email) {
    console.error('\n❌ Pass the account email:\n\n     npm run db:set-password -- you@example.com\n');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    const all = await prisma.user.findMany({ select: { email: true, role: true } });
    console.error(`\n❌ No user with email "${email}".\n\n   Accounts that do exist:`);
    for (const u of all) console.error(`     ${u.email}  (${u.role})`);
    console.error('');
    process.exitCode = 1;
    return;
  }

  const dbHost = process.env.DATABASE_URL?.replace(/^.*@/, '').replace(/\?.*$/, '');
  console.log(`\n🎯 Database: ${dbHost ?? 'unknown'}`);
  console.log(`   Setting a new password for ${user.name} <${user.email}> (${user.role}).`);
  console.log('   No other data is touched.\n');

  let password = process.env.ADMIN_PASSWORD;
  if (password) {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
  } else {
    password = await promptPassword('New password: ');
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    const confirm = await promptPassword('Confirm password: ');
    if (password !== confirm) {
      throw new Error('Passwords do not match.');
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Prove the stored hash actually verifies before declaring success.
  const stored = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  const verified = await bcrypt.compare(password, stored.passwordHash);

  if (!verified) {
    throw new Error('Password was written but did not verify. Nothing else changed — try again.');
  }

  console.log(`✅ Password updated and verified for ${user.email}`);
  console.log('   Sign in at /login.\n');
}

main()
  .catch((error) => {
    console.error(`\n❌ ${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
