interface TextData {
  content?: string
  backgroundColor?: string
  textColor?: string
  padding?: 'small' | 'medium' | 'large'
  maxWidth?: 'narrow' | 'medium' | 'full'
}

export function TextWidget({ data }: { data: TextData }) {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-100',
    blue: 'bg-blue-50',
    dark: 'bg-slate-900'
  }

  const textClasses = {
    dark: 'text-gray-800',
    light: 'text-white',
    blue: 'text-blue-900'
  }

  const paddingClasses = {
    small: 'py-8',
    medium: 'py-16',
    large: 'py-24'
  }

  const maxWidthClasses = {
    narrow: 'max-w-3xl',
    medium: 'max-w-5xl',
    full: 'max-w-7xl'
  }

  const bg = bgClasses[data.backgroundColor as keyof typeof bgClasses] || bgClasses.white
  const text = textClasses[data.textColor as keyof typeof textClasses] || textClasses.dark
  const padding = paddingClasses[data.padding as keyof typeof paddingClasses] || paddingClasses.medium
  const maxWidth = maxWidthClasses[data.maxWidth as keyof typeof maxWidthClasses] || maxWidthClasses.medium

  return (
    <section className={`${bg} ${padding} px-4`}>
      <div className={`${maxWidth} mx-auto`}>
        <div
          className={`${text} prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-ul:pl-6
            prose-ol:list-decimal prose-ol:pl-6
            ${data.textColor === 'light' ? 'prose-invert' : ''}
          `}
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
      </div>
    </section>
  )
}
