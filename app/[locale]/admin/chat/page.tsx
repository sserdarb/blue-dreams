import { getActiveSessions } from '@/app/actions/chat'
import { AdminChatCard } from '@/components/admin/AdminChatCard'

export const dynamic = 'force-dynamic'

export default async function AdminChatPage() {
  const sessions = await getActiveSessions()

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Blue Concierge Console</h2>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto">
        {sessions.map(session => (
          <AdminChatCard key={session.id} session={session} />
        ))}
        {sessions.length === 0 && <p className="text-gray-500">No active sessions.</p>}
      </div>
    </div>
  )
}
