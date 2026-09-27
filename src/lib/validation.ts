import type { MovementType } from './types'

export interface Range {
  min: number
  max: number
  integer?: boolean
  label: string
  unit?: string
}

export const LIMITS = {
  amount: { min: 100_000, max: 200_000_000, integer: true, label: 'El monto', unit: 'COP' },
  months: { min: 1, max: 60, integer: true, label: 'El plazo', unit: 'meses' },
  annualRatePct: { min: 0, max: 60, label: 'La tasa', unit: '%' },
  safetyMarginPct: { min: 0, max: 90, integer: true, label: 'El margen', unit: '%' },
  monthlyMoney: { min: 0, max: 2_000_000_000, integer: true, label: 'El valor', unit: 'COP' },
} satisfies Record<string, Range>

/** Devuelve un mensaje de error en español, o `null` si el valor es válido. */
export function validateRange(value: number | null, range: Range): string | null {
  if (value === null || Number.isNaN(value)) return `${range.label} es obligatorio.`
  if (range.integer && !Number.isInteger(value)) return `${range.label} debe ser un número entero.`
  const fmt = (n: number) => new Intl.NumberFormat('es-CO').format(n)
  const unit = range.unit ? ` ${range.unit}` : ''
  if (value < range.min) return `${range.label} debe ser al menos ${fmt(range.min)}${unit}.`
  if (value > range.max) return `${range.label} no puede superar ${fmt(range.max)}${unit}.`
  return null
}

export interface MovementDraft {
  type: MovementType
  description: string
  amount: number | null
  date: string
  category: string
}

export type MovementErrors = Partial<Record<'description' | 'amount' | 'date' | 'category', string>>

export const MAX_DESCRIPTION = 60

export function validateMovement(draft: MovementDraft, today: string): MovementErrors {
  const errors: MovementErrors = {}
  const description = draft.description.trim()
  if (!description) errors.description = 'Escribe una descripción.'
  else if (description.length > MAX_DESCRIPTION)
    errors.description = `Máximo ${MAX_DESCRIPTION} caracteres.`

  if (draft.amount === null || Number.isNaN(draft.amount)) errors.amount = 'Ingresa un monto.'
  else if (draft.amount <= 0) errors.amount = 'El monto debe ser mayor que cero.'
  else if (draft.amount > LIMITS.monthlyMoney.max) errors.amount = 'El monto es demasiado alto.'

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || Number.isNaN(Date.parse(draft.date)))
    errors.date = 'Elige una fecha válida.'
  else if (draft.date > today) errors.date = 'La fecha no puede ser futura.'

  if (!draft.category) errors.category = 'Elige una categoría.'
  return errors
}

/** Convierte texto con separadores ("1.250.000") a número; `null` si está vacío o no es numérico. */
export function parseMoney(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '')
  if (!digits) return null
  return Number(digits)
}

/** Convierte texto decimal con coma o punto a número; `null` si no es válido. */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (!normalized) return null
  if (!/^-?\d*\.?\d*$/.test(normalized) || normalized === '.' || normalized === '-') return NaN
  return Number(normalized)
}
