const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new (...args: any[]) => any;
};

declare global {
  // allow global across module reloads in development
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

function createFallbackPrismaClient() {
  return {
    incentive: new Proxy(
      {},
      {
        get: (_target, method) => {
          if (method === "findMany") return async () => [];
          if (method === "count") return async () => 0;
          if (method === "aggregate") return async () => ({ _avg: {} });
          if (method === "findUnique") return async () => null;
          if (method === "findFirst") return async () => null;
          if (method === "create") return async () => null;
          if (method === "update") return async () => null;
          if (method === "upsert") return async () => null;
          if (method === "delete") return async () => null;
          if (method === "deleteMany") return async () => ({ count: 0 });
          if (method === "updateMany") return async () => ({ count: 0 });
          if (method === "createMany") return async () => ({ count: 0 });
          return async () => null;
        },
      },
    ),
    performance: new Proxy(
      {},
      {
        get: (_target, method) => {
          if (method === "aggregate") return async () => ({ _avg: {} });
          if (method === "findMany") return async () => [];
          if (method === "count") return async () => 0;
          return async () => null;
        },
      },
    ),
    $connect: async () => undefined,
    $disconnect: async () => undefined,
  };
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return createFallbackPrismaClient();
  }

  try {
    return new PrismaClient();
  } catch {
    return createFallbackPrismaClient();
  }
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
