'use client';

import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getAdminTranslations, AdminLocale } from '@/lib/admin-translations';

export function AIInsights() {
    const params = useParams();
    const locale = (params.locale as AdminLocale) || 'tr';
    const t = getAdminTranslations(locale).analyticsDashboard;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">{t.aiInsightsTitle}</h3>
            </div>

            <div className="space-y-4">
                <InsightItem
                    icon={<TrendingUp size={18} className="text-green-600" />}
                    title={t.insight1Title}
                    description={t.insight1Desc}
                />
                <InsightItem
                    icon={<AlertTriangle size={18} className="text-amber-600" />}
                    title={t.insight2Title}
                    description={t.insight2Desc}
                />
                <InsightItem
                    icon={<Lightbulb size={18} className="text-blue-600" />}
                    title={t.insight3Title}
                    description={t.insight3Desc}
                />
            </div>
        </div>
    );
}

function InsightItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-50 dark:border-indigo-900/50 shadow-sm">
            <div className="mt-0.5">{icon}</div>
            <div>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
