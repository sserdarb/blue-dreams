'use client'

import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import type { GuestReview } from '@/lib/services/elektra'

// ─── Color Palette (matches site dark theme) ───
const COLORS = {
    primary: '#06b6d4',    // cyan-500
    accent: '#10b981',     // emerald-500
    warning: '#f59e0b',    // amber-500
    danger: '#ef4444',     // red-500
    purple: '#8b5cf6',     // violet-500
    pink: '#ec4899',       // pink-500
    blue: '#3b82f6',       // blue-500
    slate: '#64748b',      // slate-500
}

const SOURCE_COLORS: Record<string, string> = {
    'Google': '#4285f4',
    'Booking.com': '#003580',
    'TripAdvisor': '#34e0a1',
    'Survey': '#f59e0b',
    'Direct': '#8b5cf6',
}

const SENTIMENT_COLORS = {
    positive: '#10b981',
    neutral: '#f59e0b',
    negative: '#ef4444',
}

// ─── Common Tooltip Style ───
const tooltipStyle = {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
    borderRadius: 12,
    fontSize: 13,
}

// ─── Topic Keywords for extraction ───
const POSITIVE_KEYWORDS: Record<string, string[]> = {
    'Personel': ['personel', 'staff', 'personal', 'ekip', 'ilgili', 'güler yüzlü', 'friendly', 'freundlich'],
    'Temizlik': ['temiz', 'clean', 'kusursuz', 'sauber', 'чисто', 'bakımlı'],
    'Yemek': ['yemek', 'food', 'lezzetli', 'büfe', 'essen', 'restaurant', 'dining', 'еда'],
    'Havuz': ['havuz', 'pool', 'schwimmbad', 'бассейн'],
    'Plaj': ['plaj', 'beach', 'deniz', 'strand', 'пляж', 'sea'],
    'Spa': ['spa', 'wellness', 'massage', 'hamam'],
    'Manzara': ['manzara', 'view', 'aussicht', 'вид', 'nefes'],
    'Animasyon': ['animasyon', 'animation', 'etkinlik', 'aktivität', 'entertainment'],
    'All-Inclusive': ['all-inclusive', 'all inclusive', 'herşey dahil', 'ultra'],
}

const NEGATIVE_KEYWORDS: Record<string, string[]> = {
    'Klima/Isıtma': ['klima', 'sıcak', 'soğuk', 'ac', 'heating', 'cooling', 'klimaanlage'],
    'Gürültü': ['gürültü', 'noise', 'uyuyamadık', 'laut', 'шум'],
    'Temizlik': ['leke', 'kirli', 'dirty', 'stain', 'lekeliydi', 'грязно'],
    'WiFi': ['wifi', 'internet', 'zayıf', 'slow'],
    'Check-in': ['check-in', 'bekleme', 'waited', 'slow', 'kuyruk'],
    'Oda Durumu': ['renovasyon', 'eski', 'old', 'renovation', 'küçük', 'small'],
    'Yemek Kalitesi': ['quality', 'below expectations', 'çeşitlilik', 'variety', 'fena'],
    'Kalabalık': ['kalabalık', 'crowded', 'überfüllt', 'dolu'],
}

function extractTopics(reviews: GuestReview[], keywordMap: Record<string, string[]>): { topic: string; count: number }[] {
    const counts: Record<string, number> = {}
    for (const r of reviews) {
        const text = r.comment.toLowerCase()
        for (const [topic, keywords] of Object.entries(keywordMap)) {
            if (keywords.some(kw => text.includes(kw))) {
                counts[topic] = (counts[topic] || 0) + 1
            }
        }
    }
    return Object.entries(counts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
}

// ─── 1. Comment Count Over Time ───
export function CommentCountChart({ reviews }: { reviews: GuestReview[] }) {
    // Group by month
    const byMonth: Record<string, number> = {}
    reviews.forEach(r => {
        const m = r.date.slice(0, 7) // YYYY-MM
        byMonth[m] = (byMonth[m] || 0) + 1
    })
    const data = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
            month: month.slice(5), // MM
            count,
        }))

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.primary, r: 5 }}
                        activeDot={{ r: 7, fill: COLORS.primary }}
                        name="Yorum Sayısı"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

// ─── 2. Sentiment/Score Trend Over Time ───
export function SentimentTrendChart({ reviews }: { reviews: GuestReview[] }) {
    const byMonth: Record<string, { total: number; count: number; pos: number; neu: number; neg: number }> = {}
    reviews.forEach(r => {
        const m = r.date.slice(0, 7)
        if (!byMonth[m]) byMonth[m] = { total: 0, count: 0, pos: 0, neu: 0, neg: 0 }
        byMonth[m].total += r.rating
        byMonth[m].count += 1
        if (r.sentiment === 'positive') byMonth[m].pos++
        else if (r.sentiment === 'neutral') byMonth[m].neu++
        else byMonth[m].neg++
    })

    const data = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
            month: month.slice(5),
            avgRating: +(d.total / d.count).toFixed(1),
            positive: d.pos,
            neutral: d.neu,
            negative: d.neg,
        }))

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.6} />
                            <stop offset="95%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="avgRating" stroke={COLORS.accent} fill="url(#gradPos)" strokeWidth={3} name="Ort. Puan" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ─── 3. Mecra (Platform/Channel) Distribution ───
export function MecraDistributionChart({ reviews }: { reviews: GuestReview[] }) {
    const bySource: Record<string, number> = {}
    reviews.forEach(r => {
        bySource[r.source] = (bySource[r.source] || 0) + 1
    })
    const total = reviews.length || 1

    const data = Object.entries(bySource)
        .map(([name, value]) => ({
            name,
            value,
            percent: ((value / total) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value)

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-[220px] w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={SOURCE_COLORS[entry.name] || COLORS.slate} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-default">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[d.name] || COLORS.slate }} />
                            <span className="text-sm text-slate-300 font-medium">{d.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-bold text-white">{d.value}</span>
                            <span className="text-xs text-slate-500 ml-2">({d.percent}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── 4. Most Successful Topics ───
export function TopTopicsChart({ reviews }: { reviews: GuestReview[] }) {
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive' || r.rating >= 8)
    const topics = extractTopics(positiveReviews, POSITIVE_KEYWORDS)

    if (topics.length === 0) {
        return <p className="text-slate-500 text-sm text-center py-8">Yeterli veri yok</p>
    }

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis type="category" dataKey="topic" stroke="#94a3b8" fontSize={12} width={75} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={COLORS.accent} radius={[0, 6, 6, 0]} name="Bahsedilme" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// ─── 5. Most Complained-About Topics ───
export function ComplaintTopicsChart({ reviews }: { reviews: GuestReview[] }) {
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative' || r.sentiment === 'neutral' || r.rating <= 7)
    const topics = extractTopics(negativeReviews, NEGATIVE_KEYWORDS)

    if (topics.length === 0) {
        return <p className="text-slate-500 text-sm text-center py-8">Şikayet bulunamadı</p>
    }

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis type="category" dataKey="topic" stroke="#94a3b8" fontSize={12} width={75} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={COLORS.danger} radius={[0, 6, 6, 0]} name="Şikayet" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// ─── 6. Sentiment Distribution Donut ───
export function SentimentDonutChart({ reviews }: { reviews: GuestReview[] }) {
    const counts = { positive: 0, neutral: 0, negative: 0 }
    reviews.forEach(r => { counts[r.sentiment]++ })

    const data = [
        { name: 'Pozitif', value: counts.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Nötr', value: counts.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negatif', value: counts.negative, color: SENTIMENT_COLORS.negative },
    ].filter(d => d.value > 0)

    return (
        <div className="flex items-center gap-6">
            <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                            {data.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-sm text-slate-300">{d.name}: <strong className="text-white">{d.value}</strong></span>
                    </div>
                ))}
            </div>
        </div>
    )
}
