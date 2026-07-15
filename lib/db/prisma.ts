// Prisma v7: PrismaClient const is untyped due to @ts-nocheck in generated files.
// Use the generated interface directly for full type safety.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { PrismaClient as PrismaClientCtor } from "@/app/generated/prisma/client";
import type { PrismaClient } from "@/app/generated/prisma/internal/class";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClientCtor as any)({ adapter }) as PrismaClient;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
