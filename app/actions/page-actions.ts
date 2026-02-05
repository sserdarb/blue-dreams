'use server'

import { prisma } from '@/lib/prisma'

export async function getPage(slug: string[], locale: string) {
  // If slug is empty (home page), handle it. The root page usually passes empty array or handled via rewrite.
  // But for [...slug], an empty array means the root.
  const slugString = slug ? slug.join('/') : 'home' // Default to 'home' if empty or just handle explicit 'home' logic

  // Note: For the actual root '/', Next.js might use a different logic, but let's assume 'home' is the slug for root.

  const page = await prisma.page.findUnique({
    where: {
      slug_locale: {
        slug: slugString || 'home', // Ensure we search for 'home' if slug is empty string
        locale: locale,
      },
    },
    include: {
      widgets: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  return page
}
