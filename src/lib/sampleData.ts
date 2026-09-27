import type { CashProfile, Movement, SimulationInput } from './types'

/** Datos ficticios. Cualquier parecido con un negocio real es coincidencia. */
export const SAMPLE_PROFILE: CashProfile = {
  ownerName: 'Marta',
  businessName: 'Tienda Doña Marta',
  businessType: 'Tienda de barrio',
  monthlySales: 14_500_000,
  monthlyExpenses: 11_200_000,
  safetyMarginPct: 40,
}

export const SAMPLE_SIMULATION: SimulationInput = {
  amount: 6_000_000,
  months: 12,
  annualRatePct: 26,
}

export const SALE_CATEGORIES = ['Ventas de mostrador', 'Domicilios', 'Ventas a crédito cobradas', 'Otros ingresos']
export const EXPENSE_CATEGORIES = ['Inventario', 'Arriendo', 'Servicios', 'Nómina', 'Transporte', 'Otros gastos']

/** Genera movimientos de ejemplo para el mes actual y el anterior, relativos a `today`. */
export function sampleMovements(today: Date = new Date()): Movement[] {
  const y = today.getFullYear()
  const m = today.getMonth()
  const day = Math.max(1, Math.min(today.getDate(), 28))
  const iso = (monthOffset: number, d: number) => {
    const date = new Date(y, m + monthOffset, Math.min(d, monthOffset === 0 ? day : 28))
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const rows: Omit<Movement, 'id'>[] = [
    { type: 'venta', description: 'Ventas de la semana', amount: 3_450_000, date: iso(0, 7), category: 'Ventas de mostrador' },
    { type: 'gasto', description: 'Pedido de abarrotes', amount: 2_100_000, date: iso(0, 5), category: 'Inventario' },
    { type: 'venta', description: 'Domicilios del fin de semana', amount: 620_000, date: iso(0, 3), category: 'Domicilios' },
    { type: 'gasto', description: 'Arriendo del local', amount: 1_300_000, date: iso(0, 1), category: 'Arriendo' },
    { type: 'venta', description: 'Ventas de la semana', amount: 3_200_000, date: iso(0, 1), category: 'Ventas de mostrador' },
    { type: 'gasto', description: 'Energía y agua', amount: 285_000, date: iso(0, 2), category: 'Servicios' },
    { type: 'venta', description: 'Ventas del mes', amount: 13_900_000, date: iso(-1, 28), category: 'Ventas de mostrador' },
    { type: 'gasto', description: 'Inventario del mes', amount: 8_400_000, date: iso(-1, 20), category: 'Inventario' },
    { type: 'gasto', description: 'Arriendo del local', amount: 1_300_000, date: iso(-1, 1), category: 'Arriendo' },
  ]
  return rows.map((r, i) => ({ ...r, id: `demo-${i + 1}` }))
}
