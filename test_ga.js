const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const envVars = env.split('\\n').reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
        let val = match[2].replace(/^["']|["']$/g, '');
        acc[match[1]] = val;
    }
    return acc;
}, {});

Object.assign(process.env, envVars);

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function testGA() {
    try {
        const clientEmail = process.env.GA_CLIENT_EMAIL;
        const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\\\n/g, '\\n');
        const propertyId = process.env.GA_PROPERTY_ID;

        if (!clientEmail || !privateKey || !propertyId) {
            console.error('Missing ENV variables');
            return;
        }

        console.log(`Testing connection for Property ID: ${propertyId}`);

        const client = new BetaAnalyticsDataClient({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey
            }
        });

        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }]
        });

        console.log('API Response Success!');
        if (response.rows && response.rows.length > 0) {
            console.log(`Found ${response.rows.length} rows of data.`);
            console.log(response.rows[0].metricValues);
        } else {
            console.log('No data rows found (expected for new implementations or new properties).');
        }
    } catch (e) {
        console.error('GA4 API Error:', e.message);
    }
}

testGA();
