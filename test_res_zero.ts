import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env', override: false });

import { ElektraService } from './lib/services/elektra';

async function run() {
    try {
        console.log("\nFetching reservations...");
        const res = await ElektraService.getAllSeasonReservations();

        const zeros = res.filter(r => r.country === '0' || r.country === 0);
        console.log(`Total Reservations: ${res.length}`);
        console.log(`Reservations with '0' (string or num): ${zeros.length}`);
        if (zeros.length > 0) {
            console.log("\nExample '0':", zeros[0]);
        }

        const unknowns = res.filter(r => r.country === 'Unknown');
        console.log(`\nReservations with 'Unknown': ${unknowns.length}`);
        if (unknowns.length > 0) {
            console.log("Example 'Unknown':", unknowns[0]);
        }

        const noCountryIdList = res.filter(r => r.country !== '0' && r.country !== 0 && r.country !== 'Unknown');
        console.log(`\nReservations with valid country: ${noCountryIdList.length}`);
        if (noCountryIdList.length > 0) {
            console.log("Example valid:", noCountryIdList[0].country);
            console.log("Example 2 valid:", noCountryIdList[1]?.country);
        }
    } catch (e) {
        console.error(e);
    }
}

run();
