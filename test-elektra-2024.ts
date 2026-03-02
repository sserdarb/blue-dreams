process.env.ELEKTRA_USER_CODE = 'asis';
process.env.ELEKTRA_PASSWORD = 'Bdr.2025';

import { ElektraService } from './lib/services/elektra';

async function test() {
    console.log("Fetching 2024 data...");
    const cyStart = new Date(2025, 0, 1);
    const cyEnd = new Date(2025, 11, 31);
    const pyStart = new Date(2024, 0, 1);
    const pyEnd = new Date(2024, 11, 31);

    const currentYearRes = await ElektraService.getReservations(cyStart, cyEnd);
    console.log("2025: ", currentYearRes.length);

    const prevYearRes = await ElektraService.getReservations(pyStart, pyEnd);
    console.log("2024: ", prevYearRes.length);
}

test().catch(console.error);
