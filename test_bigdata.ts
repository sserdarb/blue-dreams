import { BigDataService } from './lib/services/bigdata';
import { ElektraService } from './lib/services/elektra';

async function test() {
    try {
        console.log("Fetching countries mapping...");
        const countries = await ElektraService.fetchCountries();
        console.log(`Loaded ${countries.size} countries`);
        console.log("Country 0 ID?:", countries.get(0));

        console.log("Fetching reservations...");
        const res = await ElektraService.getAllSeasonReservations();
        console.log(`Fetched ${res.length} reservations`);

        const dist = BigDataService.countryDistribution(res);
        console.log("Countries Distribution:", dist.slice(0, 20));

        const zeros = res.filter(r => r.country === '0');
        if (zeros.length > 0) {
            console.log(`Found ${zeros.length} reservations with country '0'`);
            console.dir(zeros[0], { depth: null });
        }
    } catch (e) {
        console.error(e);
    }
}

test();
