'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
    MessageSquare,
    Star,
    Clock,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Bot
} from 'lucide-react'
import type { GuestReview } from '@/lib/services/elektra'

interface ReviewsClientProps {
    initialReviews: GuestReview[]
    metrics: {
        total: number
        replied: number
        pending: number
        responseRate: number
        avgResponseTimeHours: number
    }
}

export default function ReviewsClient({ initialReviews, metrics }: ReviewsClientProps) {
    const [reviews, setReviews] = useState<GuestReview[]>(initialReviews)
    const [filterSource, setFilterSource] = useState<string>('All')
    const [filterStatus, setFilterStatus] = useState<string>('All')
    const [analyzing, setAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState<string | null>(null)

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            if (filterSource !== 'All' && r.source !== filterSource) return false
            if (filterStatus !== 'All' && r.status !== filterStatus) return false
            return true
        })
    }, [reviews, filterSource, filterStatus])

    const handleAIAnalysis = async () => {
        setAnalyzing(true)
        try {
            // Call AI interpret API
            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetId: 'guest-reviews',
                    data: filteredReviews.slice(0, 50), // Send top 50 filtered reviews
                    locale: 'tr' // Default or dynamic
                })
            })
            const data = await res.json()
            setAnalysisResult(data.analysis)
        } catch (error) {
            console.error('AI Analysis failed:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Total Reviews</p>
                            <h3 className="text-2xl font-bold">{metrics.total}</h3>
                        </div>
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Response Rate</p>
                            <h3 className="text-2xl font-bold">{metrics.responseRate}%</h3>
                        </div>
                        <div className={`h-2 w-full mt-2 bg-slate-600 rounded-full overflow-hidden`}>
                            <div
                                className={`h-full ${metrics.responseRate > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${metrics.responseRate}%` }}
                            />
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Avg Response Time</p>
                            <h3 className="text-2xl font-bold">{metrics.avgResponseTimeHours}h</h3>
                        </div>
                        <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                </Card>
                <Card className="p-4 bg-slate-800 border-slate-700 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-slate-400">Avg Rating</p>
                            <div className="flex items-center gap-1">
                                <h3 className="text-2xl font-bold">
                                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                                </h3>
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
                <div className="flex gap-2 items-center">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="bg-slate-800 border-slate-700 text-white rounded px-2 py-1 text-sm"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                    >
                        <option value="All">All Sources</option>
                        <option value="Google">Google</option>
                        <option value="Booking.com">Booking.com</option>
                        <option value="TripAdvisor">TripAdvisor</option>
                    </select>
                    <select
                        className="bg-slate-800 border-slate-700 text-white rounded px-2 py-1 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="replied">Replied</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <Button
                    onClick={handleAIAnalysis}
                    disabled={analyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    <Bot className="mr-2 h-4 w-4" />
                    {analyzing ? 'Analyzing...' : 'AI SWOT Analysis'}
                </Button>
            </div>

            {/* AI Result */}
            {analysisResult && (
                <Card className="p-6 bg-slate-800/50 border-purple-500/30 text-slate-200">
                    <h4 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                        <Bot className="h-5 w-5" /> AI Analysis
                    </h4>
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-line">{analysisResult}</p>
                    </div>
                </Card>
            )}

            {/* Reviews Table */}
            <div className="rounded-md border border-slate-800 bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="text-slate-400">Date</TableHead>
                            <TableHead className="text-slate-400">Guest / Room</TableHead>
                            <TableHead className="text-slate-400">Rating</TableHead>
                            <TableHead className="text-slate-400">Comment</TableHead>
                            <TableHead className="text-slate-400">Source</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReviews.map((review) => (
                            <TableRow key={review.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="text-slate-300 font-medium">
                                    {review.date}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    <div className="font-semibold">{review.guestName}</div>
                                    <div className="text-xs text-slate-500">Room {review.roomNumber}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`${review.rating >= 9 ? 'border-green-500 text-green-500' :
                                            review.rating >= 7 ? 'border-yellow-500 text-yellow-500' :
                                                'border-red-500 text-red-500'
                                        }`}>
                                        {review.rating}/10
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-300 max-w-md">
                                    <p className="truncate text-sm" title={review.comment}>{review.comment}</p>
                                    {review.reply && (
                                        <p className="text-xs text-blue-400 mt-1 truncate">↩ {review.reply}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                        {review.source}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${review.status === 'replied' ? 'bg-green-900/50 text-green-400 hover:bg-green-900/70' :
                                            'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/70'
                                        }`}>
                                        {review.status === 'replied' ? 'Replied' : 'Pending'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
