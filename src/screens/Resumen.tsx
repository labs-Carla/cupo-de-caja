import { Badge, Card, PageHeader, SplitBar, Stat } from '../components/ui'
import { formatCOP, formatPct } from '../lib/format'
import { useAppState } from '../state/AppState'
import { useDerived } from '../state/useDerived'
import { FIT_EXPLANATION, FIT_LABEL } from './fitCopy'

export function Resumen() {
  const { profile, simulation } = useAppState()
  const { result, net, reference, ratio, fit } = useDerived()
  const leftover = net - result.payment
  const costPerPeso = simulation.amount > 0 ? result.totalInterest / simulation.amount : 0

  return (
    <>
      <PageHeader
        eyebrow="Resumen"
        title="Tu escenario en palabras simples"
        description={`${profile.businessName} · ${formatCOP(simulation.amount)} a ${simulation.months} meses`}
      />

      <Card tone="brand" title="¿La cuota cabe en tu caja?" action={<Badge tone={fit}>{FIT_LABEL[fit]}</Badge>}>
        <p className="lead">{FIT_EXPLANATION[fit]}</p>
        <div className="stat-grid stat-grid--3 mt">
          <Stat tone="inverse" label="Flujo neto mensual" value={formatCOP(net)} />
          <Stat tone="inverse" label="Cuota simulada" value={formatCOP(result.payment)} hint={`${formatPct(ratio)} de tu flujo`} />
          <Stat tone="inverse" label="Te quedaría al mes" value={formatCOP(leftover)} />
        </div>
      </Card>

      <div className="grid-2">
        <Card title="¿Cuánto cuesta?">
          <p>
            Por cada <strong>$1.000</strong> que recibes, devolverías <strong>{formatCOP(1000 * (1 + costPerPeso))}</strong>. En total
            pagarías <strong>{formatCOP(result.totalPaid)}</strong>, de los cuales <strong>{formatCOP(result.totalInterest)}</strong> son
            intereses.
          </p>
          <SplitBar
            label={`Capital ${formatCOP(simulation.amount)}, intereses ${formatCOP(result.totalInterest)}`}
            segments={[
              { name: 'capital', value: simulation.amount, tone: 'brand' },
              { name: 'intereses', value: result.totalInterest, tone: 'accent' },
            ]}
          />
          <ul className="legend">
            <li>
              <span className="legend__dot legend__dot--brand" /> Capital {formatCOP(simulation.amount)}
            </li>
            <li>
              <span className="legend__dot legend__dot--accent" /> Intereses {formatCOP(result.totalInterest)}
            </li>
          </ul>
        </Card>

        <Card title="Comparado con tu cuota de referencia">
          <p>
            Tu cuota de referencia es <strong>{formatCOP(reference)}</strong> (flujo neto menos tu margen de {profile.safetyMarginPct} %).
          </p>
          {result.payment <= reference ? (
            <p className="alert alert--ok">La cuota simulada está dentro de tu cuota de referencia.</p>
          ) : (
            <p className="alert alert--warn">
              La cuota simulada supera tu referencia en {formatCOP(result.payment - reference)}. Prueba con un monto menor o más plazo
              (ojo: más plazo significa más intereses en total).
            </p>
          )}
        </Card>
      </div>

      <Card tone="soft" title="Ten en cuenta">
        <ul className="bullets">
          <li>Este es un prototipo con datos ficticios. Cupo de Caja no presta dinero ni aprueba créditos.</li>
          <li>La simulación no incluye seguros, comisiones, IVA ni otros cargos que una entidad real podría cobrar.</li>
          <li>Compara siempre la tasa efectiva anual (E.A.) y el costo total antes de tomar una decisión.</li>
        </ul>
      </Card>
    </>
  )
}
