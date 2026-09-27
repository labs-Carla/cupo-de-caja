import { useState } from 'react'
import { MoneyField, SliderField } from '../components/fields'
import { Badge, Button, Card, PageHeader, Stat } from '../components/ui'
import { principalForPayment } from '../lib/finance'
import { formatCOP, formatPct } from '../lib/format'
import type { ScreenId } from '../lib/types'
import { LIMITS } from '../lib/validation'
import { useAppState } from '../state/AppState'
import { useDerived } from '../state/useDerived'
import { FIT_LABEL } from './fitCopy'

export function Simulador({ onNavigate }: { onNavigate: (id: ScreenId) => void }) {
  const { simulation, updateSimulation } = useAppState()
  const { result, reference, ratio, fit } = useDerived()
  const [showAll, setShowAll] = useState(false)
  const coverable = Math.floor(principalForPayment(reference, result.monthlyRate, simulation.months) / 10_000) * 10_000
  const rows = showAll ? result.schedule : result.schedule.slice(0, 6)

  return (
    <>
      <PageHeader
        eyebrow="Simulador"
        title="Arma un escenario de financiación"
        description="Escenario hipotético con cuota fija mensual. No es una oferta ni una aprobación: sirve para entender el costo antes de hablar con cualquier entidad."
      />
      <div className="grid-2 grid-2--form">
        <Card title="Datos del escenario">
          <div className="form-grid">
            <MoneyField label="Monto" value={simulation.amount} range={LIMITS.amount} hint="Entre $100.000 y $200.000.000" onChange={(v) => updateSimulation({ amount: v })} />
            <SliderField label="Plazo" value={simulation.months} range={LIMITS.months} suffix="meses" onChange={(v) => updateSimulation({ months: v })} />
            <SliderField
              label="Tasa efectiva anual (E.A.)"
              hint="Consulta la tasa real con la entidad. Puedes usar decimales: 24,5"
              value={simulation.annualRatePct}
              range={LIMITS.annualRatePct}
              step={0.5}
              suffix="% E.A."
              onChange={(v) => updateSimulation({ annualRatePct: v })}
            />
          </div>
          <div className="hint-box">
            Con tu cuota de referencia ({formatCOP(reference)}), a este plazo y tasa, la cuota cubriría un monto de hasta{' '}
            <strong>{formatCOP(coverable)}</strong>.
            {coverable >= LIMITS.amount.min && (
              <Button variant="ghost" className="btn--inline" onClick={() => updateSimulation({ amount: Math.min(coverable, LIMITS.amount.max) })}>
                Usar este monto
              </Button>
            )}
          </div>
        </Card>

        <div className="stack">
          <Card tone="brand" title="Resultado" action={<Badge tone={fit}>{FIT_LABEL[fit]}</Badge>}>
            <Stat tone="inverse" size="lg" label="Cuota mensual" value={formatCOP(result.payment)} hint={`Tasa mensual equivalente: ${formatPct(result.monthlyRate)}`} />
            <div className="stat-grid stat-grid--3 mt">
              <Stat tone="inverse" label="Total pagado" value={formatCOP(result.totalPaid)} />
              <Stat tone="inverse" label="Intereses" value={formatCOP(result.totalInterest)} />
              <Stat tone="inverse" label="Cuota / flujo" value={formatPct(ratio)} />
            </div>
            <div className="card__actions">
              <Button variant="accent" onClick={() => onNavigate('resumen')}>
                Entender este escenario
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Plan de pagos" subtitle="Cuánto de cada cuota va a intereses y cuánto a capital">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Mes</th>
                <th scope="col">Cuota</th>
                <th scope="col">Intereses</th>
                <th scope="col">Capital</th>
                <th scope="col">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td>{formatCOP(r.payment)}</td>
                  <td>{formatCOP(r.interest)}</td>
                  <td>{formatCOP(r.principal)}</td>
                  <td>{formatCOP(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {result.schedule.length > 6 && (
          <div className="card__actions">
            <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Ver menos' : `Ver los ${result.schedule.length} meses`}
            </Button>
          </div>
        )}
      </Card>
    </>
  )
}
