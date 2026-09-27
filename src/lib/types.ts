export type MovementType = 'venta' | 'gasto'

export interface Movement {
  id: string
  type: MovementType
  description: string
  amount: number
  /** Fecha en formato ISO `YYYY-MM-DD`. */
  date: string
  category: string
}

export interface CashProfile {
  ownerName: string
  businessName: string
  businessType: string
  monthlySales: number
  monthlyExpenses: number
  /** Porcentaje del flujo neto que se reserva como colchón (0–90). */
  safetyMarginPct: number
}

export interface SimulationInput {
  amount: number
  months: number
  /** Tasa efectiva anual en porcentaje, p. ej. 24 = 24 % E.A. */
  annualRatePct: number
}

export type ScreenId = 'inicio' | 'perfil' | 'simulador' | 'resumen' | 'actividad'

export type RequestStatus = 'revision' | 'aprobada' | 'rechazada'

export type BusinessKind = 'Tienda' | 'Restaurante' | 'Puesto de mercado' | 'Otro'

export interface CreditRequest {
  id: string
  name: string
  businessName: string
  businessType: BusinessKind
  amount: number
  purpose: string
  dailySales: number
  dailyExpenses: number
  weeks: number
  status: RequestStatus
  /** Fecha ISO de creación. */
  createdAt: string
  source: 'demo' | 'whatsapp'
  /** Cuotas marcadas como pagadas en la demo. */
  paidInstallments: number
}

export type AppView = 'comerciante' | 'whatsapp' | 'aliado'
