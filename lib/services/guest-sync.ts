// Guest Sync Service — Import Elektra reservations into GuestProfile
import { prisma } from '@/lib/prisma';
import { ElektraService } from './elektra';

interface SyncResult {
    created: number;
    updated: number;
    total: number;
}

export async function syncGuestsFromElektra(
    fromDate: Date,
    toDate: Date
): Promise<SyncResult> {
    let created = 0;
    let updated = 0;

    // Fetch all reservations from Elektra
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    const reservations = await ElektraService.getReservations(
        new Date(from), new Date(to), 'Reservation'
    );

    // Also fetch checked-out guests
    const checkedOut = await ElektraService.getReservations(
        new Date(from), new Date(to), 'CheckOut'
    );

    const allReservations = [...reservations, ...checkedOut];

    // Build guest map: group by name+surname
    const guestMap = new Map<string, {
        name: string;
        surname: string;
        country: string;
        email: string | null;
        phone: string | null;
        reservations: typeof allReservations;
    }>();

    for (const res of allReservations) {
        const guestList = res.guests || [];
        const firstName = guestList[0]?.name || (res.contactName as string)?.split(' ')[0] || '';
        const lastName = guestList[0]?.surname || (res.contactName as string)?.split(' ').slice(1).join(' ') || '';
        const guestNationality = guestList[0]?.country || res.country || '';

        const key = `${firstName.toLowerCase().trim()}_${lastName.toLowerCase().trim()}`;

        if (!key || key === '_') continue;

        if (!guestMap.has(key)) {
            guestMap.set(key, {
                name: firstName,
                surname: lastName,
                country: guestNationality || 'Unknown',
                email: (res.contactEmail as string) || null,
                phone: (res.contactPhone as string) || null,
                reservations: [res],
            });
        } else {
            const existing = guestMap.get(key)!;
            existing.reservations.push(res);
            if (!existing.email && res.contactEmail) existing.email = res.contactEmail as string;
            if (!existing.phone && res.contactPhone) existing.phone = res.contactPhone as string;
            if (existing.country === 'Unknown' && res.country) existing.country = res.country;
        }
    }

    // Upsert each guest
    for (const [, guest] of guestMap) {
        const totalStays = guest.reservations.length;
        const totalRevenue = guest.reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

        const checkInDates = guest.reservations
            .map(r => new Date(r.checkIn))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());

        const checkOutDates = guest.reservations
            .map(r => new Date(r.checkOut))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());

        const firstCheckIn = checkInDates[0] || null;
        const lastCheckIn = checkInDates[checkInDates.length - 1] || null;
        const lastCheckOut = checkOutDates[0] || null;

        const tags: string[] = [];
        if (totalStays >= 2) tags.push('Repeat');
        if (totalStays >= 5) tags.push('VIP');
        if (totalRevenue > 50000) tags.push('HighValue');

        try {
            // Try to find existing guest by name+surname
            const existing = await prisma.guestProfile.findFirst({
                where: {
                    name: { equals: guest.name, mode: 'insensitive' },
                    surname: { equals: guest.surname, mode: 'insensitive' },
                },
            });

            if (existing) {
                await prisma.guestProfile.update({
                    where: { id: existing.id },
                    data: {
                        country: guest.country !== 'Unknown' ? guest.country : existing.country,
                        email: guest.email || existing.email,
                        phone: guest.phone || existing.phone,
                        totalStays,
                        totalRevenue,
                        firstCheckIn,
                        lastCheckIn,
                        lastCheckOut,
                        tags: JSON.stringify(tags),
                    },
                });
                updated++;
            } else {
                await prisma.guestProfile.create({
                    data: {
                        name: guest.name,
                        surname: guest.surname,
                        country: guest.country,
                        email: guest.email,
                        phone: guest.phone,
                        totalStays,
                        totalRevenue,
                        firstCheckIn,
                        lastCheckIn,
                        lastCheckOut,
                        tags: JSON.stringify(tags),
                        source: 'elektra',
                    },
                });
                created++;
            }
        } catch (err) {
            console.error(`[GuestSync] Error processing guest ${guest.name} ${guest.surname}:`, err);
        }
    }

    return { created, updated, total: guestMap.size };
}
