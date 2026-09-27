import type { SalesRangeId } from '../lib/offer'
import type { BusinessKind } from '../lib/types'

/** Respuestas del flujo de WhatsApp. `step` va de 1 (Bienvenida) a 6 (Seguimiento). */
export interface ChatDraft {
  step: 1 | 2 | 3 | 4 | 5 | 6
  amountOption: string | null
  amount: number | null
  purpose: string | null
  businessType: BusinessKind | null
  salesRange: SalesRangeId | null
  manualSales: number | null
  requestId: string | null
}

export const EMPTY_CHAT: ChatDraft = {
  step: 1,
  amountOption: null,
  amount: null,
  purpose: null,
  businessType: null,
  salesRange: null,
  manualSales: null,
  requestId: null,
}
