import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Lazy initialization proxy to prevent build-time crashes on import
const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    // Initialize actual client only on first access
    if (!globalThis.prismaGlobal) {
        globalThis.prismaGlobal = prismaClientSingleton();
    }
    const client = globalThis.prismaGlobal;
    // @ts-ignore
    const value = client[prop];
    
    // Bind functions to the client instance
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

export default prisma;
// Process env check not strictly needed with global var approach above, 
// but keeping global var is good for HMR.
