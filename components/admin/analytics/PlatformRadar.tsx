'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';

const data = [
    { subject: 'Reach', A: 120, B: 110, fullMark: 150 },
    { subject: 'Conversion', A: 98, B: 130, fullMark: 150 },
    { subject: 'Retention', A: 86, B: 130, fullMark: 150 },
    { subject: 'Stickiness', A: 99, B: 100, fullMark: 150 },
    { subject: 'Engagement', A: 85, B: 90, fullMark: 150 },
    { subject: 'Revenue', A: 65, B: 85, fullMark: 150 },
];

export function PlatformRadar() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Platform Synergy</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="GA4"
                        dataKey="A"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.3}
                    />
                    <Radar
                        name="Elektraweb"
                        dataKey="B"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b' }}
                    />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
