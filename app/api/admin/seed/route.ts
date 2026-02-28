import { NextResponse } from 'next/server';
import { seedStaticMenusToDb } from '@/app/actions/seed-menus';

export async function GET() {
    try {
        const result = await seedStaticMenusToDb();
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
