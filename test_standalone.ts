import { ElektraService } from './lib/services/elektra';
import { BigDataService } from './lib/services/bigdata';
import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

async function test() {
    try {
        console.log("Fetching...");
        const res = await ElektraService.getAllSeasonReservations();
        console.log(`Fetched ${res.length} reservations`);

        const dist = BigDataService.countryDistribution(res);
        console.log("Distribution slice:", dist.slice(0, 3));

        const unknowns = res.filter(r => r.country === 'Unknown');
        if (unknowns.length > 0) {
            console.log("Found Unknowns... Wait, why?", unknowns[0]);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
