import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, getSession } from '@/app/actions/auth';

export async function GET(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const session = await getSession();
        const userId = session?.user?.id;

        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get('reportId');

        if (!reportId) {
            return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
        }

        // Fetch formulas for this report
        // Prefer personal formulas if they exist, otherwise fallback to global
        const formulas = await prisma.reportFormula.findMany({
            where: {
                reportId,
                OR: [
                    { isGlobal: true },
                    { userId: userId }
                ]
            }
        });

        return NextResponse.json({ success: true, formulas });
    } catch (error) {
        console.error('API /api/admin/formulas GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const session = await getSession();
        const userId = session?.user?.id;

        // Temporarily allow saving without specific userId if admin context implies it
        // In a strict app, we should enforce checking roles if they want to save isGlobal

        const body = await req.json();
        const { reportId, metricName, expression, isGlobal } = body;

        if (!reportId || !metricName || !expression) {
            return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
        }

        const isGlobalCast = Boolean(isGlobal);
        const finalUserId = isGlobalCast ? null : userId;

        // Upsert the formula
        const formula = await prisma.reportFormula.upsert({
            where: {
                reportId_metricName_userId: {
                    reportId,
                    metricName,
                    userId: finalUserId
                }
            },
            update: {
                expression,
                isGlobal: isGlobalCast
            },
            create: {
                reportId,
                metricName,
                expression,
                isGlobal: isGlobalCast,
                userId: finalUserId
            }
        });

        return NextResponse.json({ success: true, formula });
    } catch (error) {
        console.error('API /api/admin/formulas POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
