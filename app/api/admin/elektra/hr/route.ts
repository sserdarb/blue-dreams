import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'employees' | 'attendance' | 'requests'

        switch (type) {
            case 'employees': {
                const employees = await ElektraService.fetchEmployees()
                return NextResponse.json({ success: true, data: employees })
            }
            case 'attendance': {
                const start = searchParams.get('start') || undefined
                const end = searchParams.get('end') || undefined
                const logs = await ElektraService.fetchAttendanceLogs(start, end)
                return NextResponse.json({ success: true, data: logs })
            }
            case 'requests': {
                const requests = await ElektraService.fetchHRRequests()
                return NextResponse.json({ success: true, data: requests })
            }
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid HR type specified. Use ?type=employees, attendance, or requests.' },
                    { status: 400 }
                )
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
