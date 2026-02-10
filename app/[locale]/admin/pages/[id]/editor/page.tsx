import { getPageById, addWidget, deleteWidget } from '@/app/actions/admin'
import { WidgetEditor } from '@/components/admin/widget-editors'
import { WIDGET_TYPES } from '@/components/admin/widget-editors/widget-types'
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPageById(id)

  if (!page) return <div className="p-8 text-center text-gray-500">Page not found</div>

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {page.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Locale: <span className="font-medium">{page.locale.toUpperCase()}</span> •
          Slug: <span className="font-medium">/{page.slug}</span>
        </p>
      </div>

      {/* Widgets List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Page Widgets</h3>
          <span className="text-sm text-gray-500">{page.widgets.length} widget(s)</span>
        </div>

        <div className="space-y-4">
          {page.widgets.map((widget, index) => (
            <div
              key={widget.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-gray-600 cursor-move">
                    <GripVertical size={18} />
                  </button>
                  <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold uppercase">
                    {WIDGET_TYPES.find(w => w.type === widget.type)?.icon || '📦'}
                    {widget.type}
                  </span>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <form action={async () => {
                    'use server'
                    await deleteWidget(widget.id)
                  }}>
                    <button
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Delete widget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Widget Editor */}
              <div className="p-4">
                <WidgetEditor
                  id={widget.id}
                  type={widget.type}
                  initialData={widget.data}
                />
              </div>
            </div>
          ))}

          {page.widgets.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 mb-2">No widgets on this page yet</p>
              <p className="text-sm text-gray-400">Add widgets below to build your page</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Widget Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Widget</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {WIDGET_TYPES.map(widgetType => (
            <AddWidgetButton
              key={widgetType.type}
              pageId={page.id}
              type={widgetType.type}
              label={widgetType.label}
              icon={widgetType.icon}
              description={widgetType.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AddWidgetButton({
  pageId,
  type,
  label,
  icon,
  description
}: {
  pageId: string
  type: string
  label: string
  icon: string
  description: string
}) {
  return (
    <form action={async () => {
      'use server'
      await addWidget(pageId, type)
    }}>
      <button
        className="w-full text-left bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 p-3 rounded-lg shadow-sm transition group"
        title={description}
      >
        <span className="text-xl mb-1 block">{icon}</span>
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 block">
          {label}
        </span>
      </button>
    </form>
  )
}
