import { ElektraERP } from './lib/services/purchasing'

async function run() {
    console.log("Testing ERP Purchasing endpoints...")
    const erp = new ElektraERP()

    console.log("\n--- Testing FN_ACCOUNTING_GET_STOCK_LIST ---")
    try {
        const stocks = await erp.request({
            "Action": "Function",
            "Object": "FN_ACCOUNTING_GET_STOCK_LIST",
            "Parameters": {
                "_OFFSET": 0,
                "_NEXT": 5
            }
        });
        console.log("Returned raw:", JSON.stringify(stocks, null, 2))
    } catch (e: any) {
        console.error("Error fetching stocks:", e.message)
    }
}
run()
