import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

// ─── Email + In-App Notification Service ──────────────────────────────
// Sends notifications via both DB (in-app) and email (SMTP)

interface NotifyOptions {
    userId: string
    type: 'task_assigned' | 'task_due' | 'task_comment' | 'task_updated' | 'workflow_step'
    title: string
    message: string
    link?: string
    sendEmail?: boolean
}

// Create in-app notification
export async function createNotification(opts: NotifyOptions) {
    try {
        await prisma.notification.create({
            data: {
                userId: opts.userId,
                type: opts.type,
                title: opts.title,
                message: opts.message,
                link: opts.link || null,
                isRead: false
            }
        })
    } catch (error) {
        console.error('[Notification] Failed to create in-app notification:', error)
    }
}

// Send email notification
export async function sendEmailNotification(to: string, subject: string, htmlBody: string) {
    try {
        // Try to get SMTP config from MailIntegration or env
        let smtpHost = process.env.SMTP_HOST
        let smtpPort = parseInt(process.env.SMTP_PORT || '587')
        let smtpUser = process.env.SMTP_USER
        let smtpPass = process.env.SMTP_PASS
        let fromEmail = process.env.SMTP_FROM || 'noreply@bluedreamsresort.com'

        if (!smtpHost || !smtpUser) {
            // Try MailIntegration table
            try {
                const mailConfig = await (prisma as any).mailIntegration?.findFirst?.({
                    where: { isActive: true }
                })
                if (mailConfig) {
                    smtpHost = mailConfig.smtpHost
                    smtpPort = mailConfig.smtpPort
                    smtpUser = mailConfig.smtpUser
                    smtpPass = mailConfig.smtpPass
                    fromEmail = mailConfig.email
                }
            } catch { /* MailIntegration may not exist */ }
        }

        if (!smtpHost || !smtpUser) {
            console.warn('[Email] SMTP not configured. Skipping email notification.')
            return false
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass }
        })

        await transporter.sendMail({
            from: `"PMA Gravity" <${fromEmail}>`,
            to,
            subject,
            html: htmlBody
        })

        return true
    } catch (error) {
        console.error('[Email] Failed to send:', error)
        return false
    }
}

// Combined: create notification + send email
export async function notifyTaskAssignment(
    assigneeId: string,
    task: { id: string; title: string; priority: string; dueDate?: Date | null }
) {
    // 1. Create in-app notification
    await createNotification({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'Yeni Görev Atandı',
        message: `"${task.title}" görevi size atandı. Öncelik: ${task.priority}`,
        link: `/admin/tasks?taskId=${task.id}`
    })

    // 2. Get assignee email
    try {
        const user = await (prisma as any).adminUser?.findUnique?.({
            where: { id: assigneeId },
            select: { email: true, name: true }
        })

        if (user?.email) {
            const dueDateStr = task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('tr-TR')
                : 'Belirlenmemiş'

            const priorityLabels: Record<string, string> = {
                low: '🟢 Düşük', medium: '🟡 Orta', high: '🟠 Yüksek', urgent: '🔴 Acil'
            }

            await sendEmailNotification(
                user.email,
                `📋 Yeni Görev: ${task.title}`,
                `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1b2e; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 32px;">
                        <h1 style="margin: 0; font-size: 20px; color: white;">📋 Yeni Görev Atandı</h1>
                    </div>
                    <div style="padding: 32px;">
                        <p style="color: #94a3b8; margin: 0 0 8px;">Merhaba <strong style="color: #e2e8f0;">${user.name}</strong>,</p>
                        <p style="color: #94a3b8; margin: 0 0 24px;">Size yeni bir görev atandı:</p>
                        
                        <div style="background: #252640; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                            <h2 style="margin: 0 0 12px; font-size: 18px; color: #e2e8f0;">${task.title}</h2>
                            <div style="display: flex; gap: 16px; font-size: 14px;">
                                <span>Öncelik: ${priorityLabels[task.priority] || task.priority}</span>
                                <span>Bitiş: ${dueDateStr}</span>
                            </div>
                        </div>
                        
                        <a href="https://new.bluedreamsresort.com/tr/admin/tasks" 
                           style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                            Görevi Görüntüle →
                        </a>
                    </div>
                    <div style="padding: 16px 32px; background: #151627; text-align: center; font-size: 12px; color: #475569;">
                        PMA Gravity — Agency OS
                    </div>
                </div>
                `
            )
        }
    } catch (error) {
        console.error('[Notify] Failed to send task assignment email:', error)
    }
}
