import { ElektraERP } from './lib/services/purchasing'

async function run() {
    console.log("\n--- Testing FN_FORECAST_DATE ---")
    const erp = new ElektraERP()
    try {
        const res = await erp.request({
            Action: 'Function',
            Object: 'FN_FORECAST_DATE',
            Parameters: {
                HOTELID: 33264,
                STARTDATE: '2024-01-01',
                ENDDATE: '2025-12-31'
            }
        })
        if (res && res[0] && res[0][0]) {
            console.log("Returned:", res[0][0].Return ? JSON.parse(res[0][0].Return) : res[0][0])
        } else {
            console.log("Empty or no array:", res)
        }
    } catch (e: any) {
        console.error("Failed", e.message)
    }
}
run()
