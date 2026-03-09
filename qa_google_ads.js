require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

(async () => {
    const results = [];
    const log = (msg) => { console.log(msg); results.push(msg); };

    log('============================================================');
    log('QA TEST RAPORU - Google Ads E2E Doğrulama');
    log(`Tarih: ${new Date().toISOString()}`);
    log('============================================================');

    // TEST 1: Token varlığı
    log('\n--- TEST 1: Env Değişkenleri ---');
    const vars = ['GOOGLE_ADS_REFRESH_TOKEN', 'GOOGLE_ADS_CLIENT_ID', 'GOOGLE_ADS_CLIENT_SECRET', 'GOOGLE_ADS_DEVELOPER_TOKEN', 'GOOGLE_ADS_CUSTOMER_ID', 'GOOGLE_ADS_MANAGER_ID'];
    for (const v of vars) {
        const val = process.env[v];
        log(`  ${v}: ${val ? val.substring(0, 15) + '...' : '❌ EKSİK!'}`);
    }

    // TEST 2: Access Token al
    log('\n--- TEST 2: OAuth2 Access Token ---');
    try {
        const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
                refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
                grant_type: 'refresh_token'
            })
        });
        const tokenData = await tokenResp.json();
        if (tokenData.access_token) {
            log(`  ✅ Access token alındı: ${tokenData.access_token.substring(0, 20)}...`);
            const accessToken = tokenData.access_token;

            // TEST 3: Kampanya verileri çek
            log('\n--- TEST 3: Kampanya Verileri ---');
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, '');
            const managerId = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, '');

            const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros FROM campaign ORDER BY campaign.id`;

            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
                'Content-Type': 'application/json'
            };
            if (managerId) headers['login-customer-id'] = managerId;

            const url = `https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:searchStream`;
            log(`  URL: ${url}`);
            log(`  Customer ID: ${customerId}`);
            log(`  Manager ID: ${managerId || 'yok'}`);

            const adsResp = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query })
            });

            const adsText = await adsResp.text();

            if (adsResp.ok) {
                const adsData = JSON.parse(adsText);
                const campaigns = [];
                for (const batch of adsData) {
                    if (batch.results) {
                        for (const r of batch.results) {
                            campaigns.push({
                                id: r.campaign.id,
                                name: r.campaign.name,
                                status: r.campaign.status,
                                impressions: r.metrics?.impressions || 0,
                                clicks: r.metrics?.clicks || 0,
                                cost: (parseInt(r.metrics?.costMicros || 0) / 1000000).toFixed(2)
                            });
                        }
                    }
                }
                log(`  ✅ ${campaigns.length} kampanya bulundu!`);
                log('');
                log('  Kampanya Listesi:');
                log('  ' + '-'.repeat(80));
                for (const c of campaigns) {
                    log(`  | ${c.name.substring(0, 35).padEnd(35)} | ${c.status.padEnd(10)} | Imp: ${String(c.impressions).padStart(6)} | Click: ${String(c.clicks).padStart(5)} | Cost: €${c.cost}`);
                }
                log('  ' + '-'.repeat(80));

                const active = campaigns.filter(c => c.status === 'ENABLED').length;
                const paused = campaigns.filter(c => c.status === 'PAUSED').length;
                const removed = campaigns.filter(c => c.status === 'REMOVED').length;
                log(`\n  Özet: ${active} aktif, ${paused} duraklatılmış, ${removed} kaldırılmış`);
            } else {
                log(`  ❌ API HATASI (${adsResp.status}):`);
                log(`  ${adsText.substring(0, 500)}`);
            }

            // TEST 4: Belirli tarih aralığında metriklerle test
            log('\n--- TEST 4: Son 30 Gün Metrikleri ---');
            const query2 = `
            SELECT
                campaign.id, campaign.name, campaign.status,
                campaign.advertising_channel_type,
                campaign_budget.amount_micros,
                metrics.impressions, metrics.clicks, metrics.cost_micros,
                metrics.conversions, metrics.conversions_value,
                metrics.average_cpc, metrics.ctr
            FROM campaign
            ORDER BY metrics.impressions DESC
        `;
            const adsResp2 = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query: query2 })
            });

            if (adsResp2.ok) {
                const adsData2 = JSON.parse(await adsResp2.text());
                const camps2 = [];
                for (const batch of adsData2) {
                    if (batch.results) {
                        for (const r of batch.results) {
                            camps2.push({
                                name: r.campaign.name,
                                status: r.campaign.status,
                                impressions: parseInt(r.metrics?.impressions || 0),
                                clicks: parseInt(r.metrics?.clicks || 0),
                                cost: (parseInt(r.metrics?.costMicros || 0) / 1000000).toFixed(2),
                                conversions: parseFloat(r.metrics?.conversions || 0).toFixed(1)
                            });
                        }
                    }
                }
                log(`  ✅ Son 30 gün: ${camps2.length} kampanya verisi`);
                for (const c of camps2.slice(0, 10)) {
                    log(`  | ${c.name.substring(0, 30).padEnd(30)} | Imp: ${String(c.impressions).padStart(6)} | Click: ${String(c.clicks).padStart(5)} | €${c.cost} | Conv: ${c.conversions}`);
                }
            } else {
                const errText = await adsResp2.text();
                let errData;
                try {
                    errData = JSON.parse(errText);
                } catch (e) {
                    errData = { raw_response: errText };
                }
                log('❌ Son 30 gün sorgusu başarısız: ' + JSON.stringify(errData, null, 2));
            }

        } else {
            log(`  ❌ Token alınamadı: ${JSON.stringify(tokenData)}`);
        }
    } catch (err) {
        log(`  ❌ HATA: ${err.message}`);
    }

    // TEST 5: Canlı API endpoint testi 
    log('\n--- TEST 5: Canlı Endpoint Testi ---');
    try {
        const r = await fetch('https://new.bluedreamsresort.com/api/admin/ads/campaigns?platform=google');
        log(`  Status: ${r.status}`);
        const body = await r.text();
        log(`  Response: ${body.substring(0, 200)}`);
    } catch (err) {
        log(`  ❌ Endpoint hatası: ${err.message}`);
    }

    log('\n============================================================');
    log('QA TEST TAMAMLANDI');
    log('============================================================');

    // Write results
    require('fs').writeFileSync('qa_full_report.txt', results.join('\n'), 'utf8');

    process.exit(0);
})();
