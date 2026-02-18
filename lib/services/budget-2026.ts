/**
 * 2026 Season Budget Data — Blue Dreams Resort
 * Source: Hotel Management 2026 Revenue Budget Spreadsheet
 * All values in EUR (€)
 * Season: April (04) – October (10)
 */

// ─── Budget Channels ────────────────────────────────────────────
export type BudgetChannel = 'EURO' | 'UK' | 'LOC' | 'DIR' | 'Online' | 'GRP' | 'OTH'

// Months 4 (April) through 10 (October)
export type BudgetMonth = 4 | 5 | 6 | 7 | 8 | 9 | 10

// ─── Raw Budget Data (EUR) ──────────────────────────────────────
// [channel][month] = revenue in EUR
const BUDGET_DATA: Record<BudgetChannel, Record<BudgetMonth, number>> = {
    EURO: {
        4: 0,
        5: 457483.24,
        6: 946839.58,
        7: 1235713.32,
        8: 923377.20,
        9: 784730.02,
        10: 440992.24,
    },
    UK: {
        4: 0,
        5: 141579.37,
        6: 378998.47,
        7: 341412.44,
        8: 323044.26,
        9: 189378.23,
        10: 148013.57,
    },
    LOC: {
        4: 0,
        5: 100347.11,
        6: 233004.03,
        7: 452849.76,
        8: 593755.24,
        9: 351923.35,
        10: 121844.52,
    },
    DIR: {
        4: 0,
        5: 78481.81,
        6: 126400.46,
        7: 498339.61,
        8: 818888.66,
        9: 408998.92,
        10: 124925.46,
    },
    Online: {
        4: 0,
        5: 117802.51,
        6: 157359.88,
        7: 312120.32,
        8: 415525.92,
        9: 239266.23,
        10: 240914.74,
    },
    GRP: {
        4: 235220.55,
        5: 105300.00,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 11791.07,
    },
    OTH: {
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
    },
}

// ─── Channel Yearly Totals ──────────────────────────────────────
const CHANNEL_YEARLY: Record<BudgetChannel, number> = {
    EURO: 4789135.60,
    UK: 1522426.34,
    LOC: 1853724.02,
    DIR: 2056034.91,
    Online: 1482989.60,
    GRP: 352311.62,
    OTH: 0,
}

const SEASON_TOTAL = 12056622.08

// ─── Month Names (Turkish) ──────────────────────────────────────
const MONTH_NAMES: Record<BudgetMonth, string> = {
    4: 'Nisan',
    5: 'Mayıs',
    6: 'Haziran',
    7: 'Temmuz',
    8: 'Ağustos',
    9: 'Eylül',
    10: 'Ekim',
}

const CHANNEL_LABELS: Record<BudgetChannel, string> = {
    EURO: 'Avrupa T.O.',
    UK: 'İngiltere T.O.',
    LOC: 'Yerli Market',
    DIR: 'Direkt Satış',
    Online: 'Online (OTA)',
    GRP: 'Grup',
    OTH: 'Diğer',
}

const CHANNEL_COLORS: Record<BudgetChannel, string> = {
    EURO: '#8b5cf6',
    UK: '#06b6d4',
    LOC: '#f59e0b',
    DIR: '#10b981',
    Online: '#ec4899',
    GRP: '#3b82f6',
    OTH: '#64748b',
}

// ─── Helper Functions ───────────────────────────────────────────

/** Get total budget for a specific month (all channels) */
export function getMonthlyBudget(month: number): number {
    if (month < 4 || month > 10) return 0
    const m = month as BudgetMonth
    return Object.values(BUDGET_DATA).reduce((sum, ch) => sum + (ch[m] || 0), 0)
}

/** Get budget for a specific channel in a specific month */
export function getChannelBudget(channel: BudgetChannel, month: number): number {
    if (month < 4 || month > 10) return 0
    return BUDGET_DATA[channel]?.[month as BudgetMonth] || 0
}

/** Get yearly total for a channel */
export function getChannelYearly(channel: BudgetChannel): number {
    return CHANNEL_YEARLY[channel] || 0
}

/** Get the full season budget total */
export function getSeasonTotal(): number {
    return SEASON_TOTAL
}

/** Get all monthly budget data for charts */
export function getMonthlyBudgetData(): { month: number; monthName: string; budget: number }[] {
    return ([4, 5, 6, 7, 8, 9, 10] as BudgetMonth[]).map(m => ({
        month: m,
        monthName: MONTH_NAMES[m],
        budget: getMonthlyBudget(m),
    }))
}

/** Get channel breakdown for a specific month */
export function getChannelBreakdown(month: number): { channel: BudgetChannel; label: string; budget: number; color: string }[] {
    if (month < 4 || month > 10) return []
    const m = month as BudgetMonth
    return (Object.keys(BUDGET_DATA) as BudgetChannel[])
        .map(ch => ({
            channel: ch,
            label: CHANNEL_LABELS[ch],
            budget: BUDGET_DATA[ch][m] || 0,
            color: CHANNEL_COLORS[ch],
        }))
        .filter(d => d.budget > 0)
        .sort((a, b) => b.budget - a.budget)
}

/** Get full budget vs actual comparison for a month */
export function getBudgetComparison(month: number, actualEUR: number): {
    budget: number
    actual: number
    remaining: number
    realization: number // percentage
} {
    const budget = getMonthlyBudget(month)
    return {
        budget,
        actual: actualEUR,
        remaining: budget - actualEUR,
        realization: budget > 0 ? Math.round((actualEUR / budget) * 100) : 0,
    }
}

/** Get full season budget vs actual comparison */
export function getSeasonComparison(actualEUR: number): {
    budget: number
    actual: number
    remaining: number
    realization: number
} {
    return {
        budget: SEASON_TOTAL,
        actual: actualEUR,
        remaining: SEASON_TOTAL - actualEUR,
        realization: Math.round((actualEUR / SEASON_TOTAL) * 100),
    }
}

/** Get all channel yearly data for table/chart */
export function getChannelBudgetSummary(): { channel: BudgetChannel; label: string; yearly: number; color: string; share: number }[] {
    return (Object.keys(CHANNEL_YEARLY) as BudgetChannel[])
        .filter(ch => CHANNEL_YEARLY[ch] > 0)
        .map(ch => ({
            channel: ch,
            label: CHANNEL_LABELS[ch],
            yearly: CHANNEL_YEARLY[ch],
            color: CHANNEL_COLORS[ch],
            share: Math.round((CHANNEL_YEARLY[ch] / SEASON_TOTAL) * 100),
        }))
        .sort((a, b) => b.yearly - a.yearly)
}

/** Monthly budget data with channel breakdown */
export function getFullMonthlyBreakdown(): {
    month: number
    monthName: string
    total: number
    channels: Record<BudgetChannel, number>
}[] {
    return ([4, 5, 6, 7, 8, 9, 10] as BudgetMonth[]).map(m => ({
        month: m,
        monthName: MONTH_NAMES[m],
        total: getMonthlyBudget(m),
        channels: Object.fromEntries(
            (Object.keys(BUDGET_DATA) as BudgetChannel[]).map(ch => [ch, BUDGET_DATA[ch][m] || 0])
        ) as Record<BudgetChannel, number>,
    }))
}

// Re-export constants
export { BUDGET_DATA, CHANNEL_LABELS, CHANNEL_COLORS as BUDGET_CHANNEL_COLORS, MONTH_NAMES as BUDGET_MONTH_NAMES }
