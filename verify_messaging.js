require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

(async () => {
    const t = process.env.META_ACCESS_TOKEN.replace(/"/g, '');
    const FB_PAGE_ID = '378563394392';
    const IG_ID = '17841405615310500';

    // Get Page Token
    console.log('=== PAGE TOKEN ===');
    const pr = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=id,access_token&access_token=${t}`);
    const pd = await pr.json();
    const pt = (pd.data || []).find(p => p.id === FB_PAGE_ID)?.access_token || t;
    console.log('Page token:', pt.substring(0, 30) + '...');

    // IG DMs
    console.log('\n=== IG DM TEST ===');
    const r1 = await fetch(`https://graph.facebook.com/v21.0/${IG_ID}/conversations?fields=participants,messages.limit(3){id,message,from,created_time}&access_token=${pt}`);
    const d1 = await r1.json();
    console.log(JSON.stringify(d1, null, 2).substring(0, 1500));

    // FB DMs
    console.log('\n=== FB DM TEST ===');
    const r2 = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/conversations?fields=participants,messages.limit(2){id,message,from,created_time}&limit=3&access_token=${pt}`);
    const d2 = await r2.json();
    console.log('FB konuşma sayısı:', (d2.data || []).length);

    // Permissions
    console.log('\n=== PERMISSIONS ===');
    const r3 = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${t}`);
    const d3 = await r3.json();
    const perms = (d3.data || []).filter(p => p.status === 'granted').map(p => p.permission);
    ['pages_messaging', 'instagram_manage_messages', 'instagram_basic', 'whatsapp_business_messaging'].forEach(n => {
        console.log(perms.includes(n) ? `  ✅ ${n}` : `  ❌ ${n} — EKSİK`);
    });

    process.exit(0);
})();
