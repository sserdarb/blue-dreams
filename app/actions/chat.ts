'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSession(customerName?: string) {
  const session = await prisma.chatSession.create({
    data: {
      customerName: customerName || 'Guest',
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

export async function sendMessage(sessionId: string, content: string, sender: 'user' | 'agent' | 'bot') {
  await prisma.chatMessage.create({
    data: {
      sessionId,
      content,
      sender,
    },
  })

  if (sender === 'user') {
    // Simple rule-based bot
    const lower = content.toLowerCase()
    let botReply = "Thank you for your message. A Blue Concierge will be with you shortly."

    if (lower.includes('price') || lower.includes('cost')) {
        botReply = "Our room rates vary by season. Please check the Rooms page for details."
    } else if (lower.includes('book') || lower.includes('reservation')) {
        botReply = "You can book directly through our website or call us."
    } else if (lower.includes('hello') || lower.includes('hi')) {
        botReply = "Hello! Welcome to Blue Dreams Resort. How can I help you today?"
    }

    await prisma.chatMessage.create({
        data: {
            sessionId,
            content: botReply,
            sender: 'bot'
        }
    })
  }

  revalidatePath('/[locale]/admin/chat')
}

export async function getActiveSessions() {
    return await prisma.chatSession.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } }
    })
}
