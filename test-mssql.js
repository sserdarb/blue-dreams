const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
    user: process.env.ASISIA_DB_USER || 'jasmin',
    password: process.env.ASISIA_DB_PASSWORD || 'X9v!Q7r#Lm2@Tz8$Wp',
    server: process.env.ASISIA_DB_SERVER || 'pmsjasmin.asisia.com',
    database: process.env.ASISIA_DB_NAME || 'ASISIA_JASMIN',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
    requestTimeout: 20000,
};

async function test() {
    try {
        console.log("Connecting to", config.server, "...");
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT TOP 1 * FROM USERS');
        console.log("Successfully connected! Fetched 1 user:", result.recordset[0]);
        pool.close();
    } catch (err) {
        console.error("Connection failed:", err);
    }
}
test();
