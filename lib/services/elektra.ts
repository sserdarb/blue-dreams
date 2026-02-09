export type SalesData = {
    date: string
    web: number
    callCenter: number
    ota: number
}

export type OccupancyData = {
    date: string
    occupancy: number
    adr: number // Average Daily Rate
}

export type GuestDemographics = {
    country: string
    percentage: number
}

// Mock data generator for Elektra PMS
export const ElektraService = {
    async getSalesData(startDate: Date, endDate: Date): Promise<SalesData[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const data: SalesData[] = []
        const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)

            // Random sales data with some trends
            const baseWeb = 5000 + Math.random() * 3000
            const baseCall = 4000 + Math.random() * 2000
            const baseOta = 2000 + Math.random() * 1000

            data.push({
                date: date.toISOString().split('T')[0],
                web: Math.round(baseWeb),
                callCenter: Math.round(baseCall),
                ota: Math.round(baseOta)
            })
        }

        return data
    },

    async getChannelDistribution(): Promise<{ name: string; value: number; color: string }[]> {
        await new Promise(resolve => setTimeout(resolve, 300))
        return [
            { name: 'Web Direct', value: 45, color: '#0ea5e9' }, // Cyan
            { name: 'Call Center', value: 35, color: '#f59e0b' }, // Amber
            { name: 'OTA (Booking/Expedia)', value: 20, color: '#8b5cf6' } // Violet
        ]
    },

    async getDailyStats() {
        return {
            todayReservations: 12,
            totalRevenue: '₺245,890',
            activeVisitors: 34,
            occupancyRate: '78%',
            adr: '₺8,450'
        }
    }
}
