const http = require('http');
const url = require('url');

const CLIENT_ID = '727227326353-fvshr1kvglugmbt9ocpetpnf0jv3fs4p.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:9876/callback';
const SCOPE = 'https://www.googleapis.com/auth/adwords';

// Step 1: Generate authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log('=== Google Ads OAuth2 Yetkilendirme ===');
console.log('');
console.log('Aşağıdaki URL tarayıcıda açılacak:');
console.log(authUrl);
console.log('');

// Step 2: Start local server to catch the callback
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/callback') {
        const code = parsedUrl.query.code;
        const error = parsedUrl.query.error;

        if (error) {
            console.log('❌ Yetkilendirme hatası:', error);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>❌ Yetkilendirme reddedildi</h1><p>Lütfen tekrar deneyin.</p>');
            server.close();
            return;
        }

        if (code) {
            console.log('✅ Authorization code alındı:', code.substring(0, 20) + '...');
            console.log('');
            console.log('Token değişimi yapılıyor...');

            // Exchange code for tokens
            try {
                const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: REDIRECT_URI,
                    }).toString(),
                });

                const tokenData = await tokenRes.json();

                if (tokenData.refresh_token) {
                    console.log('');
                    console.log('🎉 YENİ REFRESH TOKEN BAŞARIYLA ALINDI!');
                    console.log('════════════════════════════════════════');
                    console.log('GOOGLE_ADS_REFRESH_TOKEN=' + tokenData.refresh_token);
                    console.log('════════════════════════════════════════');
                    console.log('');
                    console.log('Access Token:', tokenData.access_token?.substring(0, 30) + '...');
                    console.log('Expires in:', tokenData.expires_in, 'saniye');
                    console.log('Scope:', tokenData.scope);

                    // Write to a temp file for easy retrieval
                    const fs = require('fs');
                    fs.writeFileSync('new_refresh_token.txt',
                        `GOOGLE_ADS_REFRESH_TOKEN="${tokenData.refresh_token}"\nAccess Token: ${tokenData.access_token}\nExpires: ${tokenData.expires_in}s\nTimestamp: ${new Date().toISOString()}`
                    );
                    console.log('');
                    console.log('📁 Token new_refresh_token.txt dosyasına kaydedildi.');

                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`
                        <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0f9ff">
                        <h1 style="color:#16a34a">🎉 Yetkilendirme Başarılı!</h1>
                        <p>Yeni Refresh Token alındı ve kaydedildi.</p>
                        <p style="background:#e2e8f0;padding:10px;border-radius:8px;font-family:monospace;word-break:break-all">
                        ${tokenData.refresh_token}
                        </p>
                        <p>Bu pencereyi kapatabilirsiniz.</p>
                        </body></html>
                    `);
                } else {
                    console.log('⚠️ Refresh token alınamadı. Yanıt:', JSON.stringify(tokenData, null, 2));
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`<h1>⚠️ Token alınamadı</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
                }
            } catch (err) {
                console.error('Token exchange hatası:', err);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>Hata</h1><p>' + err.message + '</p>');
            }

            setTimeout(() => server.close(), 2000);
            return;
        }
    }

    // Default: redirect to auth
    res.writeHead(302, { Location: authUrl });
    res.end();
});

server.listen(9876, () => {
    console.log('🌐 OAuth callback sunucusu http://localhost:9876 üzerinde dinliyor...');
    console.log('');

    // Auto-open browser
    const { exec } = require('child_process');
    exec(`start "" "${authUrl}"`);
});
