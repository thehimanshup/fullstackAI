import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Always cache in globalThis so warm serverless invocations reuse the same client
globalForPrisma.prisma = prisma
