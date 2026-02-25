import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// Helper to get current user from session cookie
async function getCurrentUser() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')
    if (!sessionCookie) return null

    try {
        const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
        if (!session?.userId) return null

        const user = await prisma.adminUser.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
            }
        })
        return user
    } catch {
        return null
    }
}

// GET: Return current user profile
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error('[Profile GET Error]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT: Update profile (name, email) or change password
export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const { action } = body

        if (action === 'change_password') {
            const { currentPassword, newPassword } = body
            if (!currentPassword || !newPassword) {
                return NextResponse.json({ error: 'Both current and new password are required' }, { status: 400 })
            }
            if (newPassword.length < 6) {
                return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
            }

            // Verify current password
            const fullUser = await prisma.adminUser.findUnique({ where: { id: user.id } })
            if (!fullUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }
            if (!fullUser.password) {
                return NextResponse.json({ error: 'Google accounts cannot change password' }, { status: 400 })
            }

            const isValid = await bcrypt.compare(currentPassword, fullUser.password)
            if (!isValid) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
            }

            // Hash and update
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await prisma.adminUser.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            })

            return NextResponse.json({ success: true, message: 'Password updated successfully' })

        } else {
            // Update profile info
            const { name, email } = body
            const updateData: any = {}

            if (name && name.trim()) updateData.name = name.trim()
            if (email && email.trim()) {
                // Check email uniqueness
                const existing = await prisma.adminUser.findFirst({
                    where: { email: email.trim(), id: { not: user.id } }
                })
                if (existing) {
                    return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
                }
                updateData.email = email.trim()
            }

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
            }

            const updated = await prisma.adminUser.update({
                where: { id: user.id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    permissions: true,
                    isActive: true,
                    lastLogin: true,
                    createdAt: true,
                }
            })

            return NextResponse.json({ success: true, user: updated })
        }
    } catch (error) {
        console.error('[Profile PUT Error]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
