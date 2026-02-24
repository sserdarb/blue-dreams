import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const { name, email, password, department } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Ad, e-posta ve şifre gerekli' }, { status: 400 })
        }

        // Check if email already exists
        const existing = await prisma.adminUser.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user as inactive (pending approval)
        const user = await prisma.adminUser.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'editor', // Default role for new registrations
                isActive: false, // Requires admin approval
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Kayıt talebiniz alındı. Yönetici onayından sonra giriş yapabilirsiniz.'
        })
    } catch (error) {
        console.error('[Register] Error:', error)
        return NextResponse.json({ error: 'Kayıt işlemi başarısız' }, { status: 500 })
    }
}
