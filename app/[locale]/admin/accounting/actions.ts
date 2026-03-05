'use server'

import { AccountingService } from '@/lib/services/accounting'
import { revalidatePath } from 'next/cache'

export async function createInvoiceAction(payload: any) {
    try {
        const success = await AccountingService.createInvoice(payload)

        if (success) {
            revalidatePath('/[locale]/admin/accounting', 'page')
        }

        return { success }
    } catch (e: any) {
        console.error('Failed to create invoice:', e.message)
        return { success: false, error: e.message }
    }
}
