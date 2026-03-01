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

        let dateFilter = '';
        if (startDate && endDate) {
            dateFilter = `AND b.DATE1 >= '${startDate}' AND b.DATE1 <= '${endDate}'`;
        }

        // Summary queries
        const statsQuery = await pool.request().query(`
            SELECT 
                COUNT(DISTINCT r.ID) as TotalReservations,
                SUM(b.TOTAL) as TotalRevenue,
                AVG(DATEDIFF(day, b.DATE1, b.DATE2)) as AverageStay,
                SUM(b.ADULT) as TotalGuests
            FROM REQUEST r
            JOIN VW_BASKET_INFO b ON r.ID = b.REQUESTID
            WHERE b.DATE1 IS NOT NULL AND r.RESNO IS NOT NULL AND b.TOTAL > 0 ${dateFilter}
        `);

        return {
            totalReservations: statsQuery.recordset[0].TotalReservations || 0,
            totalRevenue: statsQuery.recordset[0].TotalRevenue || 0,
            averageStay: statsQuery.recordset[0].AverageStay || 0,
            totalGuests: statsQuery.recordset[0].TotalGuests || 0,
        };
    } catch (error) {
        console.error('[ASISIA PMS] Stats Error:', error);
        return { totalReservations: 0, totalRevenue: 0, averageStay: 0, totalGuests: 0 };
    } finally {
        if (pool) pool.close();
    }
}

export async function fetchCallCenterStats(startDate?: string, endDate?: string) {
    let pool;
    try {
        pool = await sql.connect(asisiaConfig);

        let callDateFilter = '';
        let reqDateFilter = '';

        if (startDate && endDate) {
            callDateFilter = `WHERE c.calldate >= '${startDate}' AND c.calldate <= '${endDate}'`;
            reqDateFilter = `AND r.CREATIONDATE >= '${startDate}' AND r.CREATIONDATE <= '${endDate}'`;
        }

        // 1. Agent Based Call Totals & Durations
        const agentQuery = await pool.request().query(`
            SELECT 
                u.FIRSTNAME + ' ' + u.LASTNAME as AgentName,
                c.src as AgentExtension,
                COUNT(c.uniqueid) as TotalCalls,
                SUM(c.duration) as TotalSeconds
            FROM SNT_CALLS c
            LEFT JOIN USERS u ON c.src = u.USERNAME OR c.src = (u.FIRSTNAME + '.' + u.LASTNAME)
            ${callDateFilter}
            AND c.src IS NOT NULL
            GROUP BY u.FIRSTNAME, u.LASTNAME, c.src
            ORDER BY TotalCalls DESC
        `);

        // 2. Request / Quote Conversions per User (Teklifler vs Satış)
        // KIND = 0 could map to 'Quote/Teklif', whereas KIND != 0 or having RESNO maps to finalized sale.
        const conversionQuery = await pool.request().query(`
            SELECT 
                u.FIRSTNAME + ' ' + u.LASTNAME as AgentName,
                COUNT(r.REQUESTID) as TotalOpportunities,
                SUM(CASE WHEN r.STATUS NOT LIKE '%CANCEL%' THEN 1 ELSE 0 END) as ConvertedSales
            FROM REQUEST_DETAIL r
            JOIN USERS u ON r.ADDUSER = u.ID
            WHERE u.FIRSTNAME IS NOT NULL ${reqDateFilter}
            GROUP BY u.FIRSTNAME, u.LASTNAME
        `);

        // 3. Hourly Call Trend
        const hourlyQuery = await pool.request().query(`
            SELECT 
                DATEPART(hour, c.calldate) as Hour,
                COUNT(c.uniqueid) as CallCount
            FROM SNT_CALLS c
            ${callDateFilter ? callDateFilter : 'WHERE c.calldate IS NOT NULL'}
            GROUP BY DATEPART(hour, c.calldate)
            ORDER BY Hour ASC
        `);

        // 4. Daily Call Trend
        const dailyQuery = await pool.request().query(`
            SELECT 
                CAST(c.calldate as DATE) as Date,
                COUNT(c.uniqueid) as CallCount
            FROM SNT_CALLS c
            ${callDateFilter ? callDateFilter : 'WHERE c.calldate IS NOT NULL'}
            GROUP BY CAST(c.calldate as DATE)
            ORDER BY Date ASC
        `);

        return {
            callStats: agentQuery.recordset || [],
            conversionStats: conversionQuery.recordset || [],
            hourlyTrend: hourlyQuery.recordset || [],
            dailyTrend: dailyQuery.recordset || []
        };

    } catch (error) {
        console.error('[ASISIA PMS] Call Center Stats Error:', error);
        return { callStats: [], conversionStats: [], hourlyTrend: [], dailyTrend: [] };
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

