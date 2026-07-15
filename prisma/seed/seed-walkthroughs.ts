/**
 * One-time migration: populate walkthroughText on all existing Phase records.
 * Run with: npx tsx prisma/seed/seed-walkthroughs.ts
 */
import "dotenv/config";
import { PrismaClient as PrismaClientCtor } from "../../app/generated/prisma/client";
import type { PrismaClient } from "../../app/generated/prisma/internal/class";
import { PrismaPg } from "@prisma/adapter-pg";
import { getLLDWalkthrough } from "../../lib/ai/walkthroughs/lld-walkthroughs";
import { getHLDWalkthrough } from "../../lib/ai/walkthroughs/hld-walkthroughs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/system_design_learner",
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClientCtor as any)({ adapter }) as PrismaClient;

async function main() {
  const phases = await prisma.phase.findMany({
    include: { question: { select: { track: true } } },
  });

  let updated = 0;
  for (const phase of phases) {
    const track = phase.question.track as "LLD" | "HLD";
    const text =
      track === "LLD"
        ? getLLDWalkthrough(phase.order)
        : getHLDWalkthrough(phase.order);

    await prisma.phase.update({
      where: { id: phase.id },
      data: { walkthroughText: text },
    });
    updated++;
  }

  console.log(`✅ Updated walkthroughText on ${updated} phases`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
