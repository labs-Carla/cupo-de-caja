import { describe, expect, it } from 'vitest'
import { annualToWeeklyRate } from './finance'
import { buildOffer, estimateDailySales, OFFER_ASSUMPTIONS } from './offer'

describe('buildOffer', () => {
  it('mantiene el monto si la cuota cabe en las ventas', () => {
    const offer = buildOffer(1_000_000, 350_000, '2026-09-27')
    expect(offer.amount).toBe(1_000_000)
    expect(offer.capped).toBe(false)
    expect(offer.schedule).toHaveLength(8)
    expect(offer.payment).toBeLessThanOrEqual(350_000 * 6 * 0.25)
    expect(offer.totalPaid).toBeGreaterThan(1_000_000)
  })
  it('reduce el monto si la cuota supera el tope ilustrativo', () => {
    const offer = buildOffer(2_000_000, 150_000, '2026-09-27')
    expect(offer.capped).toBe(true)
    expect(offer.amount).toBeLessThan(2_000_000)
    expect(offer.amount % 10_000).toBe(0)
    expect(offer.payment).toBeLessThanOrEqual(150_000 * 6 * 0.25 + 1)
  })
  it('programa cuotas semanales desde la semana siguiente', () => {
    const offer = buildOffer(500_000, 350_000, '2026-09-27')
    expect(offer.firstDueDate).toBe('2026-10-04')
    expect(offer.dueDates.at(-1)).toBe('2026-11-22')
  })
  it('usa la tasa semanal equivalente a la E.A.', () => {
    const offer = buildOffer(1_000_000, 350_000, '2026-09-27')
    expect(offer.monthlyRate).toBeCloseTo(annualToWeeklyRate(OFFER_ASSUMPTIONS.annualRatePct), 12)
    // Tasa semanal compuesta 52 veces = E.A.
    expect(Math.pow(1 + offer.monthlyRate, 52) - 1).toBeCloseTo(0.26, 10)
  })
})

describe('estimateDailySales', () => {
  it('prioriza el valor manual', () => {
    expect(estimateDailySales('lt200', 420_000)).toBe(420_000)
    expect(estimateDailySales('200-500', null)).toBe(350_000)
    expect(estimateDailySales(null, null)).toBe(0)
  })
})
