import sql from 'mssql';

const asisiaConfig = {
    user: process.env.ASISIA_DB_USER || 'jasmin',
    password: process.env.ASISIA_DB_PASSWORD || 'X9v!Q7r#Lm2@Tz8$Wp',
    server: process.env.ASISIA_DB_SERVER || 'pmsjasmin.asisia.com',
    database: process.env.ASISIA_DB_NAME || 'ASISIA_JASMIN',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    requestTimeout: 30000,
}

export interface AsisiaReservation {
    id: string;
    resNo: string;
    creationDate: string;
    checkIn: string;
    checkOut: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    totalPrice: number;
    currency: string;
    roomType: string;
    boardType: string;
    adults: number;
    status: string; // 'Confirmed' | 'Cancelled' etc.
}

export async function fetchRecentReservations(limit: number = 100): Promise<AsisiaReservation[]> {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);
        const result = await pool.request().query(`
            SELECT DISTINCT TOP ${limit}
                r.ID as RequestId,
                r.RESNO as ResNo,
                r.CREATIONDATE as CreationDate,
                b.DATE1 as CheckIn,
                b.DATE2 as CheckOut,
                p.FULLNAME as GuestName,
                p.EMAIL as GuestEmail,
                p.PHONE1 as GuestPhone,
                b.TOTAL as TotalPrice,
                b.CURCODE as Currency,
                b.ROOMTYPE as RoomType,
                b.BOARDTYPE as BoardType,
                b.ADULT as Adults
            FROM REQUEST r
            JOIN PERSON p ON r.PERSONID = p.ID
            JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            WHERE b.DATE1 IS NOT NULL AND r.RESNO IS NOT NULL AND b.TOTAL > 0
            ORDER BY r.CREATIONDATE DESC
        `);

        return result.recordset.map(row => ({
            id: row.RequestId,
            resNo: row.ResNo?.trim() || '',
            creationDate: row.CreationDate,
            checkIn: row.CheckIn,
            checkOut: row.CheckOut,
            guestName: row.GuestName?.trim() || 'Unknown',
            guestEmail: row.GuestEmail?.trim() || '',
            guestPhone: row.GuestPhone?.trim() || '',
            totalPrice: row.TotalPrice || 0,
            currency: row.Currency?.trim() || 'TRY',
            roomType: row.RoomType?.trim() || '',
            boardType: row.BoardType?.trim() || '',
            adults: row.Adults || 0,
            status: 'Confirmed'
        }));
    } catch (error) {
        console.error('[ASISIA PMS] Query Error:', error);
        return [];
    } finally {
        if (pool) pool.close();
    }
}

export async function fetchDashboardStats(startDate?: string, endDate?: string) {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);

        // Use CREATIONDATE (when reservation was made) not DATE1 (check-in)
        let dateFilter = '';
        let cancelDateFilter = '';
        if (startDate && endDate) {
            dateFilter = `AND r.CREATIONDATE >= '${startDate}' AND r.CREATIONDATE <= '${endDate} 23:59:59'`;
            cancelDateFilter = `AND r.CREATIONDATE >= '${startDate}' AND r.CREATIONDATE <= '${endDate} 23:59:59'`;
        }

        // Active reservations (created in period, not cancelled)
        // NOTE: Removed RESNO filter — quotes don't have RESNO but should be counted
        const statsQuery = await pool.request().query(`
            SELECT 
                COUNT(DISTINCT r.ID) as TotalReservations,
                ISNULL(SUM(b.TOTAL), 0) as TotalRevenue,
                AVG(DATEDIFF(day, b.DATE1, b.DATE2)) as AverageStay,
                ISNULL(SUM(b.ADULT), 0) as TotalGuests
            FROM REQUEST r
            JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            WHERE b.TOTAL > 0
              AND (r.STATUS NOT LIKE '%CANCEL%' OR r.STATUS IS NULL)
              ${dateFilter}
        `);

        // Cancelled reservations count
        const cancelQuery = await pool.request().query(`
            SELECT 
                COUNT(DISTINCT r.ID) as CancelledCount,
                ISNULL(SUM(b.TOTAL), 0) as CancelledRevenue
            FROM REQUEST r
            LEFT JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            WHERE (r.STATUS LIKE '%CANCEL%' OR r.STATUS LIKE '%İPTAL%' OR r.STATUS LIKE '%IPTAL%')
              ${cancelDateFilter}
        `);

        return {
            totalReservations: statsQuery.recordset[0].TotalReservations || 0,
            totalRevenue: statsQuery.recordset[0].TotalRevenue || 0,
            averageStay: statsQuery.recordset[0].AverageStay || 0,
            totalGuests: statsQuery.recordset[0].TotalGuests || 0,
            cancelledReservations: cancelQuery.recordset[0].CancelledCount || 0,
            cancelledRevenue: cancelQuery.recordset[0].CancelledRevenue || 0,
        };
    } catch (error) {
        console.error('[ASISIA PMS] Stats Error:', error);
        return { totalReservations: 0, totalRevenue: 0, averageStay: 0, totalGuests: 0, cancelledReservations: 0, cancelledRevenue: 0 };
    } finally {
        if (pool) pool.close();
    }
}

export async function fetchCancellationTrend(startDate: string, endDate: string) {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);

        const trendQuery = await pool.request().query(`
            SELECT 
                CAST(r.CREATIONDATE as DATE) as CancelDate,
                COUNT(DISTINCT r.ID) as CancelCount,
                ISNULL(SUM(b.TOTAL), 0) as LostRevenue
            FROM REQUEST r
            LEFT JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            WHERE (r.STATUS LIKE '%CANCEL%' OR r.STATUS LIKE '%İPTAL%' OR r.STATUS LIKE '%IPTAL%')
              AND r.CREATIONDATE >= '${startDate}' AND r.CREATIONDATE <= '${endDate} 23:59:59'
            GROUP BY CAST(r.CREATIONDATE as DATE)
            ORDER BY CancelDate ASC
        `);

        return trendQuery.recordset.map(row => ({
            date: row.CancelDate,
            count: row.CancelCount || 0,
            lostRevenue: row.LostRevenue || 0,
        }));
    } catch (error) {
        console.error('[ASISIA PMS] Cancellation Trend Error:', error);
        return [];
    } finally {
        if (pool) pool.close();
    }
}

export async function fetchCallCenterStats(startDate?: string, endDate?: string) {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);

        let reqDateFilter = '';
        if (startDate && endDate) {
            reqDateFilter = `AND r.CREATIONDATE >= '${startDate}' AND r.CREATIONDATE <= '${endDate}'`;
        }

        // 1. Agent Activity — from REQUEST (who created requests / quotes)
        let callStats: any[] = [];
        try {
            const agentQuery = await pool.request().query(`
                SELECT 
                    ISNULL(u.FIRSTNAME + ' ' + u.LASTNAME, 'Bilinmiyor') as AgentName,
                    ISNULL(u.USERNAME, '-') as AgentExtension,
                    COUNT(DISTINCT r.ID) as TotalCalls,
                    0 as TotalSeconds,
                    0 as AvgDuration,
                    SUM(CASE WHEN r.STATUS LIKE '%CANCEL%' OR r.STATUS LIKE '%IPTAL%' THEN 1 ELSE 0 END) as MissedCalls,
                    SUM(CASE WHEN r.STATUS NOT LIKE '%CANCEL%' AND (r.STATUS NOT LIKE '%IPTAL%' OR r.STATUS IS NULL) THEN 1 ELSE 0 END) as AnsweredCalls
                FROM REQUEST r
                JOIN USERS u ON r.ADDUSER = u.ID
                WHERE u.FIRSTNAME IS NOT NULL ${reqDateFilter}
                GROUP BY u.FIRSTNAME, u.LASTNAME, u.USERNAME
                ORDER BY TotalCalls DESC
            `);
            callStats = agentQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Agent query error:', e); }

        // 2. Teklif (Quote) vs Satış (Sale) — REQUEST
        let conversionStats: any[] = [];
        try {
            const conversionQuery = await pool.request().query(`
                SELECT 
                    ISNULL(u.FIRSTNAME + ' ' + u.LASTNAME, 'Bilinmiyor') as AgentName,
                    COUNT(DISTINCT r.ID) as TotalQuotes,
                    SUM(CASE WHEN r.RESNO IS NOT NULL AND r.STATUS NOT LIKE '%CANCEL%' THEN 1 ELSE 0 END) as ConvertedSales,
                    SUM(CASE WHEN r.STATUS LIKE '%CANCEL%' OR r.STATUS LIKE '%IPTAL%' THEN 1 ELSE 0 END) as CancelledRequests
                FROM REQUEST r
                JOIN USERS u ON r.ADDUSER = u.ID
                WHERE u.FIRSTNAME IS NOT NULL ${reqDateFilter}
                GROUP BY u.FIRSTNAME, u.LASTNAME
            `);
            conversionStats = conversionQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Conversion query error:', e); }

        // 3. Agent Revenue (Satış Cirosu)
        let agentRevenue: any[] = [];
        try {
            const agentRevenueQuery = await pool.request().query(`
                SELECT 
                    ISNULL(u.FIRSTNAME + ' ' + u.LASTNAME, 'Bilinmiyor') as AgentName,
                    SUM(b.TOTAL) as TotalRevenue,
                    COUNT(DISTINCT r.ID) as ReservationCount,
                    AVG(b.TOTAL) as AvgDealValue
                FROM REQUEST r
                JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
                JOIN USERS u ON r.ADDUSER = u.ID
                WHERE r.RESNO IS NOT NULL AND b.TOTAL > 0 
                  AND r.STATUS NOT LIKE '%CANCEL%'
                  ${reqDateFilter}
                GROUP BY u.FIRSTNAME, u.LASTNAME
                ORDER BY TotalRevenue DESC
            `);
            agentRevenue = agentRevenueQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Revenue query error:', e); }

        // 4. Hourly Request Trend (from CREATIONDATE hour)
        let hourlyTrend: any[] = [];
        try {
            const hourlyQuery = await pool.request().query(`
                SELECT 
                    DATEPART(hour, r.CREATIONDATE) as Hour,
                    COUNT(DISTINCT r.ID) as CallCount,
                    SUM(CASE WHEN r.STATUS LIKE '%CANCEL%' THEN 1 ELSE 0 END) as MissedCount
                FROM REQUEST r
                WHERE r.CREATIONDATE IS NOT NULL ${reqDateFilter}
                GROUP BY DATEPART(hour, r.CREATIONDATE)
                ORDER BY Hour ASC
            `);
            hourlyTrend = hourlyQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Hourly query error:', e); }

        // 5. Daily Request Trend
        let dailyTrend: any[] = [];
        try {
            const dailyQuery = await pool.request().query(`
                SELECT 
                    CAST(r.CREATIONDATE as DATE) as Date,
                    COUNT(DISTINCT r.ID) as CallCount,
                    SUM(CASE WHEN r.STATUS LIKE '%CANCEL%' THEN 1 ELSE 0 END) as MissedCount,
                    SUM(CASE WHEN r.STATUS NOT LIKE '%CANCEL%' THEN 1 ELSE 0 END) as AnsweredCount
                FROM REQUEST r
                WHERE r.CREATIONDATE IS NOT NULL ${reqDateFilter}
                GROUP BY CAST(r.CREATIONDATE as DATE)
                ORDER BY Date ASC
            `);
            dailyTrend = dailyQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Daily query error:', e); }

        // 6. Reservation Source Attribution
        let sourceAttribution: any[] = [];
        try {
            const sourceQuery = await pool.request().query(`
                SELECT 
                    ISNULL(r.SOURCE, 'Bilinmiyor') as Source,
                    COUNT(DISTINCT r.ID) as ReservationCount,
                    ISNULL(SUM(b.TOTAL), 0) as Revenue
                FROM REQUEST r
                LEFT JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
                WHERE r.RESNO IS NOT NULL ${reqDateFilter}
                GROUP BY r.SOURCE
                ORDER BY ReservationCount DESC
            `);
            sourceAttribution = sourceQuery.recordset || [];
        } catch (e) { console.error('[ASISIA] Source query error:', e); }

        // Overall metrics
        const totalCalls = callStats.reduce((s: number, a: any) => s + (a.TotalCalls || 0), 0);
        const answeredCalls = callStats.reduce((s: number, a: any) => s + (a.AnsweredCalls || 0), 0);
        const missedCalls = callStats.reduce((s: number, a: any) => s + (a.MissedCalls || 0), 0);

        return {
            callStats,
            conversionStats,
            agentRevenue,
            hourlyTrend,
            dailyTrend,
            sourceAttribution,
            summary: {
                totalCalls,
                answeredCalls,
                missedCalls,
                missedRate: totalCalls > 0 ? ((missedCalls / totalCalls) * 100).toFixed(1) : '0',
                avgDurationSeconds: 0,
            }
        };

    } catch (error) {
        console.error('[ASISIA PMS] Call Center Stats Error:', error);
        return { callStats: [], conversionStats: [], agentRevenue: [], hourlyTrend: [], dailyTrend: [], sourceAttribution: [], summary: { totalCalls: 0, answeredCalls: 0, missedCalls: 0, missedRate: '0', avgDurationSeconds: 0 } };
    } finally {
        if (pool) pool.close();
    }
}

export async function fetchPickupStats(startDate: string, endDate: string) {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);

        // Pickup: reservations created (or cancelled) within exactly this timeframe
        const pickupQuery = await pool.request().query(`
            SELECT TOP 500
                r.RESNO as ResNo,
                r.CREATIONDATE as CreationDate,
                b.DATE1 as CheckIn,
                b.TOTAL as TotalPrice,
                b.CURCODE as Currency,
                p.FULLNAME as GuestName,
                r.STATUS as Status
            FROM REQUEST r
            JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            JOIN PERSON p ON r.PERSONID = p.ID
            WHERE r.CREATIONDATE >= '${startDate} 00:00:00' 
              AND r.CREATIONDATE <= '${endDate} 23:59:59'
            ORDER BY r.CREATIONDATE DESC
        `);

        const allPickups = pickupQuery.recordset || [];

        let newRes = 0;
        let cancelledRes = 0;
        let totalRevenue = 0;

        const details = allPickups.map(row => {
            const isCancelled = row.Status?.toUpperCase().includes('CANCEL');
            if (isCancelled) {
                cancelledRes++;
            } else {
                newRes++;
                totalRevenue += row.TotalPrice || 0;
            }
            return {
                resNo: row.ResNo,
                creationDate: row.CreationDate,
                checkIn: row.CheckIn,
                guestName: row.GuestName,
                price: row.TotalPrice,
                currency: row.Currency,
                isCancelled
            };
        });

        // Group by day for the chart
        const dailyPickup: Record<string, { new: number, cancelled: number }> = {};

        details.forEach(res => {
            // creationDate is a Date object or string from DB
            const dayObj = new Date(res.creationDate);
            // shift offset to get local YYYY-MM-DD safely
            const day = new Date(dayObj.getTime() - dayObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];

            if (!dailyPickup[day]) dailyPickup[day] = { new: 0, cancelled: 0 };
            if (res.isCancelled) {
                dailyPickup[day].cancelled++;
            } else {
                dailyPickup[day].new++;
            }
        });

        const dailyTrend = Object.keys(dailyPickup).sort().map(date => ({
            date,
            new: dailyPickup[date].new,
            cancelled: dailyPickup[date].cancelled
        }));

        return {
            newReservations: newRes,
            cancelledReservations: cancelledRes,
            netPickup: newRes - cancelledRes,
            revenue: totalRevenue,
            dailyTrend,
            recentPickups: details.slice(0, 10), // Top 10 latest
            majorImpacts: details.filter(x => !x.isCancelled).sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 5) // Top 5 highest value
        };
    } catch (error) {
        console.error('[ASISIA PMS] Pickup Stats Error:', error);
        return {
            newReservations: 0, cancelledReservations: 0, netPickup: 0, revenue: 0,
            dailyTrend: [], recentPickups: [], majorImpacts: []
        };
    } finally {
        if (pool) pool.close();
    }
}

