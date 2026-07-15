import "dotenv/config";
import { PrismaClient as PrismaClientCtor } from "../../app/generated/prisma/client";
import type { PrismaClient } from "../../app/generated/prisma/internal/class";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedLLDTrack } from "./lld-track";
import { seedHLDTrack } from "./hld-track";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/system_design_learner",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClientCtor as any)({ adapter }) as PrismaClient;

async function main() {
  console.log("🌱 Starting seed...");

  await seedLLDTrack(prisma);
  console.log("✅ LLD track seeded");

  await seedHLDTrack(prisma);
  console.log("✅ HLD track seeded");

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
