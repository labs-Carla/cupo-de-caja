import { useMemo } from 'react'
import {
  classifyFit,
  latestMonthTotals,
  netCashFlow,
  paymentToCashFlowRatio,
  referencePayment,
  simulate,
} from '../lib/finance'
import { useAppState } from './AppState'

/** Valores calculados compartidos por varias pantallas. */
export function useDerived() {
  const { profile, simulation, movements } = useAppState()
  return useMemo(() => {
    const result = simulate(simulation)
    const net = netCashFlow(profile)
    const reference = referencePayment(profile)
    const ratio = paymentToCashFlowRatio(result.payment, net)
    return {
      result,
      net,
      reference,
      ratio,
      fit: classifyFit(ratio),
      month: latestMonthTotals(movements),
    }
  }, [profile, simulation, movements])
}
