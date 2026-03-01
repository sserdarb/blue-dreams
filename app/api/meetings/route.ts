import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { contactName, email, phone, companyName, eventDate, attendees, description } = body

        if (!contactName || !email) {
            return NextResponse.json({ success: false, error: 'İsim ve e-posta alanları zorunludur.' }, { status: 400 })
        }

        const newRequest = await prisma.meetingRequest.create({
            data: {
                contactName,
                email,
                phone: phone || null,
                companyName: companyName || null,
                eventDate: eventDate ? new Date(eventDate) : null,
                attendees: attendees ? parseInt(attendees, 10) : null,
                description: description || null,
                status: 'pending'
            }
        })

        // Toplantı talebi bildirimini oluştur (userId = null -> tüm adminler görebilir ya da belirli bir ID atanabilir)
        // Şimdilik null veya adminleri getiren bir mekanizma yapılabilir. 
        // Notification API "userId" zorunluluğuna göre;
        // Tüm full adminlere ekleme yapılabilir, ancak genelde Notification modelinde userId Optional ise null bırakılır.
        const adminUsers = await prisma.adminUser.findMany({
            where: { role: 'admin' },
            select: { id: true }
        })

        if (adminUsers.length > 0) {
            await prisma.notification.createMany({
                data: adminUsers.map((a: any) => ({
                    userId: a.id,
                    title: 'Yeni Toplantı Talebi',
                    message: `${contactName} isimli kişiden yeni bir organizasyon talebi var.`,
                    type: 'email_converted',
                    link: '/tr/admin/crm/meetings',
                    isRead: false
                }))
            })
        }

        return NextResponse.json({ success: true, data: newRequest })
    } catch (error) {
        console.error('[API] Error creating meeting request:', error)
        return NextResponse.json({ success: false, error: 'Talep oluşturulurken bir hata meydana geldi.' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const requests = await prisma.meetingRequest.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ success: true, data: requests })
    } catch (error) {
        console.error('[API] Error fetching meeting requests:', error)
        return NextResponse.json({ success: false, error: 'Talepler getirilemedi.' }, { status: 500 })
    }
}
