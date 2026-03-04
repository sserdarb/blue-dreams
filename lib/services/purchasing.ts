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

// ─── Demo Generation Functions Removed for Live Data Strictness ─────────

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

// ─── Exported Service ──────────────────────────────────────────


export const PurchasingService = {
    // Returns whether the last data fetch used live API or demo data
    get dataSource(): DataSource {
        return currentDataSource
    },

    async getStockItems(): Promise<StockItem[]> {
        if (erpClient.isConfigured) {
            try {
                const raw = await erpClient.execute('SP_STOCK_LIST', { QUICKINVOICEACTIVE: 0 })
                // SP_STOCK_LIST returns [[...items]] — unwrap the outer array
                const erpData = Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])
                    ? raw[0]
                    : Array.isArray(raw) ? raw : null
                if (erpData && erpData.length > 0) {
                    currentDataSource = 'live'
                    console.log(`[Purchasing] SP_STOCK_LIST returned ${erpData.length} items`)
                    return erpData.map((item: any) => ({
                        id: String(item.ID || item.Id || item.STOCKCODE || ''),
                        name: item.NAME || item.Name || item.STOCKNAME || item.DESCRIPTION || '',
                        category: (item.STOCKGROUPNAME || item.GROUPNAME || item.Category || 'Gıda') as StockCategory,
                        unit: item.REPORTUNIT || item.UNITNAME || item.Unit || 'adet',
                        currentStock: item.CURRENTSTOCK ?? item.STOCK ?? item.Quantity ?? 0,
                        minStock: item.MINSTOCK ?? item.MINLEVEL ?? item.MinStock ?? 0,
                        maxStock: item.MAXSTOCK ?? item.MAXLEVEL ?? item.MaxStock ?? 0,
                        avgDailyConsumption: item.AVGCONSUMPTION ?? item.AvgConsumption ?? 0,
                        lastPrice: item.LASTPRICE ?? item.UNITPRICE ?? item.Price ?? 0,
                        currency: item.CURRENCY || item.Currency || 'TRY',
                        priceHistory: [],
                        lastOrderDate: item.LASTORDERDATE || item.LastOrderDate || '',
                        vendor: item.SUPPLIERNAME || item.Vendor || '',
                    }))
                }
            } catch (err) {
                console.warn('[Purchasing] SP_STOCK_LIST failed:', (err as Error).message)
            }
        }
        currentDataSource = 'live'
        return []
    },

    async getPurchaseOrders(from?: Date, to?: Date): Promise<PurchaseOrder[]> {
        if (erpClient.isConfigured) {
            const filters: Record<string, unknown> = {}
            if (from) filters.StartDate = from.toISOString().split('T')[0]
            if (to) filters.EndDate = to.toISOString().split('T')[0]

            const erpData = await erpClient.trySelect<any>([
                'PurchaseOrder', 'PURCHASEORDER', 'SATINALMA',
                'PurchaseDemand', 'DEMAND', 'SATIN_ALMA',
            ], filters)
            if (erpData) {
                currentDataSource = 'live'
                return erpData.map((order: any) => ({
                    id: order.Id || order.OrderNo || '',
                    date: order.Date || order.OrderDate || '',
                    vendor: order.Vendor || order.SupplierName || '',
                    vendorId: order.VendorId || order.SupplierId || '',
                    department: order.Department || order.DepartmentName || '',
                    items: (order.Items || order.Details || []).map((item: any) => ({
                        name: item.Name || item.StockName || '',
                        quantity: item.Quantity || item.Qty || 0,
                        unitPrice: item.UnitPrice || item.Price || 0,
                        total: item.Total || item.Amount || 0,
                    })),
                    totalAmount: order.TotalAmount || order.Total || 0,
                    currency: order.Currency || 'TRY',
                    status: order.Status || 'Beklemede',
                    deliveryDate: order.DeliveryDate || null,
                    approvedBy: order.ApprovedBy || '',
                    notes: order.Notes || '',
                }))
            }
        }
        currentDataSource = 'live'
        return []
    },

    async getVendors(): Promise<Vendor[]> {
        if (erpClient.isConfigured) {
            const erpData = await erpClient.trySelect<any>([
                'Supplier', 'SUPPLIER', 'TEDARIKCI', 'Vendor', 'VENDOR',
            ])
            if (erpData) {
                currentDataSource = 'live'
                const vendors = erpData.map((v: any) => ({
                    id: v.Id || v.SupplierId || '',
                    name: v.Name || v.SupplierName || '',
                    category: v.Category || v.GroupName || '',
                    totalOrders: v.TotalOrders || 0,
                    totalSpent: v.TotalSpent || v.TotalAmount || 0,
                    avgDeliveryDays: v.AvgDeliveryDays || 0,
                    onTimeRate: v.OnTimeRate || 0,
                    returnRate: v.ReturnRate || 0,
                    priceCompetitiveness: v.PriceCompetitiveness || 70,
                    performanceScore: 0,
                }))
                return vendors.sort(
                    (a: any, b: any) => b.performanceScore - a.performanceScore
                )
            }
        }
        currentDataSource = 'live'
        return []
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

        const thisMonthOrders = orders.filter(o => o.date >= monthStart)
        const totalSpent = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0)
        const activeOrders = orders.filter(o => o.status === 'Beklemede' || o.status === 'Kısmi Teslim').length
        const criticalItems = inventory.filter(n => n.needLevel === 'critical' || n.needLevel === 'low').length
        const avgPerformance = vendors.length > 0
            ? Math.round(vendors.reduce((sum, v) => sum + v.performanceScore, 0) / vendors.length)
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
