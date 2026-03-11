import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

// Google Ads OAuth callback - authorization code'u refresh token'a çevir
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
        return new Response(generateHTML('Hata', `Google yetkilendirmesi reddedildi: ${error}`, null), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    if (!code) {
        return new Response(generateHTML('Hata', 'Authorization code bulunamadı', null), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return new Response(generateHTML('Hata', 'GOOGLE_ADS_CLIENT_ID veya GOOGLE_ADS_CLIENT_SECRET eksik', null), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }

    // Container içinde request.url localhost olarak görünür — gerçek origin'i header'dan al
    const headersList = await headers()
    const forwardedHost = headersList.get('x-forwarded-host') || headersList.get('host')
    const forwardedProto = headersList.get('x-forwarded-proto') || 'https'
    const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : (process.env.NEXT_PUBLIC_SITE_URL || 'https://new.bluedreamsresort.com')
    const redirectUri = `${origin}/api/admin/ads/oauth/callback`

    try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        })

        const tokenData = await tokenRes.json()

        if (!tokenRes.ok) {
            return new Response(generateHTML('Token Hatası', `Google token alınamadı: ${tokenData.error_description || tokenData.error}`, null), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            })
        }

        const refreshToken = tokenData.refresh_token
        if (!refreshToken) {
            return new Response(generateHTML('Uyarı', 'Google refresh token döndürmedi. "prompt=consent" ile tekrar deneyin.', null), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            })
        }

        // Refresh token'ı göster - kullanıcı bunu Coolify env var'a kopyalayacak
        return new Response(generateHTML('Başarılı!', 'Yeni Google Ads Refresh Token alındı. Aşağıdaki token\'ı Coolify → Environment Variables → GOOGLE_ADS_REFRESH_TOKEN alanına yapıştırın ve Redeploy yapın.', refreshToken), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })

    } catch (err: any) {
        return new Response(generateHTML('Bağlantı Hatası', `Google API'ye bağlanılamadı: ${err.message}`, null), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
    }
}

function generateHTML(title: string, message: string, token: string | null) {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="utf-8">
    <title>Google Ads OAuth - ${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: #1e293b; border-radius: 16px; padding: 40px; max-width: 700px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        h1 { font-size: 24px; margin-bottom: 16px; color: ${token ? '#22c55e' : '#ef4444'}; }
        p { font-size: 16px; line-height: 1.6; color: #94a3b8; margin-bottom: 20px; }
        .token-box { background: #0f172a; border: 2px solid #22c55e; border-radius: 8px; padding: 16px; font-family: 'Courier New', monospace; font-size: 13px; word-break: break-all; color: #4ade80; margin-bottom: 20px; position: relative; }
        .copy-btn { background: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 600; }
        .copy-btn:hover { background: #2563eb; }
        .steps { background: #0f172a; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .steps li { color: #94a3b8; margin-bottom: 8px; font-size: 14px; }
        .steps li strong { color: #e2e8f0; }
    </style>
</head>
<body>
    <div class="card">
        <h1>${title}</h1>
        <p>${message}</p>
        ${token ? `
            <div class="token-box" id="token">${token}</div>
            <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent).then(()=>this.textContent='Kopyalandı ✓')">Token'ı Kopyala</button>
            <ol class="steps">
                <li>Yukarıdaki token'ı <strong>kopyalayın</strong></li>
                <li><strong>Coolify</strong> panelini açın → Blue Dreams Resort → Configuration</li>
                <li><strong>Environment Variables</strong> bölümünde <code>GOOGLE_ADS_REFRESH_TOKEN</code> değerini bulun</li>
                <li>Eski değeri silin ve <strong>yeni token'ı yapıştırın</strong></li>
                <li><strong>Save</strong> butonuna basın, sonra <strong>Redeploy</strong> yapın</li>
            </ol>
        ` : ''}
    </div>
</body>
</html>`
}
