// Shared utility: checks if the current session belongs to the demo user.
// When true, ALL data sources should return mock/demo data regardless of SiteSettings.

import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

/**
 * Returns true if the currently logged-in user is the demo user.
 * All services should call this to force mock data for demo sessions.
 */
export async function isDemoSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(COOKIE_NAME)
        if (!session) return false
        const data = JSON.parse(session.value)
        return data.isDemo === true || data.role === 'demo'
    } catch {
        return false
    }
}
