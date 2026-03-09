import fs from 'fs';
import path from 'path';

const file = path.resolve('lib/services/bigdata.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove EUR_RATE and functions
content = content.replace(
    `// EUR/TRY rate used for conversions
const EUR_RATE = 38.5

function toTRY(amount: number, currency: string): number {
    if (currency === 'TRY') return amount
    if (currency === 'EUR') return amount * EUR_RATE
    if (currency === 'USD') return amount * 35.7
    return amount * EUR_RATE
}

function toEUR(tryAmount: number): number {
    return tryAmount / EUR_RATE
}`,
    "// Rates are now dynamically computed per-reservation using true historical exchange rates from Elektra.\n// Fields `amountTry` and `amountEur` on the Reservation objects are used instead of static multipliers."
);

// 2. Replace specific R1 occurrences for revenue calculation explicitly 
content = content.replace(
    /revenue: Math\.round\(rsvs\.reduce\(\(s, r\) => s \+ toTRY\(r\.totalPrice, r\.currency\), 0\)\),\s*revenueEUR: Math\.round\(rsvs\.reduce\(\(s, r\) => s \+ toTRY\(r\.totalPrice, r\.currency\), 0\) \/ EUR_RATE\),/g,
    "revenue: Math.round(rsvs.reduce((s, r) => s + (r.amountTry || 0), 0)),\n            revenueEUR: Math.round(rsvs.reduce((s, r) => s + (r.amountEur || 0), 0)),"
);

// 3. Replace all remaining `toTRY` and `toEUR` references
content = content.replace(/toTRY\(r\.totalPrice, r\.currency\)/g, "(r.amountTry || 0)");
content = content.replace(/toTRY\(r\.paidPrice, r\.currency\)/g, "((r.amountTry || 0) * (r.paidPrice / Math.max(1, r.totalPrice)))");
content = content.replace(/toEUR\(curRev\)/g, "(current.reduce((s, r) => s + (r.amountEur || 0), 0))");
content = content.replace(/toEUR\(prevRev\)/g, "(previous.reduce((s, r) => s + (r.amountEur || 0), 0))");
content = content.replace(/toEUR\(revpar\)/g, "(o.totalRooms > 0 ? (revByDateEur.get(o.date) || 0) / o.totalRooms : 0)");
// Note totalEur is used below where totalRev is extracted, replacing only known occurrences
content = content.replace(/toEUR\(totalRev \/ totalNights\)/g, "(totalNights > 0 ? totalEur / totalNights : 0)");
content = content.replace(/const totalRev = rsvs\.reduce\(\(s, r\) => s \+ \(r\.amountTry \|\| 0\), 0\)/g, "const totalRev = rsvs.reduce((s, r) => s + (r.amountTry || 0), 0)\n            const totalEur = rsvs.reduce((s, r) => s + (r.amountEur || 0), 0)");
content = content.replace(/toEUR\(totalRev\)/g, "(reservations.reduce((s, r) => s + (r.amountEur || 0), 0))");
content = content.replace(/toEUR\(adr\)/g, "(totalNights > 0 ? (reservations.reduce((s, r) => s + (r.amountEur || 0), 0)) / totalNights : 0)");

// 4. Special manual refactor for RevPAR Trend needing Euro maps
content = content.replace(
    /const revByDate = new Map<string, number>\(\)\n        for \(const r of reservations\) {\n            const date = r\.checkIn\.slice\(0, 10\)\n            revByDate\.set\(date, \(revByDate\.get\(date\) \|\| 0\) \+ \(r\.amountTry \|\| 0\) \/ Math\.max\(1, r\.nights\)\)\n        }/,
    `const revByDate = new Map<string, number>()
        const revByDateEur = new Map<string, number>()
        for (const r of reservations) {
            const date = r.checkIn.slice(0, 10)
            revByDate.set(date, (revByDate.get(date) || 0) + (r.amountTry || 0) / Math.max(1, r.nights))
            revByDateEur.set(date, (revByDateEur.get(date) || 0) + (r.amountEur || 0) / Math.max(1, r.nights))
        }`
);

fs.writeFileSync(file, content);
console.log("Successfully replaced bigdata.ts math");
