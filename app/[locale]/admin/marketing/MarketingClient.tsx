'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight, DollarSign, Target, MousePointer, Eye } from 'lucide-react'
import type { AdCampaign, MarketingOverview } from '@/lib/services/marketing'

interface MarketingClientProps {
    overview: MarketingOverview
    campaigns: AdCampaign[]
}

export default function MarketingClient({ overview, campaigns }: MarketingClientProps) {

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Total Spend</p>
                            <h3 className="text-2xl font-bold">€{overview.totalSpend.toLocaleString()}</h3>
                        </div>
                        <DollarSign className="h-5 w-5 text-red-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Total Revenue</p>
                            <h3 className="text-2xl font-bold">€{overview.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <Target className="h-5 w-5 text-green-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">ROAS</p>
                            <h3 className={`text-2xl font-bold ${overview.totalROAS >= 4 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {overview.totalROAS.toFixed(1)}x
                            </h3>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-blue-400" />
                    </div>
                </Card>
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {overview.platformBreakdown.map(p => (
                    <Card key={p.platform} className="p-4 bg-slate-900 border-slate-800 text-white">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{p.platform}</h4>
                            <Badge variant="outline">{p.roas.toFixed(1)}x ROAS</Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Spend</span>
                                <span>€{p.spend.toLocaleString()}</span>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${(p.spend / overview.totalSpend) * 100}%` }}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Campaigns Table */}
            <div className="rounded-md border border-slate-800 bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Campaign</TableHead>
                            <TableHead className="text-slate-400">Platform</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Spend</TableHead>
                            <TableHead className="text-right text-slate-400">Roas</TableHead>
                            <TableHead className="text-right text-slate-400">Conv.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((c) => (
                            <TableRow key={c.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="text-slate-300 font-medium">
                                    {c.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-slate-400 border-slate-700">
                                        {c.platform}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${c.status === 'active' ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70' :
                                            'bg-slate-800 text-slate-400 hover:bg-slate-800'
                                        }`}>
                                        {c.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-slate-300">
                                    €{c.spend.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className={`${c.roas >= 5 ? 'text-green-400' : c.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {c.roas.toFixed(1)}x
                                    </span>
                                </TableCell>
                                <TableCell className="text-right text-slate-300">
                                    {c.conversions}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
