import { useMemo, useState } from 'react'
import { FieldShell, MoneyField, TextField } from '../components/fields'
import { Button, Card, PageHeader } from '../components/ui'
import { formatCOP, formatDate, todayISO } from '../lib/format'
import { EXPENSE_CATEGORIES, SALE_CATEGORIES } from '../lib/sampleData'
import type { MovementType } from '../lib/types'
import { MAX_DESCRIPTION, validateMovement, type MovementDraft, type MovementErrors } from '../lib/validation'
import { useAppState } from '../state/AppState'

type Filter = 'todos' | MovementType

const emptyDraft = (type: MovementType = 'venta'): MovementDraft => ({
  type,
  description: '',
  amount: null,
  date: todayISO(),
  category: (type === 'venta' ? SALE_CATEGORIES : EXPENSE_CATEGORIES)[0],
})

export function Actividad() {
  const { movements, addMovement, removeMovement } = useAppState()
  const [draft, setDraft] = useState<MovementDraft>(() => emptyDraft())
  const [errors, setErrors] = useState<MovementErrors>({})
  const [formKey, setFormKey] = useState(0)
  const [saved, setSaved] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('todos')

  const sorted = useMemo(
    () => movements.filter((m) => filter === 'todos' || m.type === filter).sort((a, b) => b.date.localeCompare(a.date)),
    [movements, filter],
  )
  const categories = draft.type === 'venta' ? SALE_CATEGORIES : EXPENSE_CATEGORIES

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateMovement(draft, todayISO())
    setErrors(found)
    if (Object.keys(found).length > 0) return
    addMovement({ ...draft, description: draft.description.trim(), amount: draft.amount! })
    setSaved(`${draft.type === 'venta' ? 'Venta registrada' : 'Gasto registrado'}: ${formatCOP(draft.amount!)}`)
    setDraft(emptyDraft(draft.type))
    setFormKey((k) => k + 1)
  }

  return (
    <>
      <PageHeader eyebrow="Actividad" title="Ventas y gastos" description="Anota cada movimiento. Tus métricas del mes en Inicio se actualizan al instante." />
      <div className="grid-2 grid-2--form">
        <Card title="Nuevo movimiento">
          <form onSubmit={submit} noValidate className="form-grid" key={formKey}>
            <div className="segmented" role="radiogroup" aria-label="Tipo de movimiento">
              {(['venta', 'gasto'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={draft.type === t}
                  className={`segmented__opt ${draft.type === t ? 'is-active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, type: t, category: (t === 'venta' ? SALE_CATEGORIES : EXPENSE_CATEGORIES)[0] }))}
                >
                  {t === 'venta' ? 'Venta' : 'Gasto'}
                </button>
              ))}
            </div>
            <TextField
              label="Descripción"
              value={draft.description}
              maxLength={MAX_DESCRIPTION + 10}
              placeholder={draft.type === 'venta' ? 'Ej.: ventas del día' : 'Ej.: pedido de gaseosas'}
              error={errors.description}
              hint={`${draft.description.trim().length}/${MAX_DESCRIPTION}`}
              onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
            />
            <MoneyEntry error={errors.amount} onChange={(amount) => setDraft((d) => ({ ...d, amount }))} />
            <div className="form-row">
              <DateField value={draft.date} error={errors.date} onChange={(date) => setDraft((d) => ({ ...d, date }))} />
              <CategoryField value={draft.category} options={categories} error={errors.category} onChange={(category) => setDraft((d) => ({ ...d, category }))} />
            </div>
            <Button type="submit">Guardar {draft.type}</Button>
            {saved && (
              <p className="alert alert--ok" role="status">
                {saved}
              </p>
            )}
          </form>
        </Card>

        <Card
          title="Movimientos"
          subtitle={`${sorted.length} ${sorted.length === 1 ? 'registro' : 'registros'}`}
          action={
            <label className="select-inline">
              <span className="sr-only">Filtrar</span>
              <select className="input input--sm" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
                <option value="todos">Todos</option>
                <option value="venta">Ventas</option>
                <option value="gasto">Gastos</option>
              </select>
            </label>
          }
        >
          {sorted.length === 0 ? (
            <p className="empty">No hay movimientos con este filtro.</p>
          ) : (
            <ul className="movements">
              {sorted.map((m) => (
                <li key={m.id} className="movement">
                  <span className={`movement__icon movement__icon--${m.type}`} aria-hidden="true">
                    {m.type === 'venta' ? '↑' : '↓'}
                  </span>
                  <div className="movement__body">
                    <span className="movement__desc">{m.description}</span>
                    <span className="movement__meta">
                      {m.category} · {formatDate(m.date)}
                    </span>
                  </div>
                  <span className={`movement__amount movement__amount--${m.type}`}>
                    {m.type === 'venta' ? '+' : '−'}
                    {formatCOP(m.amount)}
                  </span>
                  <button type="button" className="icon-btn" aria-label={`Eliminar ${m.description}`} onClick={() => removeMovement(m.id)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}

/** Monto libre (sin rango mínimo del simulador); el error lo decide `validateMovement`. */
function MoneyEntry({ error, onChange }: { error?: string; onChange: (v: number | null) => void }) {
  return (
    <MoneyField
      label="Monto"
      value={0}
      range={{ min: 0, max: Number.MAX_SAFE_INTEGER, integer: true, label: 'El monto' }}
      externalError={error}
      onRawChange={onChange}
    />
  )
}

function DateField({ value, error, onChange }: { value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <FieldShell id="mov-date" label="Fecha" error={error}>
      <input id="mov-date" type="date" className="input" value={value} max={todayISO()} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
    </FieldShell>
  )
}

function CategoryField({ value, options, error, onChange }: { value: string; options: string[]; error?: string; onChange: (v: string) => void }) {
  return (
    <FieldShell id="mov-cat" label="Categoría" error={error}>
      <select id="mov-cat" className="input" value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </FieldShell>
  )
}
