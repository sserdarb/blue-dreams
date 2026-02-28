'use client'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPdfOptions {
    /** The DOM element to capture */
    element: HTMLElement
    /** PDF filename (without .pdf extension) */
    filename: string
    /** Title shown at top of PDF */
    title?: string
    /** Subtitle / date range etc. */
    subtitle?: string
    /** Page orientation */
    orientation?: 'portrait' | 'landscape'
    /** Callback when export starts */
    onStart?: () => void
    /** Callback when export completes */
    onFinish?: () => void
}

/**
 * Export a DOM element as a multi-page PDF.
 * Uses html2canvas to render, then splits into A4 pages via jsPDF.
 */
export async function exportPdf({
    element,
    filename,
    title,
    subtitle,
    orientation = 'landscape',
    onStart,
    onFinish,
}: ExportPdfOptions): Promise<void> {
    onStart?.()

    try {
        // Force light background for PDF readability
        const originalBg = element.style.backgroundColor
        element.style.backgroundColor = '#ffffff'

        // Add temporary class to force light mode for capture
        element.classList.add('pdf-export-mode')

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        })

        // Restore original styles
        element.style.backgroundColor = originalBg
        element.classList.remove('pdf-export-mode')

        const imgData = canvas.toDataURL('image/jpeg', 0.95)
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4',
        })

        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // Title area
        const headerHeight = title ? 18 : 4
        if (title) {
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            pdf.text(title, 10, 12)
            if (subtitle) {
                pdf.setFontSize(9)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(120, 120, 120)
                pdf.text(subtitle, 10, 17)
                pdf.setTextColor(0, 0, 0)
            }
        }

        // Calculate image dimensions
        const margin = 6
        const usableWidth = pageWidth - margin * 2
        const usableHeight = pageHeight - headerHeight - margin

        let imgWidth = usableWidth
        let imgHeight = (canvas.height / canvas.width) * imgWidth

        // If the scaled height is still larger than the usable page height, scale it down further
        // to fit entirely onto a single page (user request: sayfaya tam sığacak şekilde)
        if (imgHeight > usableHeight) {
            const ratio = usableHeight / imgHeight
            imgHeight = usableHeight
            imgWidth = imgWidth * ratio
        }

        // Center the image horizontally
        const xOffset = margin + (usableWidth - imgWidth) / 2

        // Always a single page
        pdf.addImage(imgData, 'JPEG', xOffset, headerHeight, imgWidth, imgHeight)

        // Footer on each page
        const totalPages = pdf.getNumberOfPages()
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i)
            pdf.setFontSize(7)
            pdf.setTextColor(160, 160, 160)
            const now = new Date()
            pdf.text(
                `Blue Dreams Resort — ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')} — Sayfa ${i}/${totalPages}`,
                pageWidth / 2,
                pageHeight - 3,
                { align: 'center' }
            )
        }

        pdf.save(`${filename}.pdf`)
    } catch (err) {
        console.error('PDF export failed:', err)
        throw err
    } finally {
        onFinish?.()
    }
}
