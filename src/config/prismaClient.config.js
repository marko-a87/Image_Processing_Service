import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const connectionString = process.env.DATABASE_URL;


// Create PostgreSQL adapter
const adapter = new PrismaPg({
  connectionString
});

// Initialize Prisma Client with the PostgreSQL adapter
const prisma = new PrismaClient({
  adapter
});

export { prisma };
