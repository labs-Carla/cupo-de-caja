import { describe, expect, it } from 'vitest'
import { LIMITS, parseDecimal, parseMoney, validateMovement, validateRange } from './validation'

describe('validateRange', () => {
  it('acepta valores dentro del rango', () => {
    expect(validateRange(12, LIMITS.months)).toBeNull()
  })
  it('rechaza vacío, fuera de rango y decimales donde se exige entero', () => {
    expect(validateRange(null, LIMITS.months)).toMatch(/obligatorio/)
    expect(validateRange(0, LIMITS.months)).toMatch(/al menos 1/)
    expect(validateRange(61, LIMITS.months)).toMatch(/no puede superar 60/)
    expect(validateRange(2.5, LIMITS.months)).toMatch(/entero/)
  })
  it('permite decimales en la tasa', () => {
    expect(validateRange(23.5, LIMITS.annualRatePct)).toBeNull()
  })
})

describe('parsers', () => {
  it('parseMoney ignora separadores', () => {
    expect(parseMoney('1.250.000')).toBe(1_250_000)
    expect(parseMoney('$ 3.000')).toBe(3000)
    expect(parseMoney('')).toBeNull()
  })
  it('parseDecimal acepta coma o punto', () => {
    expect(parseDecimal('24,5')).toBe(24.5)
    expect(parseDecimal('18.2')).toBe(18.2)
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('abc')).toBeNaN()
  })
})

describe('validateMovement', () => {
  const today = '2026-09-27'
  const base = { type: 'venta' as const, description: 'Venta mostrador', amount: 50_000, date: today, category: 'Ventas' }

  it('acepta un movimiento válido', () => {
    expect(validateMovement(base, today)).toEqual({})
  })
  it('detecta errores de cada campo', () => {
    const errors = validateMovement(
      { ...base, description: '  ', amount: 0, date: '2026-10-01', category: '' },
      today,
    )
    expect(Object.keys(errors).sort()).toEqual(['amount', 'category', 'date', 'description'])
  })
  it('limita la longitud de la descripción', () => {
    expect(validateMovement({ ...base, description: 'x'.repeat(61) }, today).description).toBeDefined()
  })
})
