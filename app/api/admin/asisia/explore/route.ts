import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/actions/auth';
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
};

export async function GET(req: Request) {
    let pool;
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'tables';

        pool = await sql.connect(asisiaConfig);

        if (action === 'tables') {
            // List all tables with row count
            const result = await pool.request().query(`
                SELECT 
                    t.TABLE_NAME,
                    p.rows as ROW_COUNT
                FROM INFORMATION_SCHEMA.TABLES t
                LEFT JOIN sys.partitions p ON p.object_id = OBJECT_ID(t.TABLE_SCHEMA + '.' + t.TABLE_NAME) AND p.index_id IN (0,1)
                WHERE t.TABLE_TYPE = 'BASE TABLE'
                ORDER BY t.TABLE_NAME
            `);
            return NextResponse.json({ tables: result.recordset });
        }

        if (action === 'views') {
            const result = await pool.request().query(`
                SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS ORDER BY TABLE_NAME
            `);
            return NextResponse.json({ views: result.recordset });
        }

        if (action === 'columns') {
            const table = url.searchParams.get('table');
            if (!table) return NextResponse.json({ error: 'table param required' }, { status: 400 });
            const result = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${table}'
                ORDER BY ORDINAL_POSITION
            `);
            return NextResponse.json({ columns: result.recordset });
        }

        if (action === 'sample') {
            const table = url.searchParams.get('table');
            if (!table) return NextResponse.json({ error: 'table param required' }, { status: 400 });
            const result = await pool.request().query(`SELECT TOP 5 * FROM [${table}]`);
            return NextResponse.json({ sample: result.recordset });
        }

        if (action === 'request_statuses') {
            const result = await pool.request().query(`
                SELECT DISTINCT r.STATUS, COUNT(*) as cnt
                FROM REQUEST r
                GROUP BY r.STATUS
                ORDER BY cnt DESC
            `);
            return NextResponse.json({ statuses: result.recordset });
        }

        if (action === 'request_columns') {
            const result = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'REQUEST'
                ORDER BY ORDINAL_POSITION
            `);
            return NextResponse.json({ columns: result.recordset });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error: any) {
        console.error('Explore error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (pool) pool.close();
    }
}
