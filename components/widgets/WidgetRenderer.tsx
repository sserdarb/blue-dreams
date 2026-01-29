'use client'

import React from 'react'
import { HeroWidget } from './HeroWidget'
import { TextWidget } from './TextWidget'
import { RoomListWidget } from './RoomListWidget'

type WidgetProps = {
  type: string
  data: any
  id: string
}

const componentMap: { [key: string]: React.ComponentType<any> } = {
  'hero': HeroWidget,
  'text': TextWidget,
  'room-list': RoomListWidget,
}

export function WidgetRenderer({ widgets }: { widgets: WidgetProps[] }) {
  if (!widgets || widgets.length === 0) return null

  return (
    <div className="flex flex-col gap-0">
      {widgets.map((widget) => {
        const Component = componentMap[widget.type]
        if (!Component) {
          console.warn(`Unknown widget type: ${widget.type}`)
          return null
        }

        let parsedData = widget.data
        if (typeof widget.data === 'string') {
          try {
            parsedData = JSON.parse(widget.data)
          } catch (e) {
            console.error('Failed to parse widget data', e)
          }
        }

        return <Component key={widget.id} data={parsedData} />
      })}
    </div>
  )
}
