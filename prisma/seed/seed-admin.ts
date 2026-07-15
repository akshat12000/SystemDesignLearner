/**
 * Create or promote the admin user.
 * Usage: npx tsx prisma/seed/seed-admin.ts
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env.
 * Creates the user if they don't exist, then sets isAdmin=true.
 */
import "dotenv/config";
import { PrismaClient as PrismaClientCtor } from "../../app/generated/prisma/client";
import type { PrismaClient } from "../../app/generated/prisma/internal/class";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/system_design_learner",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClientCtor as any)({ adapter }) as PrismaClient;

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Admin",
      password: hashed,
      isAdmin: true,
    },
    update: {
      isAdmin: true,
      password: hashed,
    },
  });

  console.log(`✅ Admin account ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
