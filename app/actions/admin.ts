'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Page CRUD ───

export async function getPages(locale?: string) {
  return await prisma.page.findMany({
    where: locale ? { locale } : {},
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { widgets: true } },
    },
  })
}

export async function searchPages(query: string, status?: string, locale?: string) {
  const where: any = {}
  if (locale) where.locale = locale
  if (status && status !== 'all') where.status = status
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { slug: { contains: query, mode: 'insensitive' } },
    ]
  }
  return await prisma.page.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { widgets: true } } },
  })
}

export async function createPage(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const locale = formData.get('locale') as string
  const status = (formData.get('status') as string) || 'draft'
  const visibility = (formData.get('visibility') as string) || 'public'
  const template = (formData.get('template') as string) || 'default'
  const featuredImage = formData.get('featuredImage') as string | null
  const parentId = formData.get('parentId') as string | null
  const metaDescription = formData.get('metaDescription') as string | null

  const page = await prisma.page.create({
    data: {
      title,
      slug,
      locale,
      status,
      visibility,
      template,
      featuredImage: featuredImage || null,
      parentId: parentId || null,
      metaDescription: metaDescription || null,
      publishedAt: status === 'published' ? new Date() : null,
    },
  })

  revalidatePath(`/${locale}/admin/pages`)
  return page
}

export async function updatePage(id: string, data: {
  title?: string
  slug?: string
  metaDescription?: string | null
  status?: string
  visibility?: string
  template?: string
  featuredImage?: string | null
  parentId?: string | null
  order?: number
}) {
  const updateData: any = { ...data }

  // Set publishedAt when publishing for the first time
  if (data.status === 'published') {
    const existing = await prisma.page.findUnique({ where: { id } })
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const page = await prisma.page.update({
    where: { id },
    data: updateData,
  })

  revalidatePath(`/${page.locale}/admin/pages`)
  revalidatePath(`/${page.locale}/${page.slug}`)
  return page
}

export async function updatePageStatus(id: string, status: 'draft' | 'published') {
  const page = await prisma.page.update({
    where: { id },
    data: {
      status,
      publishedAt: status === 'published' ? new Date() : undefined,
    },
  })
  revalidatePath(`/${page.locale}/admin/pages`)
  revalidatePath(`/${page.locale}/${page.slug}`)
  return page
}

export async function deletePage(id: string) {
  const page = await prisma.page.delete({ where: { id } })
  revalidatePath(`/${page.locale}/admin/pages`)
}

export async function getPageById(id: string) {
  return await prisma.page.findUnique({
    where: { id },
    include: { widgets: { orderBy: { order: 'asc' } } },
  })
}

// ─── Widget CRUD ───

export async function addWidget(pageId: string, type: string, name?: string) {
  const count = await prisma.widget.count({ where: { pageId } })
  const page = await prisma.page.findUnique({ where: { id: pageId }, select: { locale: true } })

  await prisma.widget.create({
    data: {
      pageId,
      type,
      name: name || null,
      data: '{}',
      order: count,
    },
  })

  if (page) {
    revalidatePath(`/${page.locale}/admin/pages`)
  }
}

export async function updateWidget(id: string, data: any) {
  const widget = await prisma.widget.update({
    where: { id },
    data: {
      data: JSON.stringify(data),
    },
    include: { page: { select: { slug: true, locale: true } } },
  })
  revalidatePath(`/${widget.page.locale}/admin/pages`)
  revalidatePath(`/${widget.page.locale}/${widget.page.slug}`)
}

export async function updateWidgetName(id: string, name: string) {
  await prisma.widget.update({
    where: { id },
    data: { name },
  })
}

export async function duplicateWidget(widgetId: string) {
  const original = await prisma.widget.findUnique({
    where: { id: widgetId },
    include: { page: { select: { locale: true } } },
  })
  if (!original) throw new Error('Widget not found')

  const count = await prisma.widget.count({ where: { pageId: original.pageId } })

  await prisma.widget.create({
    data: {
      pageId: original.pageId,
      type: original.type,
      name: original.name ? `${original.name} (copy)` : null,
      data: original.data,
      order: count,
    },
  })

  if (original.page) {
    revalidatePath(`/${original.page.locale}/admin/pages`)
  }
}

export async function deleteWidget(id: string) {
  const widget = await prisma.widget.delete({
    where: { id },
    include: { page: { select: { slug: true, locale: true } } },
  })
  revalidatePath(`/${widget.page.locale}/admin/pages`)
  revalidatePath(`/${widget.page.locale}/${widget.page.slug}`)
}

export async function reorderWidgets(widgetIds: string[]) {
  await prisma.$transaction(
    widgetIds.map((id, index) =>
      prisma.widget.update({
        where: { id },
        data: { order: index },
      })
    )
  )
}

// ─── Utility ───

export async function getPagesForParentSelect(locale: string, excludeId?: string) {
  return await prisma.page.findMany({
    where: {
      locale,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, title: true, slug: true },
    orderBy: { title: 'asc' },
  })
}
