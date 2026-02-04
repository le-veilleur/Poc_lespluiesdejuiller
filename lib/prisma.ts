import { PrismaClient } from "@/prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton Prisma pour eviter les connexions multiples en dev
// Next.js recharge les modules a chaud (HMR), ce qui creerait
// une nouvelle connexion a chaque rechargement sans ce pattern

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
