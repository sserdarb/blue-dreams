import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads')

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']

// Map folder names to Turkish category labels
const CATEGORY_MAP: Record<string, string> = {
    'rooms': 'Odalar',
    'dining': 'Restaurant',
    'photo-kit': 'Fotoğraf Kiti',
    'spa': 'Spa',
    'pool': 'Havuz',
    'beach': 'Plaj',
    'activities': 'Aktiviteler',
    'events': 'Etkinlikler',
    'general': 'Genel',
    'uploads': 'Yüklenenler',
}

function getCategoryFromPath(filePath: string, baseDir: string): string {
    const relative = path.relative(baseDir, filePath)
    const parts = relative.split(path.sep)

    // If it's from uploads dir
    if (baseDir === UPLOADS_DIR) return 'Yüklenenler'

    // Use the first folder name as category
    if (parts.length > 1) {
        const folder = parts[0].toLowerCase()
        return CATEGORY_MAP[folder] || parts[0]
    }

    return 'Genel'
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getAltFromFilename(fileName: string): string {
    const name = path.basename(fileName, path.extname(fileName))
    return name
        .replace(/[-_]/g, ' ')
        .replace(/\d+$/, '')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase())
}

interface GalleryFile {
    id: string
    url: string
    alt: string
    category: string
    size: string
    sizeBytes: number
    modifiedAt: string
    fileName: string
}

async function scanDirectory(dir: string, baseDir: string): Promise<GalleryFile[]> {
    const results: GalleryFile[] = []

    if (!existsSync(dir)) return results

    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            // Recurse into subdirectories
            const subResults = await scanDirectory(fullPath, baseDir)
            results.push(...subResults)
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase()
            if (!IMAGE_EXTENSIONS.includes(ext)) continue

            try {
                const stats = await stat(fullPath)
                const relativePath = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/')
                const url = `/${relativePath}`

                results.push({
                    id: `img-${Buffer.from(relativePath).toString('base64url').substring(0, 16)}`,
                    url,
                    alt: getAltFromFilename(entry.name),
                    category: getCategoryFromPath(fullPath, baseDir),
                    size: formatFileSize(stats.size),
                    sizeBytes: stats.size,
                    modifiedAt: stats.mtime.toISOString(),
                    fileName: entry.name,
                })
            } catch {
                // Skip unreadable files
            }
        }
    }

    return results
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category') || ''

        // Scan both image directories
        const [imagesFiles, uploadsFiles] = await Promise.all([
            scanDirectory(IMAGES_DIR, IMAGES_DIR),
            scanDirectory(UPLOADS_DIR, UPLOADS_DIR),
        ])

        let allFiles = [...imagesFiles, ...uploadsFiles]

        // Apply category filter if provided
        if (category) {
            allFiles = allFiles.filter(f => f.category === category)
        }

        // Sort by modification date descending
        allFiles.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

        // Compute category counts
        const allUnfiltered = [...imagesFiles, ...uploadsFiles]
        const categoryCountMap: Record<string, number> = {}
        for (const f of allUnfiltered) {
            categoryCountMap[f.category] = (categoryCountMap[f.category] || 0) + 1
        }
        const categories = Object.entries(categoryCountMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)

        // Compute totals
        const totalSize = allUnfiltered.reduce((acc, f) => acc + f.sizeBytes, 0)

        return NextResponse.json({
            images: allFiles,
            categories,
            stats: {
                totalImages: allUnfiltered.length,
                totalCategories: categories.length,
                totalSize: formatFileSize(totalSize),
                totalSizeBytes: totalSize,
            }
        })
    } catch (error) {
        console.error('[Gallery] Error:', error)
        return NextResponse.json({ error: 'Galeri yüklenemedi' }, { status: 500 })
    }
}
