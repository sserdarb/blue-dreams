import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Task AI Assistant API ──────────────────────────────────────────────
// Generates subtasks, project ideas, and time estimates using AI
// Fed by real system data (tasks, departments, users, capacity)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

async function getSystemContext() {
    try {
        const [tasks, departments, users] = await Promise.all([
            prisma.task.findMany({
                select: { id: true, title: true, status: true, priority: true, dueDate: true, assigneeId: true },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            prisma.department.findMany({ select: { id: true, name: true } }),
            (prisma as any).adminUser?.findMany?.({
                where: { isActive: true },
                select: { id: true, name: true, email: true, role: true }
            }) || []
        ])

        const statusCounts = tasks.reduce((acc: any, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
        }, {})

        return {
            totalTasks: tasks.length,
            statusCounts,
            departments: departments.map(d => d.name),
            teamMembers: (users || []).map((u: any) => u.name),
            recentTasks: tasks.slice(0, 10).map(t => ({
                title: t.title, status: t.status, priority: t.priority,
                dueDate: t.dueDate?.toISOString().split('T')[0]
            })),
            overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
        }
    } catch (error) {
        return { totalTasks: 0, statusCounts: {}, departments: [], teamMembers: [], recentTasks: [], overdueTasks: 0 }
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action, taskTitle, taskDescription, context } = body

        if (!OPENAI_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'OPENAI_API_KEY tanımlı değil. AI özellikleri için API anahtarı gereklidir.'
            }, { status: 200 })
        }

        const systemContext = await getSystemContext()

        let prompt = ''
        let systemPrompt = `Sen bir otel ajans yönetim sistemi AI asistanısın. Blue Dreams Resort'un görev yönetim sisteminde çalışıyorsun.

Mevcut Sistem Durumu:
- Toplam Görev: ${systemContext.totalTasks}
- Görev Durumları: ${JSON.stringify(systemContext.statusCounts)}
- Departmanlar: ${systemContext.departments.join(', ')}
- Ekip Üyeleri: ${systemContext.teamMembers.join(', ')}
- Geciken Görevler: ${systemContext.overdueTasks}
- Son Görevler: ${JSON.stringify(systemContext.recentTasks)}

Her zaman Türkçe yanıt ver. JSON formatında yanıt ver.`

        switch (action) {
            case 'detail_task':
                prompt = `Görev: "${taskTitle}"
${taskDescription ? `Açıklama: ${taskDescription}` : ''}

Bu görev için detaylı alt görevler oluştur. Her alt görev için:
- title: Alt görev başlığı
- estimatedMinutes: Tahmini süre (dakika)
- priority: Öncelik (low/medium/high)
- suggestedAssignee: Öneri atanan kişi (ekipten)

JSON formatında yanıt ver: { "subtasks": [...], "totalEstimatedHours": number, "tips": "string" }`
                break

            case 'project_ideas':
                prompt = `Mevcut sistem verilerine göre otel operasyonları için yeni proje fikirleri öner.

${context ? `Ek Bağlam: ${context}` : ''}

5 proje fikri ver. Her biri için:
- title: Proje başlığı
- description: Kısa açıklama
- priority: Öncelik (low/medium/high/urgent)
- estimatedDays: Tahmini süre (gün)
- department: Uygun departman
- subtasks: 3-5 alt görev başlığı

JSON formatında yanıt ver: { "projects": [...] }`
                break

            case 'suggest_improvements':
                prompt = `Mevcut görev durumuna göre iyileştirme önerileri ver:

${JSON.stringify(systemContext.recentTasks)}

Geciken görev sayısı: ${systemContext.overdueTasks}

3-5 aksiyon öneri: { "suggestions": [{ "title": "...", "description": "...", "action": "..." }] }`
                break

            default:
                prompt = `"${taskTitle || context}" hakkında yardımcı bir yanıt ver.
JSON: { "response": "...", "suggestions": ["..."] }`
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error('[Task AI] OpenAI error:', errText)
            return NextResponse.json({
                success: false,
                error: 'AI servisi yanıt veremedi. Lütfen tekrar deneyin.'
            }, { status: 200 })
        }

        const data = await response.json()
        const aiResponse = JSON.parse(data.choices?.[0]?.message?.content || '{}')

        return NextResponse.json({
            success: true,
            action,
            data: aiResponse,
            systemContext: {
                totalTasks: systemContext.totalTasks,
                overdueTasks: systemContext.overdueTasks,
                teamMembers: systemContext.teamMembers
            }
        })

    } catch (error: any) {
        console.error('[Task AI Error]', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'AI servisinde bir hata oluştu'
        }, { status: 500 })
    }
}
