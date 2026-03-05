// Seed script: creates a "demo" user with password "demo"
// Run: npx ts-node prisma/seed-demo.ts
// Or:  npx tsx prisma/seed-demo.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'demo@demo.com'
    const password = await bcrypt.hash('demo', 10)

    const user = await prisma.adminUser.upsert({
        where: { email },
        update: {
            password,
            name: 'Demo User',
            role: 'demo',
            isActive: true,
            permissions: JSON.stringify([
                'task_management', 'workflow_management', 'mail_management',
                'analytics', 'social', 'finance', 'purchasing', 'inbox'
            ]),
        },
        create: {
            email,
            password,
            name: 'Demo User',
            role: 'demo',
            isActive: true,
            authProvider: 'local',
            permissions: JSON.stringify([
                'task_management', 'workflow_management', 'mail_management',
                'analytics', 'social', 'finance', 'purchasing', 'inbox'
            ]),
        },
    })

    console.log('✅ Demo user created/updated:', user.email, '(role:', user.role, ')')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
