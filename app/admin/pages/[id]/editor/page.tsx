import { getPageById, addWidget, deleteWidget } from '@/app/actions/admin'
import { WidgetEditor } from '@/components/admin/widget-editors'
import { WIDGET_TYPES } from '@/components/admin/widget-editors/widget-types'
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPageById(id)

  if (!page) return <div className="p-8 text-center text-slate-400">Sayfa bulunamadı</div>

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">
          {page.title}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Dil: <span className="font-medium">{page.locale.toUpperCase()}</span> •
          Slug: <span className="font-medium">/{page.slug}</span>
        </p>
      </div>

      {/* Widgets List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Sayfa Widget'ları</h3>
          <span className="text-sm text-slate-400">{page.widgets.length} widget</span>
        </div>

        <div className="space-y-4">
          {page.widgets.map((widget, index) => (
            <div
              key={widget.id}
              className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden"
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-slate-200 cursor-move">
                    <GripVertical size={18} />
                  </button>
                  <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold uppercase">
                    {WIDGET_TYPES.find(w => w.type === widget.type)?.icon || '📦'}
                    {widget.type}
                  </span>
                  <span className="text-xs text-slate-500">#{index + 1}</span>
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
            <div className="text-center py-12 bg-slate-900 rounded-xl border-2 border-dashed border-slate-700">
              <p className="text-slate-400 mb-2">Bu sayfada henüz widget yok</p>
              <p className="text-sm text-slate-500">Sayfanızı oluşturmak için aşağıdan widget ekleyin</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Widget Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Widget Ekle</h3>
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
        className="w-full text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500 p-3 rounded-lg shadow-sm transition group"
        title={description}
      >
        <span className="text-xl mb-1 block">{icon}</span>
        <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 block">
          {label}
        </span>
      </button>
    </form>
  )
}
