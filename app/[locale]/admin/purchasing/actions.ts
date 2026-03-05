'use server'

import { PurchasingService } from '@/lib/services/purchasing'
import { revalidatePath } from 'next/cache'

export async function createPurchaseOrderAction(payload: any) {
    try {
        const success = await PurchasingService.createPurchaseOrder(payload)

        if (success) {
            revalidatePath('/[locale]/admin/purchasing', 'page')
            revalidatePath('/[locale]/admin/reports', 'page')
        }

        return { success }
    } catch (e: any) {
        console.error('Failed to create purchase order:', e.message)
        return { success: false, error: e.message }
    }
}
