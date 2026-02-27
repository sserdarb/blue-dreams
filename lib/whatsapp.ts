export const sendSocialMessage = async (to: string, text: string) => {
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
        console.error('[WhatsApp] Missing META_ACCESS_TOKEN or WHATSAPP_PHONE_ID in .env');
        return false;
    }

    try {
        const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: {
                    preview_url: false,
                    body: text
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[WhatsApp] Sent message successfully to ${to}`);
            return true;
        } else {
            console.error('[WhatsApp] Failed to send message:', data);
            return false;
        }
    } catch (error) {
        console.error('[WhatsApp] Error sending message:', error);
        return false;
    }
};
