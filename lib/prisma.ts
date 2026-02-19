import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const isBuildTime = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy') || process.env.DATABASE_URL.includes('build')

function createPrismaClient(): PrismaClient {
    if (isBuildTime) {
        // During build time, DATABASE_URL is not available or is a dummy
        // Return a proxy that returns empty/default results for all queries
        console.warn('⚠️ Build-time detected: using no-op Prisma proxy')
        return new Proxy({} as PrismaClient, {
            get(_target, prop) {
                if (prop === '$connect' || prop === '$disconnect') {
                    return async () => { }
                }
                if (prop === '$transaction') {
                    return async (fn: unknown) => {
                        if (typeof fn === 'function') return fn(createPrismaClient())
                        return []
                    }
                }
                if (typeof prop === 'string' && !prop.startsWith('$')) {
                    // Model accessor (e.g., prisma.user, prisma.chatSession)
                    return new Proxy({}, {
                        get(_modelTarget, method) {
                            return async () => {
                                // Return appropriate defaults based on method name
                                if (method === 'findMany') return []
                                if (method === 'findUnique' || method === 'findFirst') return null
                                if (method === 'count') return 0
                                if (method === 'create' || method === 'update' || method === 'upsert') return {}
                                if (method === 'delete') return {}
                                if (method === 'createMany' || method === 'updateMany' || method === 'deleteMany') return { count: 0 }
                                if (method === 'aggregate') return {}
                                if (method === 'groupBy') return []
                                return null
                            }
                        }
                    })
                }
                return undefined
            }
        })
    }

    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
