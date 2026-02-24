import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
    try {
        const { restaurantId, baseUrl, darkColor, lightColor } = await request.json()

        if (!restaurantId) {
            return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
        }

        const menuUrl = `${baseUrl || 'https://new.bluedreamsresort.com'}/tr/menu/${restaurantId}`

        // Generate QR as data URL (PNG base64)
        const qrDataUrl = await QRCode.toDataURL(menuUrl, {
            width: 512,
            margin: 2,
            color: {
                dark: darkColor || '#1e293b',
                light: lightColor || '#ffffff',
            },
            errorCorrectionLevel: 'H',
        })

        // Also generate SVG for print
        const qrSvg = await QRCode.toString(menuUrl, {
            type: 'svg',
            width: 512,
            margin: 2,
            color: {
                dark: darkColor || '#1e293b',
                light: lightColor || '#ffffff',
            },
            errorCorrectionLevel: 'H',
        })

        return NextResponse.json({
            menuUrl,
            qrDataUrl,
            qrSvg,
        })
    } catch (error) {
        console.error('[menu-qr] Error:', error)
        return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
    }
}
