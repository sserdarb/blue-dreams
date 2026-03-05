import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/admin/seed — Creates the demo user
// Call this once in production: POST /api/admin/seed { "action": "create-demo-user" }
export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (body.action === 'create-demo-user') {
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

            return NextResponse.json({
                success: true,
                message: 'Demo user created/updated',
                email: user.email,
                role: user.role,
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('[Seed] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
