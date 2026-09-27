import type { Fit } from '../lib/finance'

export const FIT_LABEL: Record<Fit, string> = {
  holgado: 'Holgado',
  ajustado: 'Ajustado',
  exigente: 'Exigente',
}

export const FIT_EXPLANATION: Record<Fit, string> = {
  holgado: 'La cuota ocupa como máximo el 30 % de tu flujo neto. Te queda espacio para imprevistos.',
  ajustado: 'La cuota ocupa entre el 30 % y el 50 % de tu flujo neto. Un mes flojo podría apretar la caja.',
  exigente: 'La cuota ocupa más de la mitad de tu flujo neto (o tu flujo no es positivo). Considera un monto menor o un plazo más largo.',
}
