import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readdir, mkdir, stat } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true })
    }
}

// POST: Upload a file
export async function POST(request: NextRequest) {
    try {
        await ensureUploadDir()

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/pdf'
        ]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Desteklenmeyen dosya türü. Desteklenen: JPG, PNG, GIF, WebP, SVG, PDF' },
                { status: 400 }
            )
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Dosya boyutu 10MB\'dan büyük olamaz' }, { status: 400 })
        }

        // Generate unique filename
        const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
        const baseName = path.basename(file.name, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .substring(0, 50)
        const timestamp = Date.now()
        const fileName = `${baseName}_${timestamp}${ext}`
        const filePath = path.join(UPLOAD_DIR, fileName)

        // Write file
        const bytes = await file.arrayBuffer()
        await writeFile(filePath, Buffer.from(bytes))

        const url = `/uploads/${fileName}`

        return NextResponse.json({
            success: true,
            url,
            fileName,
            originalName: file.name,
            size: file.size,
            type: file.type
        })
    } catch (error) {
        console.error('[Upload] Error:', error)
        return NextResponse.json({ error: 'Dosya yükleme hatası' }, { status: 500 })
    }
}

// GET: List uploaded files (file manager)
export async function GET(request: NextRequest) {
    try {
        await ensureUploadDir()

        const searchParams = request.nextUrl.searchParams
        const filter = searchParams.get('filter') || 'all' // 'all', 'images', 'pdf'

        const files = await readdir(UPLOAD_DIR)
        const fileList = []

        for (const fileName of files) {
            const filePath = path.join(UPLOAD_DIR, fileName)
            try {
                const stats = await stat(filePath)
                if (!stats.isFile()) continue

                const ext = path.extname(fileName).toLowerCase()
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)
                const isPdf = ext === '.pdf'

                // Filter
                if (filter === 'images' && !isImage) continue
                if (filter === 'pdf' && !isPdf) continue

                fileList.push({
                    name: fileName,
                    url: `/uploads/${fileName}`,
                    size: stats.size,
                    type: isImage ? 'image' : isPdf ? 'pdf' : 'other',
                    modifiedAt: stats.mtime.toISOString()
                })
            } catch { /* skip unreadable files */ }
        }

        // Sort by newest first
        fileList.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

        return NextResponse.json({ files: fileList })
    } catch (error) {
        console.error('[Upload] List Error:', error)
        return NextResponse.json({ error: 'Dosya listesi alınamadı' }, { status: 500 })
    }
}
