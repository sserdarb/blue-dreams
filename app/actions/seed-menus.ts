'use server'

import { prisma } from '@/lib/prisma'
import { getNavItems } from '@/lib/constants' // the old static menus

export async function seedStaticMenusToDb() {
    const locales = ['tr', 'en', 'de', 'ru']

    let totalAdded = 0

    for (const locale of locales) {
        // Check if menus already exist for this locale to avoid duplication
        const existingCount = await prisma.menuItem.count({
            where: { locale }
        })

        if (existingCount > 0) {
            console.log(`Menus already exist for locale: ${locale}. Skipping...`)
            continue
        }

        const staticItems = getNavItems(locale)

        for (let i = 0; i < staticItems.length; i++) {
            const item = staticItems[i]

            await prisma.menuItem.create({
                data: {
                    locale,
                    label: item.label,
                    url: item.href,
                    target: '_self',
                    order: i,
                    isActive: true,
                }
            })
            totalAdded++
        }
    }

    return { success: true, seededCount: totalAdded }
}
