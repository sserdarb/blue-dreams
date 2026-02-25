import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

export async function POST(request: Request) {
    try {
        const { credential } = await request.json()

        if (!credential) {
            return NextResponse.json({ error: 'Token gerekli' }, { status: 400 })
        }

        // Decode JWT payload (Google IdToken is a JWT)
        const parts = credential.split('.')
        if (parts.length !== 3) {
            return NextResponse.json({ error: 'Geçersiz token formatı' }, { status: 400 })
        }

        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString('utf-8')
        )

        const { sub: googleId, email, name, picture, email_verified } = payload

        if (!email_verified) {
            return NextResponse.json({ error: 'E-posta doğrulanmamış' }, { status: 400 })
        }

        // Find or create user
        let user = await prisma.adminUser.findFirst({
            where: {
                OR: [
                    { googleId },
                    { email: email.toLowerCase() }
                ]
            }
        })

        if (user) {
            // Update Google info if needed
            if (!user.googleId) {
                user = await prisma.adminUser.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        avatar: picture || user.avatar,
                        authProvider: user.authProvider === 'local' ? 'local' : 'google',
                        lastLogin: new Date()
                    }
                })
            } else {
                await prisma.adminUser.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date(), avatar: picture || user.avatar }
                })
            }

            if (!user.isActive) {
                return NextResponse.json({ error: 'Hesabınız devre dışı.' }, { status: 403 })
            }
        } else {
            // Create new user with viewer role
            user = await prisma.adminUser.create({
                data: {
                    email: email.toLowerCase(),
                    name: name || email.split('@')[0],
                    googleId,
                    avatar: picture || null,
                    authProvider: 'google',
                    role: 'viewer',
                    permissions: '["task_management"]',
                    isActive: true,
                }
            })
        }

        // Set session cookie
        const sessionValue = JSON.stringify({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
            permissions: user.permissions,
        })

            ; (await cookies()).set(COOKIE_NAME, sessionValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            })

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            }
        })
    } catch (error) {
        console.error('[Google Auth] Error:', error)
        return NextResponse.json({ error: 'Giriş başarısız' }, { status: 500 })
    }
}
