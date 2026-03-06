import sql from 'mssql';

async function test() {
    const config = {
        user: 'jasmin',
        password: process.env.ASISIA_DB_PASSWORD || 'X9v!Q7r#Lm2@Tz8$Wp',
        server: 'pmsjasmin.asisia.com',
        database: 'ASISIA_JASMIN',
        options: { encrypt: true, trustServerCertificate: true },
        requestTimeout: 30000
    };
    try {
        let pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT TOP 10 * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%CUR%' OR TABLE_NAME LIKE '%EXCHANGE%' OR TABLE_NAME LIKE '%DOVIZ%' OR TABLE_NAME LIKE '%RATE%'
        `);
        console.dir(result.recordset);
        pool.close();
    } catch (e) {
        console.error(e);
    }
}
test();
