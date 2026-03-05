// ─── Purchasing / Procurement Service ──────────────────────────
// Satın Alma Raporları — Blue Dreams Resort (341 oda, Ultra All-Inclusive)
//
// HYBRID ARCHITECTURE:
// • bookingapi.elektraweb.com → Booking-only API (no stock/purchasing endpoints)
// • api.elektraweb.com → ERP API (stock, purchasing, warehouse, accounting)
//   - Uses API key-based authentication (pre-authenticated bearer token)
//   - Object-based architecture (select/insert/update/delete with Object field)
//   - IP-restricted: only accessible from whitelisted IPs (76.13.0.113 = server)
//
// This service tries the Elektra ERP API first. If the API key is invalid
// or the API is unreachable, it falls back to realistic demo data automatically.
// ERP API Key can be overridden via ELEKTRA_ERP_API_KEY environment variable.

// ─── Types ─────────────────────────────────────────────────────

export type StockCategory = 'Gıda' | 'İçecek' | 'Temizlik' | 'Amenities' | 'Teknik' | 'Ofis'

export type StockItem = {
    id: string
    name: string
    category: StockCategory
    unit: string
    currentStock: number
    minStock: number
    maxStock: number
    avgDailyConsumption: number
    lastPrice: number
    currency: string
    priceHistory: { month: string; price: number }[]
    lastOrderDate: string
    vendor: string
}

export type PurchaseOrder = {
    id: string
    date: string
    vendor: string
    vendorId: string
    department: string
    items: { name: string; quantity: number; unitPrice: number; total: number }[]
    totalAmount: number
    currency: string
    status: 'Teslim Edildi' | 'Beklemede' | 'İptal' | 'Kısmi Teslim'
    deliveryDate: string | null
    approvedBy: string
    notes: string
}

export type Vendor = {
    id: string
    name: string
    category: string
    totalOrders: number
    totalSpent: number
    avgDeliveryDays: number
    onTimeRate: number
    returnRate: number
    priceCompetitiveness: number // 0-100, higher = more competitive
    performanceScore: number
}

export type InventoryNeed = {
    item: StockItem
    daysOfSupply: number
    needLevel: 'critical' | 'low' | 'ok' | 'excess'
    suggestedOrderQty: number
    estimatedCost: number
}

export type PurchasePerformance = {
    vendorScore: number
    priceScore: number
    deliveryScore: number
    qualityScore: number
    overallScore: number
    trend: 'up' | 'down' | 'stable'
    monthlyScores: { month: string; score: number }[]
}

export type PriceTrend = {
    itemId: string
    itemName: string
    category: StockCategory
    data: { month: string; price: number; marketAvg: number }[]
    changePercent: number
}

import { prisma } from '@/lib/prisma'
import { isDemoSession } from '@/lib/demo-session'

// ─── Elektra ERP API Client ────────────────────────────────────
// API Architecture:
// - Endpoint: POST to 4001.hoteladvisor.net
// - All requests include "Action" field in JSON body
// - Valid Actions: Login, Select, Execute, Function, Schema, SchemaList, etc.
// - Authentication via API key (pre-authenticated bearer token)
// - Dual tenants: 27744 (Stock/Accounting), 27856 (Front Office)

export const ERP_API_BASE = 'https://4001.hoteladvisor.net'

// Tenant 33264: Blue Dreams Resort — Stok, Satın Alma, Muhasebe
export const ERP_API_KEY = process.env.ELEKTRA_ERP_API_KEY || 'erpapi#33264$3f0bf0d889c1723648966a7e8c26447f9d2bde5a8ca747fa46536c765f7482945125e976d750ece41c32f839c4febb7f33cda567c1145ff3789a4905833320b4'
// Aliases used by finance.ts and hr.ts
export const ERP_API_KEY_STOCK = ERP_API_KEY
export const ERP_API_KEY_FRONT = ERP_API_KEY

export class ElektraERP {
    private apiKey: string

    constructor(apiKey: string = ERP_API_KEY) {
        this.apiKey = apiKey
    }

    get isConfigured(): boolean {
        // Skip ERP API when disabled via env var (e.g. localhost development)
        if (process.env.ELEKTRA_ERP_DISABLED === 'true') return false
        return !!this.apiKey
    }

    // Send action-based request to ERP API
    async request(payload: Record<string, unknown>): Promise<any> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
        }

        const res = await fetch(ERP_API_BASE, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(5000), // 5s timeout (was 30s)
        })

        const data = await res.json()
        if (!res.ok) {
            const msg = typeof data === 'string' ? data : data?.MESSAGE || data?.message || JSON.stringify(data)
            throw new Error(`HTTP ${res.status}: ${msg}`)
        }
        return data
    }

    async execute(objectName: string, parameters?: Record<string, unknown>): Promise<any> {
        if (!this.isConfigured) return null
        try {
            return await this.request({
                Action: 'Execute',
                Object: objectName,
                Parameters: parameters || {},
            })
        } catch (err) {
            console.warn(`[ElektraERP] Execute ${objectName}:`, (err as Error).message)
            return null
        }
    }

    async select<T>(objectName: string, filters?: Record<string, unknown>): Promise<T[] | null> {
        if (!this.isConfigured) return null

        try {
            const data = await this.request({
                Action: 'Select',
                Object: objectName,
                ...filters,
            })

            // Response might be array directly, or wrapped in items/data/rows
            if (Array.isArray(data)) return data as T[]
            if (data?.items) return data.items as T[]
            if (data?.data) return data.data as T[]
            if (data?.rows) return data.rows as T[]
            if (data?.result) return data.result as T[]
            if (data?.Result) return data.Result as T[]
            console.log(`[ElektraERP] Select ${objectName}: unexpected response format`, JSON.stringify(data).slice(0, 200))
            return null
        } catch (err) {
            console.warn(`[ElektraERP] Select ${objectName}:`, (err as Error).message)
            return null
        }
    }

    async schema(objectName: string): Promise<any> {
        if (!this.isConfigured) return null
        try {
            return await this.request({ Action: 'Schema', Object: objectName })
        } catch (err) {
            console.warn(`[ElektraERP] Schema ${objectName}:`, (err as Error).message)
            return null
        }
    }

    async schemaList(): Promise<string[] | null> {
        if (!this.isConfigured) return null
        try {
            const data = await this.request({ Action: 'SchemaList' })
            if (Array.isArray(data)) return data
            if (data?.items) return data.items
            if (data?.data) return data.data
            return null
        } catch (err) {
            console.warn('[ElektraERP] SchemaList:', (err as Error).message)
            return null
        }
    }

    // Try multiple object name variants (Elektra naming is not documented)
    async trySelect<T>(objectNames: string[], filters?: Record<string, unknown>): Promise<T[] | null> {
        for (const name of objectNames) {
            const result = await this.select<T>(name, filters)
            if (result !== null && Array.isArray(result) && result.length > 0) {
                console.log(`[ElektraERP] Found data with object: ${name}`)
                return result
            }
        }
        return null
    }
}

const erpClient = new ElektraERP(ERP_API_KEY)

// ─── Data Source Tracking ──────────────────────────────────────

export type DataSource = 'live' | 'demo'
let currentDataSource: DataSource = 'live'

// Demo data removed permanently

export const PurchasingService = {
    get dataSource(): DataSource {
        return currentDataSource
    },

    async checkSettings() {
        try {
            if (await isDemoSession()) return true
            const settings = await prisma.siteSettings.findFirst()
            return settings?.demoModePurchasing ?? false
        } catch {
            return false
        }
    },

    async getStockItems(): Promise<StockItem[]> {
        currentDataSource = 'live'

        if (erpClient.isConfigured) {
            try {
                const raw = await erpClient.request({
                    Action: 'Function',
                    Object: 'FN_ACCOUNTING_GET_STOCK_LIST',
                    Parameters: { _OFFSET: 0, _NEXT: 1000 }
                })
                let erpData: any[] = []
                if (raw && Array.isArray(raw) && raw[0]?.[0]?.Return) {
                    const parsed = JSON.parse(raw[0][0].Return)
                    erpData = parsed.STOCK_LIST || []
                }

                if (erpData && erpData.length > 0) {
                    console.log(`[Purchasing] FN_ACCOUNTING_GET_STOCK_LIST returned ${erpData.length} items`)
                    return erpData.map((item: any) => ({
                        id: String(item.ID || item.STOCKCODE || ''),
                        name: item.NAME || item.STOCKNAME || '',
                        category: (item.GROUPNAME || 'Genel') as StockCategory,
                        unit: item.UNITNAME || 'adet',
                        currentStock: item.CURRENT_STOCK_QUANTITY || 0,
                        minStock: item.MINLEVEL || 0,
                        maxStock: item.MAXLEVEL || 0,
                        avgDailyConsumption: 0, // Not explicitly in this endpoint
                        lastPrice: item.LASTBUYINGPRICE || item.AVGBUYINGPRICE || 0,
                        currency: 'TRY', // Default for now
                        priceHistory: [],
                        lastOrderDate: item.LASTBUYINGDATE ? item.LASTBUYINGDATE.split('T')[0] : '',
                        vendor: item.LASTVENDOR || '',
                    }))
                }
            } catch (err) {
                console.warn('[Purchasing] FN_ACCOUNTING_GET_STOCK_LIST failed:', (err as Error).message)
            }
        }

        return []
    },

    async getPurchaseOrders(from?: Date, to?: Date): Promise<PurchaseOrder[]> {
        currentDataSource = 'live'

        if (erpClient.isConfigured) {
            try {
                // QA_STOCK_FICHE
                const erpData = await erpClient.request({
                    Action: "Select",
                    Object: "QA_STOCK_FICHE",
                    Select: ["ID", "TDATE", "DOCNUMBER", "TOTALPRICE", "SENDERSTORENAME", "RECIPIENTSTORENAME", "VENDORNAME", "TYPENAME", "GROSSTOTAL", "APPROVALSTATUS", "APPROVALSTATE"],
                    Paging: { Current: 1, ItemsPerPage: 500 }
                })

                const fiches = erpData?.ResultSets?.[0] || []
                if (fiches.length > 0) {
                    return fiches.map((order: any) => ({
                        id: String(order.ID || order.DOCNUMBER || ''),
                        date: order.TDATE ? order.TDATE.split(' ')[0] : '',
                        vendor: order.VENDORNAME || order.SENDERSTORENAME || '',
                        vendorId: '',
                        department: order.RECIPIENTSTORENAME || '',
                        items: [], // Details require QA_STOCK_FICHE_DETAIL queries per fiche, skipped for summary
                        totalAmount: order.GROSSTOTAL || order.TOTALPRICE || 0,
                        currency: 'TRY',
                        status: order.APPROVALSTATE || order.APPROVALSTATUS || order.TYPENAME || 'Beklemede',
                        deliveryDate: null,
                        approvedBy: '',
                        notes: order.TYPENAME || '',
                    }))
                }
            } catch (err) {
                console.warn(`[Purchasing] QA_STOCK_FICHE failed:`, (err as Error).message)
            }
        }

        return []
    },

    async getVendors(): Promise<Vendor[]> {
        currentDataSource = 'live'

        if (erpClient.isConfigured) {
            const erpData = await erpClient.trySelect<any>([
                'Supplier', 'SUPPLIER', 'TEDARIKCI', 'Vendor', 'VENDOR', 'CurrentAccount'
            ])
            if (erpData && erpData.length > 0) {
                const vendors = erpData.map((v: any) => ({
                    id: String(v.Id || v.SupplierId || ''),
                    name: String(v.Name || v.SupplierName || ''),
                    category: String(v.Category || v.GroupName || ''),
                    totalOrders: Number(v.TotalOrders || 0),
                    totalSpent: Number(v.TotalSpent || v.TotalAmount || 0),
                    avgDeliveryDays: Number(v.AvgDeliveryDays || 0),
                    onTimeRate: Number(v.OnTimeRate || 0),
                    returnRate: Number(v.ReturnRate || 0),
                    priceCompetitiveness: Number(v.PriceCompetitiveness || 70),
                    performanceScore: 0,
                }))
                return vendors.sort(
                    (a: any, b: any) => b.performanceScore - a.performanceScore
                )
            }
        }

        return []
    },

    async createPurchaseOrder(payload: any): Promise<boolean> {
        if (!erpClient.isConfigured) return false
        try {
            console.log("[Purchasing] Syncing new order to ERP", payload)
            const res = await erpClient.request({
                Action: "Execute",
                Object: "SP_ACCOUNTING_API_STOCK_FICHE_INSERT",
                Parameters: {
                    JSON: JSON.stringify({
                        Language: "TR",
                        Fiches: [payload]
                    })
                }
            })
            console.log("[Purchasing] Sync Response", res)
            return true
        } catch (e: any) {
            console.error("[Purchasing] Sync order failed", e.message)
            return false
        }
    },

    async analyzeInventory(): Promise<InventoryNeed[]> {
        return []
    },

    async getPriceTrends(): Promise<PriceTrend[]> {
        return []
    },

    async getPerformanceReport(): Promise<PurchasePerformance> {
        return { vendorScore: 0, priceScore: 0, deliveryScore: 0, qualityScore: 0, overallScore: 0, trend: 'stable', monthlyScores: [] }
    },

    // Aggregate KPIs
    async getKPIs(): Promise<{
        totalSpent: number
        activeOrders: number
        criticalItems: number
        avgPerformance: number
        totalOrders: number
        vendorCount: number
        dataSource: DataSource
    }> {
        const [orders, inventory, vendors] = await Promise.all([
            this.getPurchaseOrders(),
            this.analyzeInventory(),
            this.getVendors(),
        ])

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

        const thisMonthOrders = orders.filter((o: PurchaseOrder) => o.date >= monthStart)
        const totalSpent = thisMonthOrders.reduce((sum: number, o: PurchaseOrder) => sum + o.totalAmount, 0)
        const activeOrders = orders.filter((o: PurchaseOrder) => o.status === 'Beklemede' || o.status === 'Kısmi Teslim').length
        const criticalItems = inventory.filter((n: InventoryNeed) => n.needLevel === 'critical' || n.needLevel === 'low').length
        const avgPerformance = vendors.length > 0
            ? Math.round(vendors.reduce((sum: number, v: Vendor) => sum + v.performanceScore, 0) / vendors.length)
            : 0

        return {
            totalSpent,
            activeOrders,
            criticalItems,
            avgPerformance,
            totalOrders: orders.length,
            vendorCount: vendors.length,
            dataSource: currentDataSource,
        }
    }
}
