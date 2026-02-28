'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSession(customerName?: string) {
  const session = await prisma.chatSession.create({
    data: {
      customerName: customerName || 'Misafir',
    },
  })
  return session
}

export async function getSession(id: string) {
  return await prisma.chatSession.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  })
}

export async function getSessionMessagesSince(id: string, lastDateIso?: string) {
  return await prisma.chatMessage.findMany({
    where: {
      sessionId: id,
      ...(lastDateIso ? { createdAt: { gt: new Date(lastDateIso) } } : {})
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function sendMessage(
  sessionId: string,
  content: string,
  sender: 'user' | 'agent' | 'bot',
  metadata?: any
) {
  const msg = await prisma.chatMessage.create({
    data: {
      sessionId,
      content,
      sender,
      isFromAdmin: sender === 'agent',
      metadata: metadata ? JSON.stringify(metadata) : null
    },
  })

  // If agent replies, update session activity
  if (sender === 'agent') {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date(), adminNote: 'takeover' }
    })
  }

  revalidatePath('/[locale]/admin/chat')
  return msg;
}

export async function updateSessionNote(sessionId: string, note: string) {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { adminNote: note }
  })
  revalidatePath('/[locale]/admin/chat')
}

export async function closeSession(sessionId: string) {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { status: 'closed' }
  })
  revalidatePath('/[locale]/admin/chat')
}

export async function getActiveSessions() {
  return await prisma.chatSession.findMany({
    where: { status: 'active' },
    orderBy: { lastActivity: 'desc' },
    include: { messages: { take: 50, orderBy: { createdAt: 'asc' } } } // Fetch all so admin can see full context
  })
}

