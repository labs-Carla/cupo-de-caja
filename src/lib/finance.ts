import type { CashProfile, Movement, SimulationInput } from './types'

export interface AmortizationRow {
  month: number
  payment: number
  interest: number
  principal: number
  balance: number
}

export interface SimulationResult {
  monthlyRate: number
  payment: number
  totalPaid: number
  totalInterest: number
  schedule: AmortizationRow[]
}

export type Fit = 'holgado' | 'ajustado' | 'exigente'

/** Convierte una tasa efectiva anual (en %) a tasa efectiva mensual (fracción). */
export function annualToMonthlyRate(annualRatePct: number): number {
  return Math.pow(1 + annualRatePct / 100, 1 / 12) - 1
}

/** Cuota fija mensual por sistema francés. */
export function monthlyPayment(principal: number, monthlyRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
}

/** Convierte una tasa efectiva anual (en %) a tasa efectiva semanal (fracción), con 52 semanas. */
export function annualToWeeklyRate(annualRatePct: number): number {
  return Math.pow(1 + annualRatePct / 100, 1 / 52) - 1
}

export function simulate({ amount, months, annualRatePct }: SimulationInput): SimulationResult {
  return amortize(amount, months, annualToMonthlyRate(annualRatePct))
}

/** Plan de cuota fija para cualquier periodicidad (mensual, semanal…). `month` es el número de periodo. */
export function amortize(amount: number, months: number, monthlyRate: number): SimulationResult {
  const payment = monthlyPayment(amount, monthlyRate, months)
  const schedule: AmortizationRow[] = []
  let balance = amount

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate
    let principal = payment - interest
    // El último mes absorbe los residuos de redondeo para cerrar en cero.
    if (month === months) principal = balance
    balance = Math.max(0, balance - principal)
    schedule.push({ month, payment: principal + interest, interest, principal, balance })
  }

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0)
  return { monthlyRate, payment, totalPaid, totalInterest: totalPaid - amount, schedule }
}

export function netCashFlow(profile: Pick<CashProfile, 'monthlySales' | 'monthlyExpenses'>): number {
  return profile.monthlySales - profile.monthlyExpenses
}

/** Porción del flujo neto que el comerciante podría destinar a una cuota, tras reservar su margen. */
export function referencePayment(profile: CashProfile): number {
  const net = netCashFlow(profile)
  return Math.max(0, net * (1 - profile.safetyMarginPct / 100))
}

/** Relación cuota / flujo neto. `Infinity` si el flujo neto no es positivo. */
export function paymentToCashFlowRatio(payment: number, netFlow: number): number {
  if (netFlow <= 0) return payment > 0 ? Infinity : 0
  return payment / netFlow
}

export function classifyFit(ratio: number): Fit {
  if (ratio <= 0.3) return 'holgado'
  if (ratio <= 0.5) return 'ajustado'
  return 'exigente'
}

export interface MonthTotals {
  /** Mes en formato `YYYY-MM`, o `null` si no hay movimientos. */
  month: string | null
  sales: number
  expenses: number
  net: number
  count: number
}

/** Totales del mes calendario más reciente que tenga movimientos. */
export function latestMonthTotals(movements: Movement[]): MonthTotals {
  if (movements.length === 0) return { month: null, sales: 0, expenses: 0, net: 0, count: 0 }
  const month = movements.reduce((max, m) => (m.date.slice(0, 7) > max ? m.date.slice(0, 7) : max), '')
  const inMonth = movements.filter((m) => m.date.startsWith(month))
  const sales = inMonth.filter((m) => m.type === 'venta').reduce((s, m) => s + m.amount, 0)
  const expenses = inMonth.filter((m) => m.type === 'gasto').reduce((s, m) => s + m.amount, 0)
  return { month, sales, expenses, net: sales - expenses, count: inMonth.length }
}

/** Monto máximo cuya cuota fija no supera `payment` con la tasa y plazo dados (inverso de `monthlyPayment`). */
export function principalForPayment(payment: number, monthlyRate: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0
  if (monthlyRate === 0) return payment * months
  return (payment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate
}
