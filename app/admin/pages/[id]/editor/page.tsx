import { getPageById, addWidget } from '@/app/actions/admin'
import { WIDGET_TYPES, getWidgetIcon } from '@/components/admin/widget-editors/widget-types'
import { DraggableWidgetList } from '@/components/admin/DraggableWidgetList'

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

      {/* Widgets List with Drag & Drop */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Sayfa Widget'ları</h3>
          <span className="text-sm text-slate-400">{page.widgets.length} widget • Sıralamak için sürükleyin</span>
        </div>

        <DraggableWidgetList
          widgets={page.widgets.map(w => ({
            id: w.id,
            type: w.type,
            data: w.data,
            order: w.order,
          }))}
          pageId={page.id}
        />
      </div>

      {/* Add Widget Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Widget Ekle</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Array.isArray(WIDGET_TYPES) ? WIDGET_TYPES : []).map(widgetType => (
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
