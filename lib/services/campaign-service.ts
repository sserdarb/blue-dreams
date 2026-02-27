// Campaign Service — WhatsApp and Email campaign sending
import { sendSocialMessage } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

// Rate-limited WhatsApp campaign sender
export async function sendWhatsAppCampaign(
    campaignId: string,
    phones: string[],
    message: string,
    guestNames?: Map<string, string>
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'sending' },
    });

    for (const phone of phones) {
        try {
            // Replace template variables
            let personalizedMsg = message;
            if (guestNames?.has(phone)) {
                personalizedMsg = personalizedMsg.replace(/\{\{name\}\}/g, guestNames.get(phone) || '');
            }

            await sendSocialMessage(phone, personalizedMsg);

            // Record sent message
            await prisma.socialMessage.create({
                data: {
                    phone,
                    direction: 'outbound',
                    type: 'campaign',
                    content: personalizedMsg,
                    campaignId,
                    status: 'sent',
                },
            });

            sent++;

            // Rate limiting: 1 msg per 100ms to avoid API throttling
            await new Promise(r => setTimeout(r, 100));
        } catch (err) {
            console.error(`[Campaign] Failed to send to ${phone}:`, err);
            failed++;
        }
    }

    await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            status: 'sent',
            sentAt: new Date(),
            totalSent: sent,
            totalFailed: failed,
        },
    });

    return { sent, failed };
}

// Get campaign stats
export async function getCampaignStats(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { segment: true },
    });

    if (!campaign) return null;

    const messages = await prisma.socialMessage.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: true,
    });

    return {
        ...campaign,
        messageStats: messages.reduce((acc, m) => {
            acc[m.status] = m._count;
            return acc;
        }, {} as Record<string, number>),
    };
}
