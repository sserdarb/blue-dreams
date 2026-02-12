'use client';

import { Globe, Clock, Smartphone, Monitor } from 'lucide-react';

const visitors = [
    { id: 1, country: 'Germany', city: 'Berlin', device: 'mobile', time: '2m ago' },
    { id: 2, country: 'United Kingdom', city: 'London', device: 'desktop', time: '5m ago' },
    { id: 3, country: 'Turkey', city: 'Istanbul', device: 'mobile', time: '12m ago' },
    { id: 4, country: 'Russia', city: 'Moscow', device: 'desktop', time: '18m ago' },
    { id: 5, country: 'Netherlands', city: 'Amsterdam', device: 'mobile', time: '24m ago' },
];

export function RecentVisitors() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    <Globe className="text-cyan-500" size={18} />
                    Recent Visitors
                </h3>
                <span className="text-xs font-mono text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full animate-pulse">
                    ● Live
                </span>
            </div>

            <div className="divide-y dark:divide-slate-700">
                {visitors.map((v) => (
                    <div key={v.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                {v.country.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{v.city}, {v.country}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    {v.device === 'mobile' ? <Smartphone size={10} /> : <Monitor size={10} />}
                                    {v.device}
                                </p>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {v.time}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
