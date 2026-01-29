export function TextWidget({ data }: { data: any }) {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div
        className={`prose max-w-none ${data.alignment === 'center' ? 'text-center' : ''}`}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  )
}
