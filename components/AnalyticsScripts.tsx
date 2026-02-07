import Script from 'next/script'
import { prisma } from '@/lib/prisma'

interface AnalyticsSettings {
    gaId: string
    gtmId: string
    fbPixelId: string
}

async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
    try {
        const db = prisma as any
        const config = await db.analyticsConfig.findFirst()
        if (config) {
            return {
                gaId: config.gaId || '',
                gtmId: config.gtmId || '',
                fbPixelId: config.fbPixelId || '',
            }
        }
    } catch (error) {
        console.error('Error reading analytics settings:', error)
    }
    return { gaId: '', gtmId: '', fbPixelId: '' }
}

export default async function AnalyticsScripts() {
    const settings = await getAnalyticsSettings()

    return (
        <>
            {/* Google Tag Manager */}
            {settings.gtmId && (
                <>
                    <Script
                        id="gtm-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${settings.gtmId}');
                            `,
                        }}
                    />
                </>
            )}

            {/* Google Analytics 4 */}
            {settings.gaId && !settings.gtmId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script
                        id="ga4-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${settings.gaId}');
                            `,
                        }}
                    />
                </>
            )}

            {/* Facebook Pixel */}
            {settings.fbPixelId && (
                <Script
                    id="fb-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${settings.fbPixelId}');
                            fbq('track', 'PageView');
                        `,
                    }}
                />
            )}
        </>
    )
}

// GTM noscript fallback component for body
export async function GTMNoScript() {
    const settings = await getAnalyticsSettings()

    if (!settings.gtmId) return null

    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    )
}
