'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getPages(locale?: string) {
  return await prisma.page.findMany({
    where: locale ? { locale } : {},
    orderBy: { createdAt: 'desc' },
  })
}

export async function createPage(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const locale = formData.get('locale') as string

  await prisma.page.create({
    data: {
      title,
      slug,
      locale,
    },
  })

  revalidatePath(`/${locale}/admin/pages`)
}

export async function deletePage(id: string) {
  await prisma.page.delete({ where: { id } })
  // Ideally we revalidate the specific locale path, but catching all is hard
}

export async function getPageById(id: string) {
  return await prisma.page.findUnique({
    where: { id },
    include: { widgets: { orderBy: { order: 'asc' } } },
  })
}

export async function addWidget(pageId: string, type: string) {
  const count = await prisma.widget.count({ where: { pageId } })
  await prisma.widget.create({
    data: {
      pageId,
      type,
      data: '{}',
      order: count,
    },
  })
}

export async function updateWidget(id: string, data: any) {
  await prisma.widget.update({
    where: { id },
    data: {
      data: JSON.stringify(data),
    },
  })
}

export async function deleteWidget(id: string) {
  await prisma.widget.delete({ where: { id } })
}
