'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users, Briefcase, Clock, TrendingUp, Calendar, Award,
    UserCheck, UserX, Building, Search, AlertTriangle,
    Loader2, BarChart3, GraduationCap, HeartPulse, DollarSign,
    Wifi, WifiOff
} from 'lucide-react'

interface Employee {
    id: string
    firstName: string
    lastName: string
    department: string
    title: string
    hireDate: string
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
    phone: string
    email: string
    role?: string
}

interface Department {
    name: string
    employees: number
    budget: number
    manager: string
    icon: string
    color: string
}

interface HRKPIs {
    totalStaff: number
    seasonalStaff: number
    totalCost: number
    avgCostPerPerson: number
    sgkCost: number
    revenuePerEmployee: number
    staffTurnover: number
    costGrowth: number
}

interface AttendanceLog {
    id: string
    employeeId: string
    timestamp: string
    type: string
    source: string
    location?: string
}

interface HRData {
    employees: Employee[]
    attendance: AttendanceLog[]
    departments: Department[]
    kpis: HRKPIs
    dataSource: 'live' | 'demo'
}

// ── Fallback Demo Data ──
function getDemoData(): HRData {
    const departments: Department[] = [
        { name: 'Ön Büro', employees: 42, budget: 1_465_000, manager: '', icon: '🏨', color: '#3b82f6' },
        { name: 'Kat Hizmetleri', employees: 90, budget: 2_465_000, manager: '', icon: '🛏️', color: '#8b5cf6' },
        { name: 'Yiyecek & İçecek', employees: 75, budget: 2_241_000, manager: '', icon: '🍽️', color: '#10b981' },
        { name: 'Mutfak', employees: 66, budget: 2_136_000, manager: '', icon: '👨‍🍳', color: '#f59e0b' },
        { name: 'SPA & Wellness', employees: 30, budget: 932_000, manager: '', icon: '💆', color: '#ec4899' },
        { name: 'Teknik', employees: 33, budget: 1_109_000, manager: '', icon: '🔧', color: '#6366f1' },
        { name: 'Güvenlik', employees: 24, budget: 687_000, manager: '', icon: '🛡️', color: '#ef4444' },
        { name: 'Animasyon', employees: 48, budget: 1_314_000, manager: '', icon: '🎭', color: '#eab308' },
    ]
    const names = [
        'Ahmet Yılmaz', 'Fatma Kaya', 'Mustafa Demir', 'Hasan Çelik', 'Elif Aydın',
        'Ali Öztürk', 'Zeynep Arslan', 'Serdar Baran', 'Ayşe Korkmaz', 'Mehmet Şahin',
        'Merve Tekin', 'Emre Doğan', 'Selin Kurt', 'Oğuz Yıldız', 'Derya Polat'
    ]
    const employees: Employee[] = names.map((name, i) => ({
        id: `emp-${i}`,
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1] || '',
        department: departments[i % departments.length].name,
        title: i < departments.length ? 'Müdür' : ['Uzman', 'Personel', 'Stajyer'][Math.floor(Math.random() * 3)],
        hireDate: `${2020 + Math.floor(Math.random() * 5)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-01`,
        status: i < 12 ? 'ACTIVE' : (Math.random() > 0.7 ? 'ON_LEAVE' : 'ACTIVE'),
        phone: `+90 532 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 9000) + 1000)}`,
        email: `${name.split(' ')[0].toLowerCase()}@bluedreams.com`,
    }))

    return {
        employees,
        attendance: [],
        departments,
        kpis: {
            totalStaff: 408,
            seasonalStaff: 28,
            totalCost: 12_800_000,
            avgCostPerPerson: 31_373,
            sgkCost: 2_880_000,
            revenuePerEmployee: 173_611,
            staffTurnover: 18.5,
            costGrowth: 32.4,
        },
        dataSource: 'demo',
    }
}

type Tab = 'overview' | 'employees' | 'departments' | 'attendance'

export default function HRPage() {
    const [tab, setTab] = useState<Tab>('overview')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<HRData | null>(null)
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('')
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/admin/hr')
                if (res.ok) {
                    const json = await res.json()
                    // If API returns employees, use live data
                    if (json.employees && json.employees.length > 0) {
                        setData(json)
                        setIsLive(json.dataSource === 'live')
                    } else {
                        // API returned empty employees — use demo but keep departments/kpis from API
                        const demo = getDemoData()
                        setData({
                            ...demo,
                            departments: json.departments?.length > 0 ? json.departments : demo.departments,
                            kpis: json.kpis?.totalStaff > 0 ? json.kpis : demo.kpis,
                            dataSource: 'demo',
                        })
                    }
                } else {
                    setData(getDemoData())
                }
            } catch {
                setData(getDemoData())
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading || !data) return <div className="p-12 flex justify-center items-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> İK verileri yükleniyor...</div>

    const totalEmployees = data.kpis.totalStaff || data.employees.length
    const activeCount = data.employees.filter(e => e.status === 'ACTIVE').length
    const onLeaveCount = data.employees.filter(e => e.status === 'ON_LEAVE').length
    const seasonalCount = data.kpis.seasonalStaff

    const filteredEmployees = data.employees.filter(e => {
        const fullName = `${e.firstName} ${e.lastName}`.toLowerCase()
        if (search && !fullName.includes(search.toLowerCase())) return false
        if (deptFilter && e.department !== deptFilter) return false
        return true
    })

    const tabs = [
        { key: 'overview' as Tab, label: 'Genel Bakış', Icon: BarChart3 },
        { key: 'employees' as Tab, label: 'Personel Listesi', Icon: Users },
        { key: 'departments' as Tab, label: 'Departmanlar', Icon: Building },
        { key: 'attendance' as Tab, label: 'Devam Takibi', Icon: Clock },
    ]

    const formatCurrency = (v: number) => {
        if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`
        if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`
        return `₺${v.toLocaleString('tr-TR')}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-blue-500" /> İnsan Kaynakları</h1>
                    <p className="text-sm text-muted-foreground mt-1">Personel yönetimi, devam takibi ve departman performansı</p>
                </div>
                <Badge variant="outline" className={`flex items-center gap-1.5 text-xs ${isLive ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}`}>
                    {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {isLive ? 'Elektra Live' : 'Demo Veri'}
                </Badge>
            </div>

            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto">
                {tabs.map(t => {
                    const Icon = t.Icon
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            <Icon size={16} /> {t.label}
                        </button>
                    )
                })}
            </div>

            {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Toplam Personel', value: totalEmployees, Icon: Users, color: 'blue', bg: 'bg-blue-500/20', text: 'text-blue-500' },
                            { label: 'Aktif', value: activeCount || data.kpis.totalStaff - data.kpis.seasonalStaff, Icon: UserCheck, color: 'emerald', bg: 'bg-emerald-500/20', text: 'text-emerald-500' },
                            { label: 'Sezonluk', value: seasonalCount, Icon: Calendar, color: 'purple', bg: 'bg-purple-500/20', text: 'text-purple-500' },
                            { label: 'Kişi Başı Maliyet', value: formatCurrency(data.kpis.avgCostPerPerson), Icon: DollarSign, color: 'yellow', bg: 'bg-yellow-500/20', text: 'text-yellow-500' },
                            { label: 'Aylık Toplam', value: formatCurrency(data.kpis.totalCost), Icon: TrendingUp, color: 'orange', bg: 'bg-orange-500/20', text: 'text-orange-500' },
                        ].map((s, i) => {
                            const Icon = s.Icon
                            return (
                                <Card key={i} className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 ${s.bg} rounded-lg ${s.text}`}><Icon size={20} /></div>
                                        <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Building size={20} className="text-blue-500" /> Departman Dağılımı</h3>
                            <div className="space-y-3">
                                {data.departments.map(d => {
                                    const pct = totalEmployees > 0 ? Math.round((d.employees / totalEmployees) * 100) : 0
                                    return (
                                        <div key={d.name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{d.icon} {d.name}</span>
                                                <span>{d.employees} kişi ({pct}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                                                <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-purple-500" /> Performans Göstergeleri</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Personel Devir Oranı', value: `%${data.kpis.staffTurnover}`, Icon: TrendingUp },
                                    { label: 'SGK Maliyeti (Aylık)', value: formatCurrency(data.kpis.sgkCost), Icon: DollarSign },
                                    { label: 'Kişi Başı Gelir', value: formatCurrency(data.kpis.revenuePerEmployee), Icon: BarChart3 },
                                    { label: 'Maliyet Artışı (YoY)', value: `%${data.kpis.costGrowth}`, Icon: AlertTriangle },
                                    { label: 'Oda/Personel Oranı', value: `${(totalEmployees / 341).toFixed(1)}`, Icon: Building },
                                ].map((item, i) => {
                                    const Icon = item.Icon
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800">
                                            <div className="flex items-center gap-2 text-sm"><Icon size={16} className="text-muted-foreground" /> {item.label}</div>
                                            <span className="font-semibold text-sm">{item.value}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {tab === 'employees' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input className="w-full pl-9 pr-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                placeholder="Personel ara..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="border dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                            <option value="">Tüm Departmanlar</option>
                            {data.departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                        <Badge variant="outline" className="text-xs">{filteredEmployees.length} personel</Badge>
                    </div>
                    {data.employees.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            <Users size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium mb-2">Personel verisi bulunamadı</p>
                            <p className="text-sm">Elektra İK modülü henüz personel verisi dönmüyor. API bağlantısı aktifleştirildiğinde personel listesi burada görüntülenecektir.</p>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800/50 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Ad Soyad</th>
                                            <th className="p-3 text-left">Departman</th>
                                            <th className="p-3 text-left">Pozisyon</th>
                                            <th className="p-3 text-left">Başlangıç</th>
                                            <th className="p-3 text-center">Durum</th>
                                            <th className="p-3 text-left">İletişim</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map(e => (
                                            <tr key={e.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                                <td className="p-3 font-medium">{e.firstName} {e.lastName}</td>
                                                <td className="p-3">{e.department}</td>
                                                <td className="p-3">{e.title}</td>
                                                <td className="p-3 text-xs">{e.hireDate ? new Date(e.hireDate).toLocaleDateString('tr') : '—'}</td>
                                                <td className="p-3 text-center">
                                                    <Badge variant={e.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                        className={e.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : e.status === 'ON_LEAVE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                                                        {e.status === 'ACTIVE' ? 'Aktif' : e.status === 'ON_LEAVE' ? 'İzinde' : 'Pasif'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-xs"><div>{e.email}</div>{e.phone && <div className="text-muted-foreground">{e.phone}</div>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {tab === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.departments.map(d => (
                        <Card key={d.name} className="p-5 hover:shadow-md transition">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${d.color}20` }}>
                                    {d.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{d.name}</h3>
                                    {d.manager && <p className="text-xs text-muted-foreground">Yönetici: {d.manager}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold">{d.employees}</p>
                                    <p className="text-xs text-muted-foreground">Personel</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                                    <p className="text-xl font-bold">{formatCurrency(d.budget)}</p>
                                    <p className="text-xs text-muted-foreground">Aylık Bütçe</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {tab === 'attendance' && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-500" /> Devam Takibi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-emerald-600">{data.kpis.totalStaff - data.kpis.seasonalStaff}</p>
                            <p className="text-sm text-muted-foreground">Kadrolu Personel</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-600">{data.kpis.seasonalStaff}</p>
                            <p className="text-sm text-muted-foreground">Sezonluk Personel</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{data.kpis.totalStaff}</p>
                            <p className="text-sm text-muted-foreground">Toplam</p>
                        </div>
                    </div>
                    {data.attendance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800/50 border-b">
                                    <tr>
                                        <th className="p-3 text-left">Personel ID</th>
                                        <th className="p-3 text-left">Zaman</th>
                                        <th className="p-3 text-left">Tür</th>
                                        <th className="p-3 text-left">Kaynak</th>
                                        <th className="p-3 text-left">Konum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.attendance.slice(0, 50).map(log => (
                                        <tr key={log.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                                            <td className="p-3">{log.employeeId}</td>
                                            <td className="p-3 text-xs">{log.timestamp ? new Date(log.timestamp).toLocaleString('tr') : '—'}</td>
                                            <td className="p-3">
                                                <Badge variant="outline" className="text-xs">
                                                    {log.type === 'CHECK_IN' ? 'Giriş' : log.type === 'CHECK_OUT' ? 'Çıkış' : log.type}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-xs">{log.source}</td>
                                            <td className="p-3 text-xs">{log.location || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">
                            📌 Devam takibi verileri Elektra PDKS modülü aktif olduğunda burada görüntülenecektir.
                        </p>
                    )}
                </Card>
            )}
        </div>
    )
}
