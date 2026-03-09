// Google Ads API Test + Messaging Flow Test
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testGoogleAds() {
    console.log('═══════════════════════════════════════════════');
    console.log('  GOOGLE ADS API TESTİ (Yeni Refresh Token)');
    console.log('═══════════════════════════════════════════════');

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID?.replace(/"/g, '');
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET?.replace(/"/g, '');
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN?.replace(/"/g, '');
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.replace(/"/g, '');
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/["-]/g, '');
    const managerId = (process.env.GOOGLE_ADS_MANAGER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/["-]/g, '');

    console.log('\n📋 Kimlik Bilgileri:');
    console.log('   Client ID:', clientId?.substring(0, 20) + '...');
    console.log('   Customer ID:', customerId);
    console.log('   Manager ID:', managerId);
    console.log('   Refresh Token:', refreshToken?.substring(0, 25) + '...');

    // Step 1: Get access token
    console.log('\n🔑 1. Access Token alınıyor...');
    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }).toString()
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            console.log('   ❌ Access Token alınamadı:', JSON.stringify(tokenData));
            return false;
        }

        console.log('   ✅ Access Token alındı:', tokenData.access_token.substring(0, 30) + '...');
        console.log('   ⏱️  Süre:', tokenData.expires_in, 'saniye');

        // Step 2: Query campaigns
        console.log('\n📊 2. Kampanyalar sorgulanıyor (Son 30 Gün)...');
        const query = `
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.advertising_channel_type,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions
            FROM campaign
            WHERE segments.date DURING LAST_30_DAYS
            ORDER BY metrics.cost_micros DESC
            LIMIT 20
        `;

        const adsRes = await fetch(
            `https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:searchStream`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'developer-token': devToken,
                    'login-customer-id': managerId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            }
        );

        if (!adsRes.ok) {
            const errData = await adsRes.json().catch(() => ({}));
            console.log('   ❌ Google Ads API hatası:', adsRes.status);
            console.log('   Detay:', JSON.stringify(errData, null, 2).substring(0, 500));
            return false;
        }

        const adsData = await adsRes.json();
        let campaigns = [];
        if (Array.isArray(adsData)) {
            for (const batch of adsData) {
                if (batch.results) campaigns = campaigns.concat(batch.results);
            }
        }

        console.log(`   ✅ ${campaigns.length} kampanya satırı bulundu!`);
        console.log('');

        // Print campaign details
        const seen = new Set();
        for (const row of campaigns) {
            const name = row.campaign?.name;
            if (seen.has(name)) continue;
            seen.add(name);
            const status = row.campaign?.status;
            const impressions = parseInt(row.metrics?.impressions || '0');
            const clicks = parseInt(row.metrics?.clicks || '0');
            const spend = (parseInt(row.metrics?.costMicros || '0') / 1000000).toFixed(2);
            console.log(`   📌 ${name}`);
            console.log(`      Durum: ${status} | Gösterim: ${impressions} | Tıklama: ${clicks} | Harcama: ₺${spend}`);
        }

        return true;
    } catch (err) {
        console.log('   ❌ Hata:', err.message);
        return false;
    }
}

async function testMessaging() {
    console.log('\n═══════════════════════════════════════════════');
    console.log('  MESAJLAŞMA AKIŞI TESTİ (WhatsApp/IG/FB)');
    console.log('═══════════════════════════════════════════════');

    const META_TOKEN = process.env.META_ACCESS_TOKEN?.replace(/"/g, '');
    const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID?.replace(/"/g, '') || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.replace(/"/g, '');
    const FB_PAGE_ID = process.env.FB_PAGE_ID?.replace(/"/g, '');
    const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID?.replace(/"/g, '');

    console.log('\n📋 Yapılandırma:');
    console.log('   Meta Token:', META_TOKEN ? META_TOKEN.substring(0, 25) + '...' : '❌ YOK');
    console.log('   IG Account ID:', IG_ACCOUNT_ID || '❌ YOK');
    console.log('   FB Page ID:', FB_PAGE_ID || '❌ YOK');
    console.log('   WhatsApp Phone ID:', WHATSAPP_PHONE_ID || '❌ YOK');

    if (!META_TOKEN) {
        console.log('\n❌ META_ACCESS_TOKEN tanımlı değil, mesajlaşma testi yapılamıyor.');
        return;
    }

    // 1. WhatsApp Business Profile
    if (WHATSAPP_PHONE_ID) {
        console.log('\n📱 1. WhatsApp Business Profili...');
        try {
            const res = await fetch(
                `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=${META_TOKEN}`
            );
            if (res.ok) {
                const data = await res.json();
                console.log('   ✅ WhatsApp Profil:', JSON.stringify(data.data?.[0]?.description || data, null, 2).substring(0, 200));
            } else {
                const err = await res.text();
                console.log('   ❌ Hata:', err.substring(0, 200));
            }
        } catch (err) { console.log('   ❌', err.message); }

        // Test: WhatsApp mesajlarını çek (son gelen mesajlar webhook'la gelir, ama message-templates kontrol edilebilir)
        console.log('\n📱 1b. WhatsApp Mesaj Şablonları...');
        try {
            const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.replace(/"/g, '');
            if (WABA_ID) {
                const res = await fetch(
                    `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?limit=5&access_token=${META_TOKEN}`
                );
                if (res.ok) {
                    const data = await res.json();
                    const templates = data.data || [];
                    console.log(`   ✅ ${templates.length} şablon bulundu`);
                    for (const t of templates.slice(0, 3)) {
                        console.log(`      📝 ${t.name} (${t.status}) - Dil: ${t.language}`);
                    }
                } else {
                    console.log('   ⚠️ Şablon çekilemedi:', (await res.text()).substring(0, 200));
                }
            } else {
                console.log('   ⚠️ WHATSAPP_BUSINESS_ACCOUNT_ID tanımlı değil');
            }
        } catch (err) { console.log('   ❌', err.message); }
    }

    // 2. Instagram DMs
    if (IG_ACCOUNT_ID) {
        console.log('\n📸 2. Instagram Konuşmaları...');
        try {
            const res = await fetch(
                `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/conversations?fields=participants,messages.limit(5){id,message,from,created_time}&access_token=${META_TOKEN}`
            );
            if (res.ok) {
                const data = await res.json();
                const convos = data.data || [];
                console.log(`   ✅ ${convos.length} konuşma bulundu`);
                for (const c of convos.slice(0, 3)) {
                    const msgs = c.messages?.data || [];
                    console.log(`      💬 Konuşma: ${msgs.length} mesaj`);
                    for (const m of msgs.slice(0, 2)) {
                        console.log(`         ${m.from?.name || 'Anonim'}: ${(m.message || '').substring(0, 50)}`);
                    }
                }
            } else {
                const err = await res.text();
                console.log('   ❌ Hata:', err.substring(0, 300));
            }
        } catch (err) { console.log('   ❌', err.message); }
    }

    // 3. Facebook Page Conversations
    if (FB_PAGE_ID) {
        console.log('\n💬 3. Facebook Sayfa Konuşmaları...');
        try {
            const res = await fetch(
                `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/conversations?fields=participants,messages.limit(5){id,message,from,created_time}&access_token=${META_TOKEN}`
            );
            if (res.ok) {
                const data = await res.json();
                const convos = data.data || [];
                console.log(`   ✅ ${convos.length} konuşma bulundu`);
                for (const c of convos.slice(0, 3)) {
                    const msgs = c.messages?.data || [];
                    console.log(`      💬 Konuşma: ${msgs.length} mesaj`);
                    for (const m of msgs.slice(0, 2)) {
                        console.log(`         ${m.from?.name || 'Anonim'}: ${(m.message || '').substring(0, 50)}`);
                    }
                }
            } else {
                const err = await res.text();
                console.log('   ❌ Hata:', err.substring(0, 300));
            }
        } catch (err) { console.log('   ❌', err.message); }
    }

    // 4. Token'ın page_messaging izni var mı kontrol
    console.log('\n🔐 4. Token İzinleri Kontrolü...');
    try {
        const res = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${META_TOKEN}`);
        if (res.ok) {
            const data = await res.json();
            const perms = (data.data || []).filter(p => p.status === 'granted').map(p => p.permission);
            console.log('   ✅ Verilen izinler:', perms.join(', '));

            const needed = ['pages_messaging', 'pages_read_engagement', 'instagram_manage_messages', 'whatsapp_business_messaging'];
            for (const n of needed) {
                if (perms.includes(n)) {
                    console.log(`      ✅ ${n}`);
                } else {
                    console.log(`      ❌ ${n} — EKSİK!`);
                }
            }
        }
    } catch (err) { console.log('   ❌', err.message); }
}

// Load .env
require('dotenv').config();

(async () => {
    const gadsOk = await testGoogleAds();
    await testMessaging();

    console.log('\n═══════════════════════════════════════════════');
    console.log('  SONUÇ');
    console.log('═══════════════════════════════════════════════');
    console.log('  Google Ads API:', gadsOk ? '✅ BAŞARILI' : '❌ BAŞARISIZ');
    console.log('═══════════════════════════════════════════════');
})();
