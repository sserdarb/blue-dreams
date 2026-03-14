import { NextResponse } from 'next/server'
import { HRService } from '@/lib/services/hr'
import { ElektraService } from '@/lib/services/elektra'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const view = searchParams.get('view') || 'all'

        if (view === 'employees') {
            const employees = await HRService.getEmployees()
            return NextResponse.json({ employees, dataSource: HRService.dataSource })
        }

        if (view === 'attendance') {
            const startDate = searchParams.get('start') || undefined
            const endDate = searchParams.get('end') || undefined
            const logs = await HRService.getAttendanceLogs(startDate, endDate)
            return NextResponse.json({ attendance: logs, dataSource: HRService.dataSource })
        }

        if (view === 'requests') {
            const requests = await HRService.getHRRequests()
            return NextResponse.json({ requests, dataSource: HRService.dataSource })
        }

        // Default: return overview data for admin HR page
        const [employees, attendance, departments, kpis] = await Promise.all([
            HRService.getEmployees(),
            HRService.getAttendanceLogs(),
            Promise.resolve(HRService.getDepartments()),
            HRService.getKPIs(),
        ])

        return NextResponse.json({
            employees,
            attendance,
            departments: departments.map(d => ({
                name: d.name,
                employees: d.headCount + d.seasonalAdd,
                budget: Math.round(d.avgSalary * (d.headCount + d.seasonalAdd) * 1.245), // Including employer costs
                manager: '', // Will be populated from employees if available
                icon: d.icon,
                color: d.color,
            })),
            kpis,
            dataSource: HRService.dataSource,
        })
    } catch (error) {
        console.error('[HR API] Error:', error)
        return NextResponse.json(
            { error: 'İK verileri yüklenirken hata oluştu', employees: [], attendance: [], departments: [] },
            { status: 500 }
        )
    }
}
