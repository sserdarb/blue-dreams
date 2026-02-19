import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const isBuildTime = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy') || process.env.DATABASE_URL.includes('build')

function createNoOpProxy(): PrismaClient {
    return new Proxy({} as PrismaClient, {
        get(_target, prop) {
            if (prop === '$connect' || prop === '$disconnect') {
                return async () => { }
            }
            if (prop === '$transaction') {
                return async (fn: unknown) => {
                    if (typeof fn === 'function') return fn(createNoOpProxy())
                    return []
                }
            }
            if (typeof prop === 'string' && !prop.startsWith('$')) {
                return new Proxy({}, {
                    get(_modelTarget, method) {
                        return async () => {
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

function createPrismaClient(): PrismaClient {
    if (isBuildTime) {
        console.warn('⚠️ Build-time detected: using no-op Prisma proxy')
        return createNoOpProxy()
    }

    try {
        return new PrismaClient()
    } catch (error) {
        console.error('❌ Failed to create PrismaClient:', error)
        console.error('DATABASE_URL format may be invalid — falling back to no-op proxy')
        return createNoOpProxy()
    }
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
