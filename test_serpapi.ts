import { fetchBodrumAttractions, fetchBodrumEvents } from './lib/services/serpapi';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
    console.log("Testing Attractions...");
    const attr = await fetchBodrumAttractions();
    console.log("Attractions:", attr.length);
    console.log(attr.slice(0, 2));

    console.log("\nTesting Events...");
    const events = await fetchBodrumEvents();
    console.log("Events:", events.length);
    console.log(events.slice(0, 2));
}
test();
