import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const language = searchParams.get('language') || 'TR'

        const definitions = await ElektraService.fetchTaskDefinitions(language)

        return NextResponse.json({
            success: true,
            data: definitions
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validation basic
        if (!body.taskDefinitionId || !body.location) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const taskResult = await ElektraService.createTask(body)

        return NextResponse.json({
            success: true,
            data: taskResult
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
