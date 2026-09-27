import { amortize, annualToWeeklyRate, principalForPayment, type SimulationResult } from './finance'

/** Supuestos ilustrativos del prototipo. No representan condiciones reales de ningún aliado. */
export const OFFER_ASSUMPTIONS = {
  annualRatePct: 26,
  weeks: 8,
  workingDaysPerWeek: 6,
  /** Porción máxima de las ventas semanales que se destinaría a la cuota. */
  maxPaymentShare: 0.25,
  /** Gastos diarios estimados como fracción de las ventas (solo para el panel demo). */
  expenseRatio: 0.63,
  minAmount: 100_000,
  maxAmount: 5_000_000,
}

export const SALES_RANGES = [
  { id: 'lt200', label: 'Menos de $200.000', estimate: 150_000 },
  { id: '200-500', label: '$200.000 – $500.000', estimate: 350_000 },
  { id: '500-1000', label: '$500.000 – $1.000.000', estimate: 750_000 },
  { id: 'gt1000', label: 'Más de $1.000.000', estimate: 1_200_000 },
] as const

export type SalesRangeId = (typeof SALES_RANGES)[number]['id']

export function estimateDailySales(rangeId: SalesRangeId | null, manual: number | null): number {
  if (manual && manual > 0) return manual
  return SALES_RANGES.find((r) => r.id === rangeId)?.estimate ?? 0
}

export interface Offer extends SimulationResult {
  requested: number
  amount: number
  weeks: number
  annualRatePct: number
  /** true si el monto se redujo para que la cuota quepa en las ventas declaradas. */
  capped: boolean
  firstDueDate: string
  dueDates: string[]
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** Oferta simulada: cuota fija semanal, con tope ilustrativo según ventas diarias. */
export function buildOffer(requested: number, dailySales: number, today: string, a = OFFER_ASSUMPTIONS): Offer {
  const rate = annualToWeeklyRate(a.annualRatePct)
  const maxPayment = dailySales * a.workingDaysPerWeek * a.maxPaymentShare
  const cap = Math.floor(principalForPayment(maxPayment, rate, a.weeks) / 10_000) * 10_000
  const amount = Math.max(0, Math.min(requested, cap))
  const result = amortize(amount, a.weeks, rate)
  const dueDates = Array.from({ length: a.weeks }, (_, i) => addDays(today, 7 * (i + 1)))
  return {
    ...result,
    requested,
    amount,
    weeks: a.weeks,
    annualRatePct: a.annualRatePct,
    capped: amount < requested,
    firstDueDate: dueDates[0],
    dueDates,
  }
}
