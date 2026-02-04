'use client'

import React from 'react'
import { HeroWidget } from './HeroWidget'
import { TextWidget } from './TextWidget'
import { RoomListWidget } from './RoomListWidget'
import { GalleryWidget } from './GalleryWidget'
import { FeaturesWidget } from './FeaturesWidget'

type WidgetProps = {
  type: string
  data: any
  id: string
}

const componentMap: { [key: string]: React.ComponentType<{ data: any }> } = {
  'hero': HeroWidget,
  'text': TextWidget,
  'room-list': RoomListWidget,
  'gallery': GalleryWidget,
  'image-gallery': GalleryWidget,
  'features': FeaturesWidget,
}

export function WidgetRenderer({ widgets }: { widgets: WidgetProps[] }) {
  if (!widgets || widgets.length === 0) return null

  return (
    <div className="flex flex-col">
      {widgets.map((widget) => {
        const Component = componentMap[widget.type]

        if (!Component) {
          // For unknown widget types, show a placeholder in development
          if (process.env.NODE_ENV === 'development') {
            return (
              <div
                key={widget.id}
                className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded-lg"
              >
                <p className="text-yellow-700 text-sm">
                  Unknown widget type: <strong>{widget.type}</strong>
                </p>
              </div>
            )
          }
          return null
        }

        let parsedData = widget.data
        if (typeof widget.data === 'string') {
          try {
            parsedData = JSON.parse(widget.data)
          } catch (e) {
            console.error('Failed to parse widget data for widget:', widget.id, e)
          }
        }

        return <Component key={widget.id} data={parsedData} />
      })}
    </div>
  )
}
