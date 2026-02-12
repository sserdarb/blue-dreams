import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// Helper to check if requester is superadmin
async function requireSuperAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try {
        const data = JSON.parse(session.value)
        if (data.role !== 'superadmin') return null
        return data
    } catch {
        return null
    }
}

export async function GET() {
    const admin = await requireSuperAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    try {
        const users = await prisma.adminUser.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
            }
        })
        return NextResponse.json(users)
    } catch (error) {
        console.error('Users GET error:', error)
        return NextResponse.json({ error: 'Kullanıcılar yüklenemedi' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const admin = await requireSuperAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    try {
        const { email, password, name, role = 'admin' } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'E-posta, şifre ve isim gereklidir' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
        }

        // Check if email already exists
        const existing = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } })
        if (existing) {
            return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 })
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.adminUser.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name,
                role: ['superadmin', 'admin', 'editor'].includes(role) ? role : 'admin',
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
            }
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Users POST error:', error)
        return NextResponse.json({ error: 'Kullanıcı eklenemedi' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const admin = await requireSuperAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    try {
        const { id, name, role, isActive, password } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
        }

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (role !== undefined && ['superadmin', 'admin', 'editor'].includes(role)) updateData.role = role
        if (isActive !== undefined) updateData.isActive = isActive
        if (password && password.trim()) {
            if (password.trim().length < 6) {
                return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
            }
            // Hash new password with bcrypt
            updateData.password = await bcrypt.hash(password.trim(), 10)
        }

        const user = await prisma.adminUser.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Users PUT error:', error)
        return NextResponse.json({ error: 'Kullanıcı güncellenemedi' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const admin = await requireSuperAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
        }

        // Prevent deleting yourself
        const userToDelete = await prisma.adminUser.findUnique({ where: { id } })
        if (!userToDelete) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        await prisma.adminUser.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Users DELETE error:', error)
        return NextResponse.json({ error: 'Kullanıcı silinemedi' }, { status: 500 })
    }
}
