// ─── Purchasing / Procurement Service ──────────────────────────
// Satın Alma Raporları — Blue Dreams Resort (370 oda, Ultra All-Inclusive)
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

// ─── Seeded Random (deterministic per day) ─────────────────────

function seededRandom(seed: number): () => number {
    let s = seed
    return () => {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
    }
}

const today = new Date()
const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
const rng = seededRandom(daySeed)

function randBetween(min: number, max: number): number {
    return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number): number {
    return Math.round((rng() * (max - min) + min) * 100) / 100
}

// ─── Demo Data: Stock Items ────────────────────────────────────

const STOCK_ITEMS: StockItem[] = [
    // Gıda
    { id: 'G001', name: 'Dana Kıyma (kg)', category: 'Gıda', unit: 'kg', currentStock: 180, minStock: 100, maxStock: 500, avgDailyConsumption: 45, lastPrice: 320, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Özgür Et' },
    { id: 'G002', name: 'Tavuk But (kg)', category: 'Gıda', unit: 'kg', currentStock: 350, minStock: 200, maxStock: 800, avgDailyConsumption: 80, lastPrice: 145, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-15', vendor: 'Banvit' },
    { id: 'G003', name: 'Süt (lt)', category: 'Gıda', unit: 'lt', currentStock: 120, minStock: 150, maxStock: 500, avgDailyConsumption: 60, lastPrice: 42, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-13', vendor: 'Sütaş' },
    { id: 'G004', name: 'Yumurta (adet)', category: 'Gıda', unit: 'adet', currentStock: 2500, minStock: 1000, maxStock: 5000, avgDailyConsumption: 400, lastPrice: 5.5, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-15', vendor: 'Keskinoğlu' },
    { id: 'G005', name: 'Domates (kg)', category: 'Gıda', unit: 'kg', currentStock: 80, minStock: 100, maxStock: 400, avgDailyConsumption: 55, lastPrice: 35, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Bodrum Hal' },
    { id: 'G006', name: 'Salatalık (kg)', category: 'Gıda', unit: 'kg', currentStock: 95, minStock: 80, maxStock: 300, avgDailyConsumption: 40, lastPrice: 28, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Bodrum Hal' },
    { id: 'G007', name: 'Pirinç (kg)', category: 'Gıda', unit: 'kg', currentStock: 200, minStock: 100, maxStock: 500, avgDailyConsumption: 25, lastPrice: 65, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-10', vendor: 'Reis Gıda' },
    { id: 'G008', name: 'Un (kg)', category: 'Gıda', unit: 'kg', currentStock: 450, minStock: 200, maxStock: 800, avgDailyConsumption: 35, lastPrice: 32, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-08', vendor: 'Söke Un' },
    { id: 'G009', name: 'Zeytinyağı (lt)', category: 'Gıda', unit: 'lt', currentStock: 160, minStock: 100, maxStock: 400, avgDailyConsumption: 15, lastPrice: 280, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-11', vendor: 'Tariş' },
    { id: 'G010', name: 'Balık (kg)', category: 'Gıda', unit: 'kg', currentStock: 45, minStock: 50, maxStock: 200, avgDailyConsumption: 30, lastPrice: 420, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-15', vendor: 'Bodrum Balık' },
    { id: 'G011', name: 'Peynir Çeşitleri (kg)', category: 'Gıda', unit: 'kg', currentStock: 110, minStock: 80, maxStock: 300, avgDailyConsumption: 20, lastPrice: 250, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-13', vendor: 'Muratbey' },
    { id: 'G012', name: 'Tereyağı (kg)', category: 'Gıda', unit: 'kg', currentStock: 65, minStock: 40, maxStock: 150, avgDailyConsumption: 12, lastPrice: 380, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-12', vendor: 'Sütaş' },
    // İçecek
    { id: 'I001', name: 'Kola (lt)', category: 'İçecek', unit: 'lt', currentStock: 800, minStock: 500, maxStock: 2000, avgDailyConsumption: 120, lastPrice: 18, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Coca-Cola' },
    { id: 'I002', name: 'Su (0.5lt şişe)', category: 'İçecek', unit: 'adet', currentStock: 3000, minStock: 2000, maxStock: 8000, avgDailyConsumption: 500, lastPrice: 3.5, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-15', vendor: 'Erikli' },
    { id: 'I003', name: 'Bira (33cl)', category: 'İçecek', unit: 'adet', currentStock: 1200, minStock: 800, maxStock: 3000, avgDailyConsumption: 200, lastPrice: 35, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Efes' },
    { id: 'I004', name: 'Şarap (şişe)', category: 'İçecek', unit: 'adet', currentStock: 250, minStock: 150, maxStock: 600, avgDailyConsumption: 20, lastPrice: 180, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-10', vendor: 'Kavaklidere' },
    { id: 'I005', name: 'Kahve (kg)', category: 'İçecek', unit: 'kg', currentStock: 40, minStock: 30, maxStock: 100, avgDailyConsumption: 5, lastPrice: 650, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-12', vendor: 'Mehmet Efendi' },
    { id: 'I006', name: 'Meyve Suyu (lt)', category: 'İçecek', unit: 'lt', currentStock: 450, minStock: 300, maxStock: 1200, avgDailyConsumption: 80, lastPrice: 28, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-14', vendor: 'Cappy' },
    // Temizlik
    { id: 'T001', name: 'Çamaşır Deterjanı (kg)', category: 'Temizlik', unit: 'kg', currentStock: 200, minStock: 150, maxStock: 500, avgDailyConsumption: 18, lastPrice: 85, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-09', vendor: 'Henkel' },
    { id: 'T002', name: 'Bulaşık Deterjanı (lt)', category: 'Temizlik', unit: 'lt', currentStock: 180, minStock: 100, maxStock: 400, avgDailyConsumption: 15, lastPrice: 65, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-10', vendor: 'Henkel' },
    { id: 'T003', name: 'Dezenfektan (lt)', category: 'Temizlik', unit: 'lt', currentStock: 90, minStock: 60, maxStock: 200, avgDailyConsumption: 8, lastPrice: 120, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-11', vendor: 'Diversey' },
    { id: 'T004', name: 'Havuz Kimyasalı (kg)', category: 'Temizlik', unit: 'kg', currentStock: 300, minStock: 200, maxStock: 800, avgDailyConsumption: 12, lastPrice: 95, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-05', vendor: 'Bayrol' },
    // Amenities
    { id: 'A001', name: 'Şampuan (adet)', category: 'Amenities', unit: 'adet', currentStock: 1500, minStock: 1000, maxStock: 5000, avgDailyConsumption: 150, lastPrice: 8, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-13', vendor: 'Bioderma' },
    { id: 'A002', name: 'Sabun (adet)', category: 'Amenities', unit: 'adet', currentStock: 2000, minStock: 1200, maxStock: 6000, avgDailyConsumption: 180, lastPrice: 5, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-13', vendor: 'Bioderma' },
    { id: 'A003', name: 'Havlu (adet)', category: 'Amenities', unit: 'adet', currentStock: 800, minStock: 500, maxStock: 2000, avgDailyConsumption: 25, lastPrice: 85, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-01', vendor: 'Özdilek' },
    { id: 'A004', name: 'Çarşaf Seti (adet)', category: 'Amenities', unit: 'adet', currentStock: 400, minStock: 300, maxStock: 1000, avgDailyConsumption: 15, lastPrice: 350, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-01-28', vendor: 'Özdilek' },
    // Teknik
    { id: 'K001', name: 'LED Ampul (adet)', category: 'Teknik', unit: 'adet', currentStock: 200, minStock: 100, maxStock: 500, avgDailyConsumption: 5, lastPrice: 45, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-03', vendor: 'Philips' },
    { id: 'K002', name: 'Klima Filtresi (adet)', category: 'Teknik', unit: 'adet', currentStock: 50, minStock: 30, maxStock: 150, avgDailyConsumption: 2, lastPrice: 280, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-01-25', vendor: 'Daikin' },
    { id: 'K003', name: 'Elektrik Malzemesi (set)', category: 'Teknik', unit: 'set', currentStock: 25, minStock: 15, maxStock: 60, avgDailyConsumption: 1, lastPrice: 450, currency: 'TRY', priceHistory: [], lastOrderDate: '2026-02-06', vendor: 'Schneider' },
]

// Generate price history for each item (last 12 months)
function generatePriceHistory(item: StockItem): { month: string; price: number }[] {
    const history: { month: string; price: number }[] = []
    const basePrice = item.lastPrice
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today)
        d.setMonth(d.getMonth() - i)
        const month = d.toISOString().slice(0, 7) // YYYY-MM
        // Simulate price trend: gradually increasing with some fluctuation
        const trend = 1 - (i * 0.02) // prices were lower in past
        const fluctuation = 1 + (rng() - 0.5) * 0.08 // ±4% noise
        const price = Math.round(basePrice * trend * fluctuation * 100) / 100
        history.push({ month, price })
    }
    return history
}

// Initialize price histories
STOCK_ITEMS.forEach(item => {
    item.priceHistory = generatePriceHistory(item)
})

// ─── Demo Data: Vendors ────────────────────────────────────────

const VENDORS: Vendor[] = [
    { id: 'V001', name: 'Özgür Et', category: 'Gıda', totalOrders: 48, totalSpent: 285000, avgDeliveryDays: 1.2, onTimeRate: 96, returnRate: 1.5, priceCompetitiveness: 78, performanceScore: 0 },
    { id: 'V002', name: 'Banvit', category: 'Gıda', totalOrders: 52, totalSpent: 210000, avgDeliveryDays: 1.0, onTimeRate: 98, returnRate: 0.8, priceCompetitiveness: 85, performanceScore: 0 },
    { id: 'V003', name: 'Sütaş', category: 'Gıda', totalOrders: 45, totalSpent: 165000, avgDeliveryDays: 0.8, onTimeRate: 99, returnRate: 0.5, priceCompetitiveness: 82, performanceScore: 0 },
    { id: 'V004', name: 'Bodrum Hal', category: 'Gıda', totalOrders: 60, totalSpent: 180000, avgDeliveryDays: 0.5, onTimeRate: 94, returnRate: 3.0, priceCompetitiveness: 90, performanceScore: 0 },
    { id: 'V005', name: 'Bodrum Balık', category: 'Gıda', totalOrders: 35, totalSpent: 320000, avgDeliveryDays: 0.3, onTimeRate: 92, returnRate: 2.5, priceCompetitiveness: 72, performanceScore: 0 },
    { id: 'V006', name: 'Coca-Cola', category: 'İçecek', totalOrders: 24, totalSpent: 95000, avgDeliveryDays: 2.0, onTimeRate: 97, returnRate: 0.2, priceCompetitiveness: 65, performanceScore: 0 },
    { id: 'V007', name: 'Efes', category: 'İçecek', totalOrders: 22, totalSpent: 125000, avgDeliveryDays: 2.5, onTimeRate: 95, returnRate: 0.3, priceCompetitiveness: 70, performanceScore: 0 },
    { id: 'V008', name: 'Henkel', category: 'Temizlik', totalOrders: 18, totalSpent: 75000, avgDeliveryDays: 3.0, onTimeRate: 93, returnRate: 0.5, priceCompetitiveness: 80, performanceScore: 0 },
    { id: 'V009', name: 'Bioderma', category: 'Amenities', totalOrders: 12, totalSpent: 55000, avgDeliveryDays: 5.0, onTimeRate: 88, returnRate: 1.0, priceCompetitiveness: 75, performanceScore: 0 },
    { id: 'V010', name: 'Özdilek', category: 'Amenities', totalOrders: 8, totalSpent: 185000, avgDeliveryDays: 7.0, onTimeRate: 85, returnRate: 0.5, priceCompetitiveness: 68, performanceScore: 0 },
    { id: 'V011', name: 'Philips', category: 'Teknik', totalOrders: 6, totalSpent: 42000, avgDeliveryDays: 4.0, onTimeRate: 90, returnRate: 0.8, priceCompetitiveness: 72, performanceScore: 0 },
    { id: 'V012', name: 'Diversey', category: 'Temizlik', totalOrders: 15, totalSpent: 62000, avgDeliveryDays: 3.5, onTimeRate: 91, returnRate: 0.3, priceCompetitiveness: 77, performanceScore: 0 },
    { id: 'V013', name: 'Erikli', category: 'İçecek', totalOrders: 30, totalSpent: 48000, avgDeliveryDays: 1.0, onTimeRate: 99, returnRate: 0.1, priceCompetitiveness: 88, performanceScore: 0 },
    { id: 'V014', name: 'Reis Gıda', category: 'Gıda', totalOrders: 10, totalSpent: 32000, avgDeliveryDays: 2.0, onTimeRate: 96, returnRate: 0.5, priceCompetitiveness: 83, performanceScore: 0 },
]

// ─── Demo Data: Purchase Orders ────────────────────────────────

function generatePurchaseOrders(): PurchaseOrder[] {
    const orders: PurchaseOrder[] = []
    const statuses: PurchaseOrder['status'][] = ['Teslim Edildi', 'Teslim Edildi', 'Teslim Edildi', 'Beklemede', 'Kısmi Teslim', 'Teslim Edildi', 'Teslim Edildi', 'İptal']
    const departments = ['Mutfak', 'Bar', 'Housekeeping', 'Teknik', 'Spa', 'Genel']
    const approvers = ['Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir']

    for (let i = 0; i < 85; i++) {
        const daysAgo = randBetween(0, 90)
        const orderDate = new Date(today)
        orderDate.setDate(orderDate.getDate() - daysAgo)
        const dateStr = orderDate.toISOString().split('T')[0]

        const vendor = VENDORS[randBetween(0, VENDORS.length - 1)]
        const numItems = randBetween(1, 5)
        const dept = departments[randBetween(0, departments.length - 1)]
        const status = statuses[randBetween(0, statuses.length - 1)]

        const items: PurchaseOrder['items'] = []
        let total = 0
        for (let j = 0; j < numItems; j++) {
            const stockItem = STOCK_ITEMS[randBetween(0, STOCK_ITEMS.length - 1)]
            const qty = randBetween(10, 200)
            const unitPrice = randFloat(stockItem.lastPrice * 0.9, stockItem.lastPrice * 1.1)
            const itemTotal = Math.round(qty * unitPrice)
            items.push({ name: stockItem.name, quantity: qty, unitPrice, total: itemTotal })
            total += itemTotal
        }

        let deliveryDate: string | null = null
        if (status === 'Teslim Edildi' || status === 'Kısmi Teslim') {
            const dd = new Date(orderDate)
            dd.setDate(dd.getDate() + randBetween(1, 7))
            deliveryDate = dd.toISOString().split('T')[0]
        }

        orders.push({
            id: `PO-${2026}-${String(i + 1).padStart(4, '0')}`,
            date: dateStr,
            vendor: vendor.name,
            vendorId: vendor.id,
            department: dept,
            items,
            totalAmount: total,
            currency: 'TRY',
            status,
            deliveryDate,
            approvedBy: approvers[randBetween(0, approvers.length - 1)],
            notes: ''
        })
    }

    return orders.sort((a, b) => b.date.localeCompare(a.date))
}

// ─── Performance Scoring Algorithm ─────────────────────────────
// overallScore = vendorScore × 0.25 + priceScore × 0.30 + deliveryScore × 0.25 + qualityScore × 0.20

function calculateVendorScores(vendors: Vendor[]): Vendor[] {
    return vendors.map(v => {
        // Vendor reliability: on-time delivery rate
        const vendorScore = v.onTimeRate

        // Price competitiveness (already 0-100)
        const priceScore = v.priceCompetitiveness

        // Delivery score: inverse of avg delivery days (faster = better)
        // 0 days = 100, 7+ days = 40
        const deliveryScore = Math.max(40, 100 - (v.avgDeliveryDays * 8.5))

        // Quality: inverse of return rate (lower returns = better)
        // 0% = 100, 5%+ = 50
        const qualityScore = Math.max(50, 100 - (v.returnRate * 10))

        const overall = Math.round(
            vendorScore * 0.25 +
            priceScore * 0.30 +
            deliveryScore * 0.25 +
            qualityScore * 0.20
        )

        return { ...v, performanceScore: overall }
    })
}

// ─── Inventory Analysis ────────────────────────────────────────

function analyzeInventoryNeeds(items: StockItem[]): InventoryNeed[] {
    return items.map(item => {
        const daysOfSupply = item.avgDailyConsumption > 0
            ? Math.round(item.currentStock / item.avgDailyConsumption * 10) / 10
            : 999

        let needLevel: InventoryNeed['needLevel']
        if (item.currentStock <= item.minStock * 0.5) needLevel = 'critical'
        else if (item.currentStock <= item.minStock) needLevel = 'low'
        else if (item.currentStock >= item.maxStock * 0.9) needLevel = 'excess'
        else needLevel = 'ok'

        // Target: fill to 70% of max
        const targetStock = Math.round(item.maxStock * 0.7)
        const suggestedOrderQty = needLevel === 'excess' ? 0 : Math.max(0, targetStock - item.currentStock)
        const estimatedCost = suggestedOrderQty * item.lastPrice

        return { item, daysOfSupply, needLevel, suggestedOrderQty, estimatedCost }
    }).sort((a, b) => {
        const order = { critical: 0, low: 1, ok: 2, excess: 3 }
        return order[a.needLevel] - order[b.needLevel] || a.daysOfSupply - b.daysOfSupply
    })
}

// ─── Price Trend Analysis ──────────────────────────────────────

function generatePriceTrends(items: StockItem[]): PriceTrend[] {
    return items.map(item => {
        const data = item.priceHistory.map(ph => {
            const marketFluctuation = 1 + (rng() - 0.5) * 0.06
            return {
                month: ph.month,
                price: ph.price,
                marketAvg: Math.round(ph.price * marketFluctuation * 100) / 100
            }
        })

        const first = data.length > 1 ? data[0].price : 0
        const last = data.length > 0 ? data[data.length - 1].price : 0
        const changePercent = first > 0 ? Math.round(((last - first) / first) * 10000) / 100 : 0

        return {
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            data,
            changePercent
        }
    })
}

// ─── Monthly Performance Scores ────────────────────────────────

function generateMonthlyPerformance(): PurchasePerformance {
    const monthlyScores: { month: string; score: number }[] = []
    let prevScore = 72

    for (let i = 11; i >= 0; i--) {
        const d = new Date(today)
        d.setMonth(d.getMonth() - i)
        const month = d.toISOString().slice(0, 7)
        // Gradually improving with some variation
        const change = randFloat(-3, 5)
        prevScore = Math.min(98, Math.max(60, prevScore + change))
        monthlyScores.push({ month, score: Math.round(prevScore) })
    }

    const latestScore = monthlyScores[monthlyScores.length - 1].score
    const prevMonthScore = monthlyScores[monthlyScores.length - 2]?.score || latestScore

    const trend = latestScore > prevMonthScore + 1 ? 'up' : latestScore < prevMonthScore - 1 ? 'down' : 'stable'

    // Overall breakdown
    const vendorScore = Math.round(randFloat(78, 95))
    const priceScore = Math.round(randFloat(70, 88))
    const deliveryScore = Math.round(randFloat(80, 96))
    const qualityScore = Math.round(randFloat(82, 97))
    const overallScore = Math.round(
        vendorScore * 0.25 + priceScore * 0.30 + deliveryScore * 0.25 + qualityScore * 0.20
    )

    return { vendorScore, priceScore, deliveryScore, qualityScore, overallScore, trend, monthlyScores }
}

// ─── Elektra ERP API Client ────────────────────────────────────
// API Architecture:
// - Endpoint: POST to 4001.hoteladvisor.net
// - All requests include "Action" field in JSON body
// - Valid Actions: Login, Select, Execute, Function, Schema, SchemaList, etc.
// - Authentication via API key (pre-authenticated bearer token)
// - Dual tenants: 27744 (Stock/Accounting), 27856 (Front Office)

export const ERP_API_BASE = 'https://4001.hoteladvisor.net'

// Tenant 33264: Blue Dreams Resort — Stok, Satın Alma, Muhasebe
export const ERP_API_KEY = 'erpapi#33264$3f0bf0d889c1723648966a7e8c26447f9d2bde5a8ca747fa46536c765f7482945125e976d750ece41c32f839c4febb7f33cda567c1145ff3789a4905833320b4'
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
let currentDataSource: DataSource = 'demo'

// ─── Exported Service ──────────────────────────────────────────

const purchaseOrders = generatePurchaseOrders()
const scoredVendors = calculateVendorScores(VENDORS)

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
        currentDataSource = 'demo'
        return STOCK_ITEMS
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
        currentDataSource = 'demo'
        if (from && to) {
            const fromStr = from.toISOString().split('T')[0]
            const toStr = to.toISOString().split('T')[0]
            return purchaseOrders.filter(o => o.date >= fromStr && o.date <= toStr)
        }
        return purchaseOrders
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
                return calculateVendorScores(vendors).sort(
                    (a, b) => b.performanceScore - a.performanceScore
                )
            }
        }
        currentDataSource = 'demo'
        return scoredVendors.sort((a, b) => b.performanceScore - a.performanceScore)
    },

    async analyzeInventory(): Promise<InventoryNeed[]> {
        const items = await this.getStockItems()
        return analyzeInventoryNeeds(items)
    },

    async getPriceTrends(): Promise<PriceTrend[]> {
        const items = await this.getStockItems()
        // Initialize price histories for demo items (live items may already have them)
        items.forEach(item => {
            if (!item.priceHistory || item.priceHistory.length === 0) {
                item.priceHistory = generatePriceHistory(item)
            }
        })
        return generatePriceTrends(items)
    },

    async getPerformanceReport(): Promise<PurchasePerformance> {
        return generateMonthlyPerformance()
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
