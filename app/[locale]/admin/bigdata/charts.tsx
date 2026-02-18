'use client'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts'

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#d946ef']

export function MiniLine({ data, xKey, yKey, color = '#06b6d4', height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
}

export function DualLine({ data, xKey, y1, y2, c1 = '#06b6d4', c2 = '#f59e0b', height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend /><Line type="monotone" dataKey={y1} stroke={c1} strokeWidth={2} dot={false} /><Line type="monotone" dataKey={y2} stroke={c2} strokeWidth={2} dot={false} strokeDasharray="5 5" /></LineChart></ResponsiveContainer>
}

export function MiniBar({ data, xKey, yKey, color = '#06b6d4', height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
}

export function StackedBar({ data, xKey, keys, height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend />{keys.map((k: string, i: number) => <Bar key={k} dataKey={k} stackId="a" fill={COLORS[i % COLORS.length]} />)}</BarChart></ResponsiveContainer>
}

export function DualBar({ data, xKey, y1, y2, c1 = '#06b6d4', c2 = '#f59e0b', height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend /><Bar dataKey={y1} fill={c1} radius={[4, 4, 0, 0]} /><Bar dataKey={y2} fill={c2} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
}

export function MiniArea({ data, xKey, keys, height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend />{keys.map((k: string, i: number) => <Area key={k} type="monotone" dataKey={k} stackId="1" fill={COLORS[i % COLORS.length]} stroke={COLORS[i % COLORS.length]} fillOpacity={0.4} />)}</AreaChart></ResponsiveContainer>
}

export function MiniPie({ data, nameKey, valueKey, height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><PieChart><Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100} label={({ name, value }: any) => `${name}: ${value}`} labelLine={{ stroke: '#64748b' }}>{data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend /></PieChart></ResponsiveContainer>
}

export function DonutChart({ data, nameKey, valueKey, height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><PieChart><Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={({ name, percent }: any) => `${name} %${(percent * 100).toFixed(0)}`} labelLine={{ stroke: '#64748b' }}>{data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /></PieChart></ResponsiveContainer>
}

export function MiniScatter({ data, xKey, yKey, height = 300, label = '' }: any) {
    return <ResponsiveContainer width="100%" height={height}><ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey={xKey} name={xKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis dataKey={yKey} name={yKey} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} cursor={{ strokeDasharray: '3 3' }} /><Scatter name={label} data={data} fill="#06b6d4" /></ScatterChart></ResponsiveContainer>
}

export function ForecastChart({ data, height = 300 }: any) {
    return <ResponsiveContainer width="100%" height={height}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0' }} /><Legend /><Bar dataKey="actual" fill="#06b6d4" fillOpacity={0.6} name="Gerçek" /><Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} dot={false} name="Tahmin" strokeDasharray="5 5" /></ComposedChart></ResponsiveContainer>
}

export function HeatmapGrid({ data, xLabels, yLabels, height = 300 }: any) {
    if (!data || data.length === 0) return <div className="text-slate-400 text-sm p-4">Veri yok</div>
    const maxVal = Math.max(...data.map((c: any) => c.value), 1)
    return <div className="overflow-x-auto" style={{ maxHeight: height }}><table className="w-full text-xs"><thead><tr><th className="p-1 text-slate-400"></th>{(xLabels || [...new Set(data.map((c: any) => c.x))]).map((x: string) => <th key={x} className="p-1 text-slate-400 text-center">{x.slice(0, 3)}</th>)}</tr></thead><tbody>{(yLabels || [...new Set(data.map((c: any) => c.y))]).map((y: string) => <tr key={y}><td className="p-1 text-slate-400 whitespace-nowrap">{y}</td>{(xLabels || [...new Set(data.map((c: any) => c.x))]).map((x: string) => { const cell = data.find((c: any) => c.x === x && c.y === y); const val = cell?.value || 0; const intensity = Math.min(1, val / maxVal); return <td key={x} className="p-1 text-center rounded" style={{ background: `rgba(6, 182, 212, ${intensity * 0.8})`, color: intensity > 0.5 ? '#fff' : '#94a3b8' }}>{val > 0 ? val : ''}</td> })}</tr>)}</tbody></table></div>
}

export function DataTable({ data, columns, height = 400 }: { data: any[]; columns: { key: string; label: string; format?: (v: any) => string }[]; height?: number }) {
    return <div className="overflow-auto" style={{ maxHeight: height }}><table className="w-full text-xs"><thead className="sticky top-0 bg-slate-800"><tr>{columns.map(c => <th key={c.key} className="p-2 text-left text-slate-400 font-medium border-b border-slate-700">{c.label}</th>)}</tr></thead><tbody>{data.slice(0, 100).map((row, i) => <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30"><td className="p-2 text-slate-500">{i + 1}</td>{columns.map(c => <td key={c.key} className="p-2 text-slate-300">{c.format ? c.format(row[c.key]) : row[c.key]}</td>)}</tr>)}</tbody></table></div>
}

// Card wrapper
export function ChartCard({ title, children, span = 1 }: { title: string; children: React.ReactNode; span?: number }) {
    return <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 ${span === 2 ? 'col-span-1 lg:col-span-2' : ''}`}><h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span>{title}</h3>{children}</div>
}
