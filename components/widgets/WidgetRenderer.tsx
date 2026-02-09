'use client'

import React from 'react'
import { HeroWidget } from './HeroWidget'
import { TextWidget } from './TextWidget'
import { TextBlockWidget } from './TextBlockWidget'
import { TextImageWidget } from './TextImageWidget'
import { RoomListWidget } from './RoomListWidget'
import { GalleryWidget } from './GalleryWidget'
import { FeaturesWidget } from './FeaturesWidget'
import { PageHeaderWidget } from './PageHeaderWidget'
import { StatsWidget } from './StatsWidget'
import { IconGridWidget } from './IconGridWidget'
import { ImageGridWidget } from './ImageGridWidget'
import { CtaWidget } from './CtaWidget'
import { ContactWidget } from './ContactWidget'
import { MapWidget } from './MapWidget'
import { YouTubeWidget } from './YouTubeWidget'
import { TableWidget } from './TableWidget'
import { ReviewsWidget } from './ReviewsWidget'
import { WeatherWidget } from './WeatherWidget'
import { ExperienceWidget } from './ExperienceWidget'

type WidgetProps = {
  type: string
  data: any
  id: string
}

const componentMap: { [key: string]: React.ComponentType<{ data: any }> } = {
  'hero': HeroWidget,
  'text': TextWidget,
  'text-block': TextBlockWidget,
  'text-image': TextImageWidget,
  'room-list': RoomListWidget,
  'gallery': GalleryWidget,
  'image-gallery': GalleryWidget,
  'features': FeaturesWidget,
  'page-header': PageHeaderWidget,
  'stats': StatsWidget,
  'icon-grid': IconGridWidget,
  'image-grid': ImageGridWidget,
  'cta': CtaWidget,
  'cta-banner': CtaWidget,
  'contact': ContactWidget,
  'contact-form': ContactWidget,
  'map': MapWidget,
  'youtube': YouTubeWidget,
  'table': TableWidget,
  'data-table': TableWidget,
  'reviews': ReviewsWidget,
  'testimonials': ReviewsWidget,
  'weather': WeatherWidget,
  'experience': ExperienceWidget,
}

export function WidgetRenderer({ widgets }: { widgets: WidgetProps[] }) {
  if (!widgets || widgets.length === 0) return null

  return (
    <div className="flex flex-col">
      {widgets.map((widget) => {
        const Component = componentMap[widget.type]

        if (!Component) {
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
