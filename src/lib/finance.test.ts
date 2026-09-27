import { describe, expect, it } from 'vitest'
import {
  annualToMonthlyRate,
  classifyFit,
  latestMonthTotals,
  monthlyPayment,
  netCashFlow,
  paymentToCashFlowRatio,
  principalForPayment,
  referencePayment,
  simulate,
} from './finance'
import type { Movement } from './types'

describe('annualToMonthlyRate', () => {
  it('convierte 12,68 % E.A. a ~1 % mensual', () => {
    expect(annualToMonthlyRate(12.682503)).toBeCloseTo(0.01, 6)
  })
  it('devuelve 0 para tasa 0', () => {
    expect(annualToMonthlyRate(0)).toBe(0)
  })
})

describe('monthlyPayment', () => {
  it('calcula la cuota francesa conocida', () => {
    // 1.000.000 a 12 meses al 1 % mensual ≈ 88.848,79
    expect(monthlyPayment(1_000_000, 0.01, 12)).toBeCloseTo(88_848.79, 1)
  })
  it('divide en partes iguales si la tasa es 0', () => {
    expect(monthlyPayment(1_200_000, 0, 12)).toBe(100_000)
  })
  it('devuelve 0 para monto o plazo no positivos', () => {
    expect(monthlyPayment(0, 0.01, 12)).toBe(0)
    expect(monthlyPayment(1_000, 0.01, 0)).toBe(0)
  })
})

describe('simulate', () => {
  const result = simulate({ amount: 5_000_000, months: 12, annualRatePct: 24 })

  it('genera una fila por mes y cierra el saldo en cero', () => {
    expect(result.schedule).toHaveLength(12)
    expect(result.schedule.at(-1)!.balance).toBe(0)
  })
  it('la suma de abonos a capital es igual al monto', () => {
    const principal = result.schedule.reduce((s, r) => s + r.principal, 0)
    expect(principal).toBeCloseTo(5_000_000, 4)
  })
  it('total pagado = monto + intereses', () => {
    expect(result.totalPaid).toBeCloseTo(5_000_000 + result.totalInterest, 6)
    expect(result.totalInterest).toBeGreaterThan(0)
  })
  it('los intereses disminuyen mes a mes', () => {
    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].interest).toBeLessThan(result.schedule[i - 1].interest)
    }
  })
  it('más plazo implica cuota menor pero más intereses', () => {
    const longer = simulate({ amount: 5_000_000, months: 24, annualRatePct: 24 })
    expect(longer.payment).toBeLessThan(result.payment)
    expect(longer.totalInterest).toBeGreaterThan(result.totalInterest)
  })
})

describe('perfil de caja', () => {
  const profile = {
    ownerName: 'Ana',
    businessName: 'Tienda',
    businessType: 'Tienda',
    monthlySales: 10_000_000,
    monthlyExpenses: 7_000_000,
    safetyMarginPct: 40,
  }
  it('calcula flujo neto y cuota de referencia', () => {
    expect(netCashFlow(profile)).toBe(3_000_000)
    expect(referencePayment(profile)).toBeCloseTo(1_800_000, 6)
  })
  it('la cuota de referencia no es negativa con flujo negativo', () => {
    expect(referencePayment({ ...profile, monthlyExpenses: 12_000_000 })).toBe(0)
  })
})

describe('relación cuota/flujo', () => {
  it('clasifica los rangos', () => {
    expect(classifyFit(paymentToCashFlowRatio(300, 1000))).toBe('holgado')
    expect(classifyFit(paymentToCashFlowRatio(450, 1000))).toBe('ajustado')
    expect(classifyFit(paymentToCashFlowRatio(600, 1000))).toBe('exigente')
  })
  it('es exigente si el flujo no es positivo', () => {
    expect(paymentToCashFlowRatio(100, 0)).toBe(Infinity)
    expect(classifyFit(paymentToCashFlowRatio(100, -5))).toBe('exigente')
  })
})

describe('latestMonthTotals', () => {
  const mk = (id: string, type: Movement['type'], amount: number, date: string): Movement => ({
    id,
    type,
    amount,
    date,
    description: id,
    category: 'Otro',
  })
  it('suma solo el mes más reciente', () => {
    const totals = latestMonthTotals([
      mk('a', 'venta', 100, '2026-08-30'),
      mk('b', 'venta', 300, '2026-09-02'),
      mk('c', 'gasto', 120, '2026-09-10'),
    ])
    expect(totals).toEqual({ month: '2026-09', sales: 300, expenses: 120, net: 180, count: 2 })
  })
  it('maneja lista vacía', () => {
    expect(latestMonthTotals([]).month).toBeNull()
  })
})

describe('principalForPayment', () => {
  it('es el inverso de monthlyPayment', () => {
    const rate = annualToMonthlyRate(24)
    const payment = monthlyPayment(3_000_000, rate, 18)
    expect(principalForPayment(payment, rate, 18)).toBeCloseTo(3_000_000, 4)
  })
  it('con tasa 0 es cuota × plazo', () => {
    expect(principalForPayment(100_000, 0, 10)).toBe(1_000_000)
  })
})
