'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all CTA bars
export async function GET() {
    try {
        const ctaBars = await prisma.ctaBar.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(ctaBars)
    } catch (error) {
        console.error('Get CTA bars error:', error)
        return NextResponse.json({ error: 'Failed to get CTA bars' }, { status: 500 })
    }
}

// POST - Create or update CTA bar
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { id, title, subtitle, buttonText, buttonUrl, backgroundColor, textColor, startDate, endDate, isActive } = data

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        if (id) {
            // Update existing
            const ctaBar = await prisma.ctaBar.update({
                where: { id },
                data: {
                    title,
                    subtitle: subtitle || null,
                    buttonText: buttonText || null,
                    buttonUrl: buttonUrl || null,
                    backgroundColor: backgroundColor || '#2563eb',
                    textColor: textColor || '#ffffff',
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    isActive: isActive ?? false
                }
            })
            return NextResponse.json(ctaBar)
        } else {
            // Create new
            const ctaBar = await prisma.ctaBar.create({
                data: {
                    title,
                    subtitle: subtitle || null,
                    buttonText: buttonText || null,
                    buttonUrl: buttonUrl || null,
                    backgroundColor: backgroundColor || '#2563eb',
                    textColor: textColor || '#ffffff',
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    isActive: isActive ?? false
                }
            })
            return NextResponse.json(ctaBar)
        }
    } catch (error) {
        console.error('Save CTA bar error:', error)
        return NextResponse.json({ error: 'Failed to save CTA bar' }, { status: 500 })
    }
}

// DELETE - Delete CTA bar
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        await prisma.ctaBar.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete CTA bar error:', error)
        return NextResponse.json({ error: 'Failed to delete CTA bar' }, { status: 500 })
    }
}
