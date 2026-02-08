import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Bodrum events API — reads from scraped JSON or returns sample data
export async function GET() {
    try {
        // Try to read scraped events from file
        const filePath = join(process.cwd(), 'scripts', 'events-scraper', 'bodrum_events.json')
        const data = await readFile(filePath, 'utf-8')
        const events = JSON.parse(data)
        return NextResponse.json(events)
    } catch {
        // Return sample data if no scraped file exists
        const sampleEvents = {
            events: [
                {
                    event_name: "Bodrum Caz Festivali",
                    event_date: "2026-07-15",
                    event_time: "21:00",
                    location: "Bodrum Kalesi",
                    ticket_url: "",
                    description: "Uluslararası sanatçıların katılımıyla caz festivali",
                    category: "festival",
                    image_url: ""
                },
                {
                    event_name: "Antik Tiyatro Konserleri",
                    event_date: "2026-08-01",
                    event_time: "21:30",
                    location: "Bodrum Antik Tiyatro",
                    ticket_url: "",
                    description: "Yaz konserleri serisi",
                    category: "konser",
                    image_url: ""
                },
                {
                    event_name: "Turgutreis Gün Batımı Festivali",
                    event_date: "2026-06-20",
                    event_time: "18:00",
                    location: "Turgutreis Sahil",
                    ticket_url: "",
                    description: "Bodrum'un en güzel gün batımı eşliğinde müzik ve sanat",
                    category: "festival",
                    image_url: ""
                },
                {
                    event_name: "Bodrum Uluslararası Bale Festivali",
                    event_date: "2026-07-25",
                    event_time: "21:00",
                    location: "Bodrum Kalesi",
                    ticket_url: "",
                    description: "Dünyaca ünlü bale toplulukları sahne alıyor",
                    category: "bale",
                    image_url: ""
                },
                {
                    event_name: "Bodrum Tanıtım Günleri",
                    event_date: "2026-09-10",
                    event_time: "10:00",
                    location: "Bodrum Marina",
                    ticket_url: "",
                    description: "Yerel el sanatları, gastronomi ve turizm fuarı",
                    category: "fuar",
                    image_url: ""
                },
                {
                    event_name: "Yalıkavak Marina Konser Serisi",
                    event_date: "2026-08-15",
                    event_time: "22:00",
                    location: "Yalıkavak Marina",
                    ticket_url: "",
                    description: "Pop ve rock konserleri",
                    category: "konser",
                    image_url: ""
                },
            ],
            scraped_at: new Date().toISOString(),
            source_url: "sample",
            total_count: 6,
        }

        return NextResponse.json(sampleEvents)
    }
}
