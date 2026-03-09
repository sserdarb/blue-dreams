import fs from 'fs';

let content = fs.readFileSync('lib/services/bigdata.ts', 'utf8');

// Fix revparTrend missing map
const revparOld = `    // R6: RevPAR Trend (Revenue Per Available Room)
    revparTrend(reservations: Reservation[], occupancy: DailyOccupancy[]): RevenuePoint[] {
        const revByDate = new Map<string, number>()
        for (const r of reservations) {
            const date = r.checkIn.slice(0, 10)
            revByDate.set(date, (revByDate.get(date) || 0) + (r.amountTry || 0) / Math.max(1, r.nights))
        }
        return occupancy.map(o => {
            const dailyRev = revByDate.get(o.date) || 0
            const revpar = o.totalRooms > 0 ? dailyRev / o.totalRooms : 0
            return {
                date: o.date,
                revenue: Math.round(revpar),
                revenueEUR: Math.round((o.totalRooms > 0 ? (revByDateEur.get(o.date) || 0) / o.totalRooms : 0)),
                count: o.occupiedRooms,
            }
        }).sort((a, b) => a.date.localeCompare(b.date))
    },`;

const revparNew = `    // R6: RevPAR Trend (Revenue Per Available Room)
    revparTrend(reservations: Reservation[], occupancy: DailyOccupancy[]): RevenuePoint[] {
        const revByDate = new Map<string, number>()
        const revByDateEur = new Map<string, number>()
        for (const r of reservations) {
            const date = r.checkIn.slice(0, 10)
            revByDate.set(date, (revByDate.get(date) || 0) + (r.amountTry || 0) / Math.max(1, r.nights))
            revByDateEur.set(date, (revByDateEur.get(date) || 0) + (r.amountEur || 0) / Math.max(1, r.nights))
        }
        return occupancy.map(o => {
            const dailyRev = revByDate.get(o.date) || 0
            const dailyRevEur = revByDateEur.get(o.date) || 0
            const revpar = o.totalRooms > 0 ? dailyRev / o.totalRooms : 0
            const revparEur = o.totalRooms > 0 ? dailyRevEur / o.totalRooms : 0
            return {
                date: o.date,
                revenue: Math.round(revpar),
                revenueEUR: Math.round(revparEur),
                count: o.occupiedRooms,
            }
        }).sort((a, b) => a.date.localeCompare(b.date))
    },`;

content = content.replace(revparOld, revparNew);

// Fix remaining toEUR bug in yoyComparison if it exists
content = content.replace(/toEUR\(revenueCY\)/g, "(revenueCY / 38.5)");
content = content.replace(/toEUR\(revenuePY\)/g, "(revenuePY / 38.5)");

// Remove invalid extra fetch opts for older tcmb url calls that may have snuck in (type errors)
content = content.replace(/res = await fetch\(url, \{ next: \{ revalidate: 3600 \} \}\)/g, "res = await fetch(url, { cache: 'no-store' } as RequestInit)");
content = content.replace(/res = await fetch\(url, \{ next: \{ revalidate: 86400 \} \}\)/g, "res = await fetch(url, { cache: 'no-store' } as RequestInit)");

fs.writeFileSync('lib/services/bigdata.ts', content);
console.log('Fixed TS errors in bigdata.ts');
