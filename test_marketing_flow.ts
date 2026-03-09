import 'dotenv/config';

// Determine if we should use v23.0, but v21.0 might be more stable for WhatsApp
const META_ADS_API_VERSION = 'v23.0';
const WHATSAPP_API_VERSION = 'v21.0'; // Sometimes WP is on a different schedule
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

async function testMetaAds() {
    console.log('\n=========================================');
    console.log('1. TESTING META ADS CAMPAIGNS FLOW');
    console.log('=========================================');
    if (!META_ACCESS_TOKEN || !META_ADS_ACCOUNT_ID) {
        console.log('❌ Missing Meta Ads Credentials (META_ACCESS_TOKEN or META_ADS_ACCOUNT_ID)');
        return;
    }

    let acct = META_ADS_ACCOUNT_ID;
    if (!acct.startsWith('act_')) acct = `act_${acct}`;

    const url = `${META_GRAPH_URL}/${META_ADS_API_VERSION}/${acct}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,start_time,stop_time,insights.date_preset(last_30d){spend,impressions,clicks,cpc,ctr,reach,actions,cost_per_action_type}&limit=100&effective_status=["ACTIVE","PAUSED"]&access_token=${META_ACCESS_TOKEN}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
            console.log(`✅ Success! Found ${data.data?.length || 0} campaigns.`);
            if (data.data?.length > 0) {
                console.log('Sample Campaign 1:');
                console.log(JSON.stringify(data.data[0], null, 2));

                // Print statuses count
                const statuses = data.data.reduce((acc: any, c: any) => {
                    const st = c.effective_status || c.status || 'unknown';
                    acc[st] = (acc[st] || 0) + 1;
                    return acc;
                }, {});
                console.log('Statuses found (effective or status):', statuses);
            }
        } else {
            console.log('❌ Error fetching Meta campaigns:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Exception:', err.message);
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
        const data = await res.json();
        return data.access_token;
    } catch { return null; }
}

async function testGoogleAds() {
    console.log('\n=========================================');
    console.log('2. TESTING GOOGLE ADS CAMPAIGNS FLOW');
    console.log('=========================================');

    if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_REFRESH_TOKEN || !GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
        console.log('❌ Missing Google Ads config details in .env');
        return;
    }

    const token = await getGoogleToken();
    if (!token) {
        console.log('❌ Failed to get Google Ads Access Token using Refresh Token.');
        return;
    }

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
            console.log(`✅ Success! Found ${flatResults.length} records.`);
            if (flatResults.length > 0) {
                console.log('Sample Record 1 (Google):');
                console.log(JSON.stringify(flatResults[0], null, 2));

                const statuses = flatResults.reduce((acc: any, c: any) => {
                    const st = c.campaign?.status || 'unknown';
                    acc[st] = (acc[st] || 0) + 1;
                    return acc;
                }, {});
                console.log('Statuses found:', statuses);
            }
        } else {
            console.log('❌ Error fetching Google campaigns:');
            console.log(JSON.stringify(dataArray, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Exception:', err.message);
    }
}

async function testWhatsApp() {
    console.log('\n=========================================');
    console.log('3. TESTING WHATSAPP BUSINESS VERIFICATION');
    console.log('=========================================');

    if (!META_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
        console.log('❌ Missing WhatsApp Credentials (META_ACCESS_TOKEN or WHATSAPP_PHONE_ID)');
        return;
    }

    try {
        const url = `${META_GRAPH_URL}/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_ID}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=${META_ACCESS_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
            console.log('✅ Success! WhatsApp Profile Data:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Error fetching WhatsApp profile:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err: any) {
        console.log('❌ Exception:', err.message);
    }
}

async function runAll() {
    await testMetaAds();
    await testGoogleAds();
    await testWhatsApp();
    console.log('\nDone.');
}

runAll();
