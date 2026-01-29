import { getPageById, addWidget, deleteWidget } from '@/app/actions/admin'
import { WidgetJsonEditor } from '@/components/admin/WidgetJsonEditor'

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPageById(id)

  if (!page) return <div>Page not found</div>

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Editing: {page.title} <span className="text-sm font-normal text-gray-500">({page.locale})</span></h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Widgets</h3>
        <div className="space-y-4">
          {page.widgets.map((widget) => (
            <div key={widget.id} className="bg-white p-4 rounded shadow border flex justify-between items-start">
              <div className="flex-1 mr-4">
                <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs font-bold mb-2 uppercase">{widget.type}</span>
                <WidgetJsonEditor id={widget.id} initialData={widget.data} />
              </div>
              <form action={async () => {
                  'use server'
                  await deleteWidget(widget.id)
              }}>
                <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </form>
            </div>
          ))}
          {page.widgets.length === 0 && <p className="text-gray-500 italic">No widgets yet.</p>}
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded">
        <h3 className="text-lg font-semibold mb-3">Add Widget</h3>
        <div className="flex gap-2">
          <AddWidgetButton pageId={page.id} type="hero" label="Hero Section" />
          <AddWidgetButton pageId={page.id} type="text" label="Rich Text" />
          <AddWidgetButton pageId={page.id} type="room-list" label="Room List" />
        </div>
      </div>
    </div>
  )
}

function AddWidgetButton({ pageId, type, label }: { pageId: string, type: string, label: string }) {
  return (
    <form action={async () => {
        'use server'
        await addWidget(pageId, type)
    }}>
      <button className="bg-white border hover:bg-gray-50 px-4 py-2 rounded shadow-sm text-sm font-medium">
        + {label}
      </button>
    </form>
  )
}
