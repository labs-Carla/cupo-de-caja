import { MoneyField, SliderField, TextField } from '../components/fields'
import { Button, Card, PageHeader, Stat } from '../components/ui'
import { formatCOP, formatMonth } from '../lib/format'
import { LIMITS } from '../lib/validation'
import { useAppState } from '../state/AppState'
import { useDerived } from '../state/useDerived'

export function Perfil() {
  const { profile, updateProfile } = useAppState()
  const { net, reference, month } = useDerived()
  const margin = Math.max(0, net - reference)

  return (
    <>
      <PageHeader
        eyebrow="Perfil de caja"
        title="¿Cómo se mueve tu plata cada mes?"
        description="Usa promedios aproximados. Con esto calculamos tu flujo neto y una cuota de referencia que no ahogue tu negocio."
      />
      <div className="grid-2 grid-2--form">
        <Card title="Tu negocio">
          <div className="form-grid">
            <TextField label="Tu nombre" value={profile.ownerName} maxLength={40} onChange={(v) => updateProfile({ ownerName: v })} />
            <TextField label="Nombre del negocio" value={profile.businessName} maxLength={50} onChange={(v) => updateProfile({ businessName: v })} />
            <TextField label="Tipo de negocio" value={profile.businessType} maxLength={40} placeholder="Tienda, restaurante…" onChange={(v) => updateProfile({ businessType: v })} />
            <MoneyField
              label="Ventas promedio al mes"
              value={profile.monthlySales}
              range={{ ...LIMITS.monthlyMoney, label: 'Las ventas' }}
              onChange={(v) => updateProfile({ monthlySales: v })}
            />
            <MoneyField
              label="Gastos promedio al mes"
              hint="Inventario, arriendo, servicios, nómina…"
              value={profile.monthlyExpenses}
              range={{ ...LIMITS.monthlyMoney, label: 'Los gastos' }}
              onChange={(v) => updateProfile({ monthlyExpenses: v })}
            />
            <SliderField
              label="Margen de seguridad"
              hint="Parte del flujo neto que prefieres no comprometer."
              value={profile.safetyMarginPct}
              range={LIMITS.safetyMarginPct}
              step={5}
              suffix="%"
              onChange={(v) => updateProfile({ safetyMarginPct: v })}
            />
          </div>
          {month.month && (
            <div className="card__actions">
              <Button
                variant="ghost"
                onClick={() => updateProfile({ monthlySales: month.sales, monthlyExpenses: month.expenses })}
              >
                Usar lo registrado en {formatMonth(month.month)}
              </Button>
            </div>
          )}
        </Card>

        <div className="stack">
          <Card tone="brand" title="Tu flujo de caja">
            <div className="stat-grid">
              <Stat tone="inverse" size="lg" label="Flujo neto mensual" value={formatCOP(net)} hint="Ventas − gastos" />
              <Stat tone="inverse" size="lg" label="Cuota de referencia" value={formatCOP(reference)} hint="Lo que podrías destinar a una cuota" />
            </div>
          </Card>
          <Card title="Cómo lo calculamos">
            <ul className="calc-list">
              <li>
                <span>Ventas</span>
                <strong>{formatCOP(profile.monthlySales)}</strong>
              </li>
              <li>
                <span>− Gastos</span>
                <strong>{formatCOP(profile.monthlyExpenses)}</strong>
              </li>
              <li className="calc-list__total">
                <span>= Flujo neto</span>
                <strong>{formatCOP(net)}</strong>
              </li>
              <li>
                <span>− Margen de seguridad ({profile.safetyMarginPct} %)</span>
                <strong>{formatCOP(margin)}</strong>
              </li>
              <li className="calc-list__total">
                <span>= Cuota de referencia</span>
                <strong>{formatCOP(reference)}</strong>
              </li>
            </ul>
            {net <= 0 && (
              <p className="alert alert--warn">
                Tus gastos igualan o superan tus ventas. Antes de pensar en financiación, conviene revisar costos o precios.
              </p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
