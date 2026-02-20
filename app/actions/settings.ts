'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'


// =============== SITE SETTINGS ===============

export async function getSiteSettings(locale: string) {
    let settings = await prisma.siteSettings.findUnique({
        where: { locale }
    })

    // Create default settings if not exists
    if (!settings) {
        settings = await prisma.siteSettings.create({
            data: {
                locale,
                siteName: 'Blue Dreams Resort',
                phone: '+90 252 337 11 11',
                email: 'sales@bluedreamsresort.com',
                address: 'Torba Mahallesi Herodot Bulvarı No:11 Bodrum / MUĞLA / TÜRKİYE',
            }
        })
    }

    return settings
}

export async function updateSiteSettings(locale: string, data: {
    siteName?: string
    logo?: string
    favicon?: string
    phone?: string
    email?: string
    address?: string
    socialLinks?: string
    footerText?: string
    footerCopyright?: string
    headerStyle?: string
    googleMapsApiKey?: string
}) {
    const settings = await prisma.siteSettings.upsert({
        where: { locale },
        update: data,
        create: { locale, ...data }
    })

    revalidatePath('/', 'layout')
    return settings
}

// =============== MENU ITEMS ===============

// =============== TAX SETTINGS ===============

export async function getTaxSettings() {
    // Tax rates are global (not per-locale), grab from first row
    const row = await prisma.siteSettings.findFirst({
        select: { vatAccommodation: true, taxAccommodation: true, vatFnb: true },
    })
    return {
        vatAccommodation: row?.vatAccommodation ?? 10,
        taxAccommodation: row?.taxAccommodation ?? 2,
        vatFnb: row?.vatFnb ?? 20,
    }
}

export async function updateTaxSettings(data: {
    vatAccommodation: number
    taxAccommodation: number
    vatFnb: number
}) {
    // Update ALL locale rows so any row returns the same rates
    await prisma.siteSettings.updateMany({ data })
    revalidatePath('/', 'layout')
}

// =============== MENU ITEMS ===============

export async function getMenuItems(locale: string) {
    return await prisma.menuItem.findMany({
        where: { locale, parentId: null, isActive: true },
        orderBy: { order: 'asc' },
        include: {
            children: {
                where: { isActive: true },
                orderBy: { order: 'asc' }
            }
        }
    })
}

export async function getAllMenuItems(locale: string) {
    return await prisma.menuItem.findMany({
        where: { locale },
        orderBy: { order: 'asc' },
        include: {
            children: {
                orderBy: { order: 'asc' }
            }
        }
    })
}

export async function createMenuItem(data: {
    locale: string
    label: string
    url: string
    target?: string
    order?: number
    parentId?: string
}) {
    const item = await prisma.menuItem.create({ data })
    revalidatePath('/', 'layout')
    return item
}

export async function updateMenuItem(id: string, data: {
    label?: string
    url?: string
    target?: string
    order?: number
    isActive?: boolean
    parentId?: string | null
}) {
    const item = await prisma.menuItem.update({
        where: { id },
        data
    })
    revalidatePath('/', 'layout')
    return item
}

export async function deleteMenuItem(id: string) {
    await prisma.menuItem.delete({ where: { id } })
    revalidatePath('/', 'layout')
}

export async function reorderMenuItems(items: { id: string; order: number }[]) {
    await Promise.all(
        items.map(item =>
            prisma.menuItem.update({
                where: { id: item.id },
                data: { order: item.order }
            })
        )
    )
    revalidatePath('/', 'layout')
}

// =============== LANGUAGES ===============

export async function getLanguages() {
    return await prisma.language.findMany({
        orderBy: { order: 'asc' }
    })
}

export async function getActiveLanguages() {
    return await prisma.language.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    })
}

export async function createLanguage(data: {
    code: string
    name: string
    nativeName?: string
    flag?: string
    isActive?: boolean
    isDefault?: boolean
    order?: number
}) {
    // If this is set as default, unset other defaults
    if (data.isDefault) {
        await prisma.language.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        })
    }

    const lang = await prisma.language.create({ data })
    revalidatePath('/', 'layout')
    return lang
}

export async function updateLanguage(id: string, data: {
    name?: string
    nativeName?: string
    flag?: string
    isActive?: boolean
    isDefault?: boolean
    order?: number
}) {
    if (data.isDefault) {
        await prisma.language.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        })
    }

    const lang = await prisma.language.update({
        where: { id },
        data
    })
    revalidatePath('/', 'layout')
    return lang
}

export async function deleteLanguage(id: string) {
    await prisma.language.delete({ where: { id } })
    revalidatePath('/', 'layout')
}

// =============== SEED DEFAULT LANGUAGES ===============

export async function seedDefaultLanguages() {
    const count = await prisma.language.count()
    if (count > 0) return

    await prisma.language.createMany({
        data: [
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isActive: true, isDefault: true, order: 0 },
            { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', isActive: true, isDefault: false, order: 1 },
            { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isActive: true, isDefault: false, order: 2 },
            { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', isActive: true, isDefault: false, order: 3 },
        ]
    })
}
