const sql = require('mssql');

const config = {
    user: 'jasmin',
    password: 'X9v!Q7r#Lm2@Tz8$Wp',
    server: 'pmsjasmin.asisia.com',
    database: 'ASISIA_JASMIN',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function checkDb() {
    try {
        await sql.connect(config);

        console.log("\n--- USERS (Agent details) ---");
        const users = await sql.query`SELECT TOP 5 ID, FIRSTNAME, LASTNAME, USERNAME FROM USERS`;
        console.log(users.recordset);

        console.log("\n--- REQUEST_DETAIL (Looking for Quotes) ---");
        // Usually KIND or STATUS indicates the type of request (2 = Quote/Teklif, 3 = Rezervasyon vb.)
        const requests = await sql.query`SELECT TOP 5 REQUESTID, KIND, STATUS, ADDUSER, ADDDATE FROM REQUEST_DETAIL WHERE KIND IS NOT NULL`;
        console.log(requests.recordset);

        sql.close();
    } catch (err) {
        console.error('Connection error:', err);
    }
}

checkDb();
