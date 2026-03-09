import 'dotenv/config';

// ─── AYARLAR ────────────────────────────────────────────────────────
const META_ADS_API_VERSION = 'v23.0';
const WHATSAPP_API_VERSION = 'v21.0';
const META_GRAPH_URL = 'https://graph.facebook.com';

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_ADS_ACCOUNT_ID = process.env.META_ADS_ACCOUNT_ID || process.env.FB_AD_ACCOUNT_ID;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const GOOGLE_ADS_CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const GOOGLE_ADS_CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const GOOGLE_ADS_CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
const GOOGLE_ADS_MANAGER_ID = (process.env.GOOGLE_ADS_MANAGER_ID || GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '');
// ────────────────────────────────────────────────────────────────────

async function testMetaAds() {
    console.log('\n==================================================');
    console.log('📦 1. META ADS ENTEGRASYONU TESTİ');
    console.log('==================================================');
    if (!META_ACCESS_TOKEN || !META_ADS_ACCOUNT_ID) {
        console.log('❌ HATA: Meta Ads kimlik bilgileri eksik (META_ACCESS_TOKEN veya META_ADS_ACCOUNT_ID)');
        return;
    }

    let acct = META_ADS_ACCOUNT_ID;
    if (!acct.startsWith('act_')) acct = `act_${acct}`;

    console.log(`- Meta Hesabı: ${acct}`);
    console.log('- Kampanyalar Çekiliyor (Durumlar: ACTIVE, PAUSED, ARCHIVED)...');

    // API Query (Sadece anlamlı durumları çekiyoruz ki Meta hata vermesin - örn DELETED hata verdirir)
    const url = `${META_GRAPH_URL}/${META_ADS_API_VERSION}/${acct}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,start_time,stop_time,insights.date_preset(last_30d){spend,impressions,clicks,cpc,ctr,reach,actions,cost_per_action_type}&limit=100&effective_status=["ACTIVE","PAUSED","ARCHIVED"]&access_token=${META_ACCESS_TOKEN}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
            console.log(`✅ BAŞARILI! ${data.data?.length || 0} adet kampanya bulundu.`);
            if (data.data && data.data.length > 0) {
                // Hangi statuslerden kaç tane geldiğinin özeti:
                const statuses = data.data.reduce((acc: any, c: any) => {
                    const st = c.effective_status || c.status || 'BİLİNMİYOR';
                    acc[st] = (acc[st] || 0) + 1;
                    return acc;
                }, {});
                console.log('--- Kampanya Durum Özeti ---');
                console.table(statuses);
                console.log('\n--- Örnek Kampanya Verisi ---');
                console.log(JSON.stringify(data.data[0], null, 2));
            } else {
                console.log('⚠️ Uyarı: API çalışıyor ancak bu hesap üzerinde (Son 30 gün içinde) hiç veri/kampanya dönmedi.');
                console.log('   (Not: Hesap kimliğinizin doğruluğundan emin olun veya reklamlarınız silinmiş olabilir)');
            }
        } else {
            console.log('❌ Meta API Hatası Döndü:');
            console.log(JSON.stringify(data.error, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Sistem Hatası:', err.message);
    }
}

async function getGoogleToken() {
    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: GOOGLE_ADS_CLIENT_ID!,
                client_secret: GOOGLE_ADS_CLIENT_SECRET!,
                refresh_token: GOOGLE_ADS_REFRESH_TOKEN!,
                grant_type: 'refresh_token'
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.access_token;
    } catch { return null; }
}

async function testGoogleAds() {
    console.log('\n==================================================');
    console.log('📊 2. GOOGLE ADS ENTEGRASYONU TESTİ');
    console.log('==================================================');

    if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_REFRESH_TOKEN || !GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
        console.log('❌ HATA: .env dosyasında Google Ads bilgileri eksik.');
        return;
    }

    console.log('- Google OAuth Token alınıyor...');
    const token = await getGoogleToken();
    if (!token) {
        console.log('❌ Refresh Token kullanılarak Access Token ALINAMADI! (Süresi dolmuş veya hatalı olabilir)');
        return;
    }
    console.log('✅ Access Token alındı.');
    console.log(`- Müşteri ID: ${GOOGLE_ADS_CUSTOMER_ID}`);

    const query = `
        SELECT
            campaign.id, campaign.name, campaign.status,
            campaign.advertising_channel_type,
            metrics.impressions, metrics.clicks, metrics.cost_micros,
            metrics.conversions
        FROM campaign
        WHERE segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
        LIMIT 10
    `;

    try {
        const res = await fetch(`https://googleads.googleapis.com/v23/customers/${GOOGLE_ADS_CUSTOMER_ID}/googleAds:searchStream`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'developer-token': GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': GOOGLE_ADS_MANAGER_ID,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        const dataArray = await res.json();
        if (res.ok) {
            let flatResults: any[] = [];
            if (Array.isArray(dataArray)) {
                for (const batch of dataArray) {
                    if (batch.results) flatResults = flatResults.concat(batch.results);
                }
            }
            console.log(`✅ BAŞARILI! ${flatResults.length} adet kampanya satırı bulundu.`);
            if (flatResults.length > 0) {
                const statuses = flatResults.reduce((acc: any, c: any) => {
                    const st = c.campaign?.status || 'BİLİNMİYOR';
                    acc[st] = (acc[st] || 0) + 1;
                    return acc;
                }, {});
                console.log('--- Kampanya Durum Özeti ---');
                console.table(statuses);
                console.log('\n--- Örnek Kampanya Verisi ---');
                console.log(JSON.stringify(flatResults[0], null, 2));
            }
        } else {
            console.log('❌ Google API Hatası Döndü:');
            console.log(JSON.stringify(dataArray, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Sistem Hatası:', err.message);
    }
}

async function testWhatsApp() {
    console.log('\n==================================================');
    console.log('💬 3. WHATSAPP BUSINESS API TESTİ');
    console.log('==================================================');

    if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('❌ HATA: WhatsApp bilgileri eksik (META_ACCESS_TOKEN veya WHATSAPP_PHONE_ID)');
        return;
    }

    console.log(`- WhatsApp Telefon ID: ${WHATSAPP_PHONE_ID}`);

    try {
        const url = `${META_GRAPH_URL}/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_ID}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=${META_ACCESS_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
            console.log('✅ BAŞARILI! WhatsApp Profil Bilgileri Alındı:');
            const profile = data.data?.[0] || {};
            console.log(`   - Adres: ${profile.address || 'Yok'}`);
            console.log(`   - Websites: ${profile.websites?.join(', ') || 'Yok'}`);
            console.log(`   - Resim URL: ${profile.profile_picture_url ? 'Mevcut' : 'Yok'}`);
            console.log('\n📄 Tam Çıktı:');
            console.log(JSON.stringify(profile, null, 2));
        } else {
            console.log('❌ WhatsApp API Hatası Döndü:');
            console.log(JSON.stringify(data.error, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Sistem Hatası:', err.message);
    }
}

async function runTests() {
    console.log('\n==================================================');
    console.log('🚀 DİJİTAL PAZARLAMA VE WHATSAPP TEST ARACI BAŞLIYOR');
    console.log('==================================================\n');
    await testMetaAds();
    await testGoogleAds();
    await testWhatsApp();
    console.log('\n==================================================');
    console.log('🏁 TESTLER TAMAMLANDI');
    console.log('==================================================\n');
}

runTests();
