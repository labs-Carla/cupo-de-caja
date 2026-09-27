import { Badge, Button, Card, PageHeader, Stat } from '../components/ui'
import { formatCOP, formatMonth, formatPct } from '../lib/format'
import type { AppView, ScreenId } from '../lib/types'
import { useAppState } from '../state/AppState'
import { useDerived } from '../state/useDerived'
import { FIT_LABEL } from './fitCopy'

export function Inicio({ onNavigate, onView }: { onNavigate: (id: ScreenId) => void; onView: (v: AppView) => void }) {
  const { profile, simulation } = useAppState()
  const { month, net, reference, result, ratio, fit } = useDerived()

  return (
    <>
      <PageHeader
        eyebrow={profile.businessName}
        title={`Hola, ${profile.ownerName || 'comerciante'}`}
        description="Así va la caja de tu negocio. Registra tus ventas y gastos para ver con claridad cuánto te queda cada mes."
      />

      <Card
        tone="brand"
        title={month.month ? `Tu mes: ${formatMonth(month.month)}` : 'Aún no hay movimientos'}
        subtitle={`${month.count} movimientos registrados`}
      >
        <div className="stat-grid stat-grid--3">
          <Stat tone="inverse" label="Ventas" value={formatCOP(month.sales)} />
          <Stat tone="inverse" label="Gastos" value={formatCOP(month.expenses)} />
          <Stat tone="inverse" label="Flujo del mes" value={formatCOP(month.net)} />
        </div>
        <div className="card__actions">
          <Button variant="accent" onClick={() => onNavigate('actividad')}>
            Registrar venta o gasto
          </Button>
        </div>
      </Card>

      <div className="grid-2">
        <Card title="Perfil de caja" subtitle="Promedios mensuales que declaraste">
          <div className="stat-grid">
            <Stat label="Flujo neto mensual" value={formatCOP(net)} tone={net >= 0 ? 'positive' : 'negative'} />
            <Stat label="Cuota de referencia" value={formatCOP(reference)} hint={`Después de reservar ${profile.safetyMarginPct} % de margen`} />
          </div>
          <div className="card__actions">
            <Button variant="secondary" onClick={() => onNavigate('perfil')}>
              Ajustar perfil
            </Button>
          </div>
        </Card>

        <Card
          title="Escenario simulado"
          subtitle={`${formatCOP(simulation.amount)} a ${simulation.months} meses · ${String(simulation.annualRatePct).replace('.', ',')} % E.A.`}
          action={<Badge tone={fit}>{FIT_LABEL[fit]}</Badge>}
        >
          <div className="stat-grid">
            <Stat label="Cuota mensual" value={formatCOP(result.payment)} />
            <Stat label="Cuota / flujo neto" value={formatPct(ratio)} />
          </div>
          <div className="card__actions">
            <Button variant="secondary" onClick={() => onNavigate('simulador')}>
              Cambiar escenario
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('resumen')}>
              Ver resumen
            </Button>
          </div>
        </Card>
      </div>

      <Card tone="soft" title="Explora el resto del prototipo">
        <p className="muted">
          Cupo de Caja también se imagina como un asistente por WhatsApp y un panel para el aliado financiero. Ambas vistas son
          simuladas.
        </p>
        <div className="card__actions">
          <Button variant="secondary" onClick={() => onView('whatsapp')}>
            Abrir chat de WhatsApp (demo)
          </Button>
          <Button variant="ghost" onClick={() => onView('aliado')}>
            Ver panel del aliado
          </Button>
        </div>
      </Card>
    </>
  )
}
