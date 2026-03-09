import { config } from 'dotenv';
config({ path: '.env.local' });
import { BookingService } from './lib/services/booking-service';

async function test() {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 14); // 2 weeks from now
    const checkInStr = checkIn.toISOString().split('T')[0];

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);
    const checkOutStr = checkOut.toISOString().split('T')[0];

    console.log(`Testing availability for ${checkInStr} to ${checkOutStr}`);

    try {
        const results = await BookingService.getAvailability(checkInStr, checkOutStr, 2, 0, 'TRY');
        console.log(`Found ${results.length} room types available.`);
        if (results.length > 0) {
            console.log(JSON.stringify(results[0], null, 2));
        } else {
            console.log("No availability. Might be because of contract constraints or sold out dates.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}
test();
