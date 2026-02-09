'use client'

interface TableColumn {
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
}

interface TableData {
    label?: string
    heading?: string
    columns: TableColumn[]
    rows: Record<string, string | number>[]
    backgroundColor?: 'white' | 'sand'
}

export function TableWidget({ data }: { data: TableData }) {
    const bg = data.backgroundColor === 'sand' ? 'bg-sand' : 'bg-white'

    return (
        <section className={`py-16 ${bg}`}>
            <div className="container mx-auto px-6">
                {(data.label || data.heading) && (
                    <div className="text-center mb-12">
                        {data.label && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.label}
                            </span>
                        )}
                        {data.heading && (
                            <h2 className="text-4xl font-serif text-gray-900">{data.heading}</h2>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-brand-dark text-white">
                                <tr>
                                    {data.columns?.map((col, i) => (
                                        <th key={i} className={`px-6 py-4 font-bold uppercase tracking-wider text-sm text-${col.align || 'left'}`}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.rows?.map((row, ri) => (
                                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {data.columns?.map((col, ci) => (
                                            <td key={ci} className={`px-6 py-4 ${ci === 0 ? 'font-serif text-lg text-gray-900' : `text-${col.align || 'left'} text-gray-600`}`}>
                                                {row[col.key] || ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}
