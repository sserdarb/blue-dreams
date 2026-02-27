const sql = require('mssql');

const config = {
    user: 'jasmin',
    password: 'X9v!Q7r#Lm2@Tz8$Wp',
    server: 'pmsjasmin.asisia.com',
    database: 'master', // Default or need to discover
    options: {
        encrypt: true,
        trustServerCertificate: true // Trust if self-signed
    }
};

async function checkDb() {
    try {
        console.log('Connecting to Asisia CRM...');
        await sql.connect(config);
        console.log('Connected! Fetching tables...');

        const result = await sql.query`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
        console.log(result.recordset.map(r => r.TABLE_NAME));

        sql.close();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

checkDb();
