import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient(): PrismaClient {
    try {
        return new PrismaClient()
    } catch {
        // During build time, DATABASE_URL might not be available
        // Return a proxy that returns empty results for all queries
        console.warn('⚠️ PrismaClient initialization failed (likely build time). Using no-op proxy.')
        return new Proxy({} as PrismaClient, {
            get(_target, prop) {
                if (typeof prop === 'string') {
                    return new Proxy({}, {
                        get() {
                            return async () => []
                        }
                    })
                }
                return undefined
            }
        })
    }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
