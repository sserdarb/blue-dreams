import { config } from 'dotenv';
config();

async function checkMeta() {
    const token = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.FB_PAGE_ID;
    if (!token || !pageId) {
        console.log("Meta env vars missing");
        return;
    }

    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=name,followers_count&access_token=${token}`);
        const data = await res.json();
        console.log("Meta API Response:", data);
    } catch (err) {
        console.error("Meta API error:", err);
    }
}

checkMeta();
