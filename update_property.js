const fs = require('fs');
fs.appendFileSync('.env', '\nGA_PROPERTY_ID="265699904"\n');
console.log('Appended GA_PROPERTY_ID to .env');
