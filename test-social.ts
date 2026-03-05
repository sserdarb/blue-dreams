import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

async function checkMetaAPI() {
    const token = process.env.META_ACCESS_TOKEN || ''
    const fbPageId = process.env.FB_PAGE_ID || process.env.META_PAGE_ID
    const igAccountId = process.env.IG_ACCOUNT_ID || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID

    console.log("Token length:", token.length)
    console.log("FB Page ID:", fbPageId)
    console.log("IG Account ID:", igAccountId)

    const BASE = `https://graph.facebook.com/v19.0`

    if (fbPageId) {
        console.log("--- Fetching FB ---")
        const fbRes = await fetch(`${BASE}/${fbPageId}?fields=name,fan_count,followers_count&access_token=${token}`)
        const fb = await fbRes.json()
        console.log(fb)
    }

    if (igAccountId) {
        console.log("--- Fetching IG ---")
        const igRes = await fetch(`${BASE}/${igAccountId}?fields=name,username,followers_count,media_count&access_token=${token}`)
        const ig = await igRes.json()
        console.log(ig)

        console.log("--- Fetching IG Posts ---")
        const mediaRes = await fetch(`${BASE}/${igAccountId}/media?fields=id,media_type,like_count,comments_count&limit=2&access_token=${token}`)
        const media = await mediaRes.json()
        console.log(media)
    }
}

checkMetaAPI()
