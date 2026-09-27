import type { CreditRequest } from './types'

type Seed = Pick<CreditRequest, 'name' | 'businessName' | 'businessType' | 'amount' | 'purpose' | 'dailySales' | 'dailyExpenses' | 'status'>

const SEEDS: Seed[] = [
  { name: 'María López', businessName: 'Sazón de María', businessType: 'Restaurante', amount: 1_000_000, purpose: 'Comprar inventario', dailySales: 350_000, dailyExpenses: 220_000, status: 'revision' },
  { name: 'Carlos Ruiz', businessName: 'Tienda El Progreso', businessType: 'Tienda', amount: 500_000, purpose: 'Comprar inventario', dailySales: 280_000, dailyExpenses: 190_000, status: 'aprobada' },
  { name: 'Ana Torres', businessName: 'Frutas Ana', businessType: 'Puesto de mercado', amount: 800_000, purpose: 'Cubrir gastos del negocio', dailySales: 240_000, dailyExpenses: 150_000, status: 'revision' },
  { name: 'José Medina', businessName: 'Asadero Don José', businessType: 'Restaurante', amount: 1_500_000, purpose: 'Mejorar el local', dailySales: 180_000, dailyExpenses: 150_000, status: 'rechazada' },
  { name: 'Luisa Gómez', businessName: 'Miscelánea Luisa', businessType: 'Tienda', amount: 700_000, purpose: 'Comprar inventario', dailySales: 310_000, dailyExpenses: 205_000, status: 'aprobada' },
  { name: 'Pedro Castaño', businessName: 'Verduras Castaño', businessType: 'Puesto de mercado', amount: 400_000, purpose: 'Comprar inventario', dailySales: 160_000, dailyExpenses: 100_000, status: 'revision' },
  { name: 'Diana Rojas', businessName: 'Panadería La Espiga', businessType: 'Tienda', amount: 2_000_000, purpose: 'Mejorar el local', dailySales: 620_000, dailyExpenses: 430_000, status: 'aprobada' },
  { name: 'Andrés Pardo', businessName: 'Arepas Pardo', businessType: 'Restaurante', amount: 1_200_000, purpose: 'Cubrir gastos del negocio', dailySales: 210_000, dailyExpenses: 185_000, status: 'rechazada' },
  { name: 'Sandra Villa', businessName: 'Papelería Villa', businessType: 'Otro', amount: 600_000, purpose: 'Comprar inventario', dailySales: 190_000, dailyExpenses: 120_000, status: 'revision' },
  { name: 'Jorge Salcedo', businessName: 'Carnes Salcedo', businessType: 'Puesto de mercado', amount: 900_000, purpose: 'Comprar inventario', dailySales: 450_000, dailyExpenses: 320_000, status: 'aprobada' },
  { name: 'Paola Herrera', businessName: 'Corrientazo Paola', businessType: 'Restaurante', amount: 1_100_000, purpose: 'Otro', dailySales: 150_000, dailyExpenses: 135_000, status: 'rechazada' },
  { name: 'Hernán Díaz', businessName: 'Ferretería Díaz', businessType: 'Tienda', amount: 1_800_000, purpose: 'Comprar inventario', dailySales: 700_000, dailyExpenses: 480_000, status: 'revision' },
]

/** Solicitudes ficticias para el panel del aliado. */
export function sampleRequests(today: Date = new Date()): CreditRequest[] {
  return SEEDS.map((seed, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    return {
      ...seed,
      id: `sol-${String(i + 1).padStart(3, '0')}`,
      weeks: 8,
      createdAt: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      source: 'demo',
      paidInstallments: 0,
    }
  })
}

export const STATUS_LABEL: Record<CreditRequest['status'], string> = {
  revision: 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}
