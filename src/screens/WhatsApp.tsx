import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MoneyField } from '../components/fields'
import { Button, ProgressBar } from '../components/ui'
import { formatCOP, formatDate, todayISO } from '../lib/format'
import { buildOffer, estimateDailySales, OFFER_ASSUMPTIONS, SALES_RANGES, type Offer } from '../lib/offer'
import type { AppView, BusinessKind, CreditRequest } from '../lib/types'
import { validateRange } from '../lib/validation'
import { useAppState } from '../state/AppState'
import type { ChatDraft } from '../state/chat'

const STEPS = ['Bienvenida', 'Solicitud', 'Información del negocio', 'Oferta simulada', 'Confirmación', 'Seguimiento'] as const

const AMOUNT_OPTIONS = [
  { id: '500000', label: '$500.000', value: 500_000 },
  { id: '1000000', label: '$1.000.000', value: 1_000_000 },
  { id: '2000000', label: '$2.000.000', value: 2_000_000 },
  { id: 'otro', label: 'Otro monto', value: null },
]
const PURPOSES = ['Comprar inventario', 'Cubrir gastos del negocio', 'Mejorar el local', 'Otro']
const BUSINESS_TYPES: BusinessKind[] = ['Tienda', 'Restaurante', 'Puesto de mercado', 'Otro']
const CUSTOM_RANGE = { min: OFFER_ASSUMPTIONS.minAmount, max: OFFER_ASSUMPTIONS.maxAmount, integer: true, label: 'El monto', unit: 'COP' }

const STEP_NOTES: Record<ChatDraft['step'], string> = {
  1: 'Cupo de Caja se presenta y explica el beneficio. El comerciante responde con botones rápidos.',
  2: 'El comerciante indica cuánto necesita y para qué. Selección única, sin escribir.',
  3: 'Preguntas simples sobre el negocio. Las ventas se pueden elegir por rango o escribir a mano.',
  4: `Oferta simulada: cuota fija semanal a ${OFFER_ASSUMPTIONS.weeks} semanas con ${OFFER_ASSUMPTIONS.annualRatePct} % E.A. ilustrativo. El monto se ajusta si la cuota supera el ${OFFER_ASSUMPTIONS.maxPaymentShare * 100} % de las ventas semanales declaradas.`,
  5: 'La solicitud aparece en el panel del aliado con estado «En revisión». Nada se envía a un servidor.',
  6: 'El seguimiento refleja la decisión simulada del panel del aliado: apruébala o recházala allí para ver cada caso.',
}

export function WhatsApp({ onView }: { onView: (v: AppView) => void }) {
  const { chat, updateChat, resetChat, profile, requests, addRequest } = useAppState()
  const [showMore, setShowMore] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const dailySales = estimateDailySales(chat.salesRange, chat.manualSales)
  const offer = useMemo(
    () => (chat.amount && dailySales > 0 ? buildOffer(chat.amount, dailySales, todayISO()) : null),
    [chat.amount, dailySales],
  )
  const request = requests.find((r) => r.id === chat.requestId) ?? null

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [chat.step, showMore, showSchedule, request?.status, request?.paidInstallments])

  const go = (step: ChatDraft['step']) => {
    setShowSchedule(false)
    updateChat({ step })
  }

  const confirm = () => {
    if (!offer || !chat.businessType || !chat.purpose) return
    const id = addRequest({
      name: profile.ownerName || 'Comerciante demo',
      businessName: profile.businessName || 'Mi negocio',
      businessType: chat.businessType,
      amount: offer.amount,
      purpose: chat.purpose,
      dailySales,
      dailyExpenses: Math.round((dailySales * OFFER_ASSUMPTIONS.expenseRatio) / 1000) * 1000,
      weeks: offer.weeks,
      status: 'revision',
      createdAt: todayISO(),
      source: 'whatsapp',
      paidInstallments: 0,
    })
    updateChat({ step: 5, requestId: id })
  }

  return (
    <div className="wa-layout">
      <div className="wa-side">
        <p className="page-header__eyebrow">Experiencia en WhatsApp · simulada</p>
        <h1 className="page-header__title">Así lo viviría el comerciante</h1>
        <p className="muted">Interfaz de chat de demostración. No hay integración con WhatsApp ni se envían mensajes reales.</p>
        <ol className="steps" aria-label="Pasos del flujo">
          {STEPS.map((name, i) => {
            const n = i + 1
            return (
              <li key={name} className={`steps__item ${n === chat.step ? 'is-current' : ''} ${n < chat.step ? 'is-done' : ''}`}>
                <span className="steps__num">{n < chat.step ? '✓' : n}</span>
                {name}
              </li>
            )
          })}
        </ol>
        <p className="hint-box">{STEP_NOTES[chat.step]}</p>
        <div className="card__actions">
          <Button variant="secondary" onClick={() => { resetChat(); setShowMore(false) }}>
            Reiniciar chat
          </Button>
          <Button variant="ghost" onClick={() => onView('aliado')}>
            Ver panel del aliado
          </Button>
        </div>
      </div>

      <div className="phone" aria-label="Simulación de chat de WhatsApp">
        <div className="phone__status" aria-hidden="true">
          <span>9:41</span>
          <span>●●● ▮</span>
        </div>
        <header className="wa-header">
          <span className="wa-header__back" aria-hidden="true">←</span>
          <span className="wa-avatar" aria-hidden="true">CC</span>
          <div>
            <strong>Cupo de Caja</strong>
            <span className="wa-header__sub">en línea · demo</span>
          </div>
        </header>

        <div className="wa-chat" ref={scrollRef} aria-live="polite">
          <p className="wa-day">Hoy</p>

          {/* 1. Bienvenida */}
          <Bot>
            ¡Hola{profile.ownerName ? `, ${profile.ownerName}` : ''}! 👋 Soy Cupo de Caja, una plataforma que te ayuda a acceder a financiación
            de un aliado financiero para tu negocio, de forma sencilla.
          </Bot>
          <Bot>Te hago unas preguntas cortas para entender tu negocio y mostrarte una opción simulada. ¿Te gustaría empezar?</Bot>
          {showMore && (
            <Bot>
              Cupo de Caja no presta dinero: organiza tu información y la comparte con un aliado, que es quien decide. En este prototipo
              todo es ficticio y nada se envía.
            </Bot>
          )}
          {chat.step === 1 ? (
            <QuickReplies>
              <Button onClick={() => go(2)}>Sí, empezar</Button>
              {!showMore && (
                <Button variant="secondary" onClick={() => setShowMore(true)}>
                  Quiero saber más
                </Button>
              )}
            </QuickReplies>
          ) : (
            <Me>Sí, empezar</Me>
          )}

          {/* 2. Solicitud */}
          {chat.step >= 2 && <StepSolicitud chat={chat} active={chat.step === 2} onChange={updateChat} onNext={() => go(3)} />}

          {/* 3. Información del negocio */}
          {chat.step >= 3 && <StepNegocio chat={chat} active={chat.step === 3} onChange={updateChat} onNext={() => go(4)} />}

          {/* 4. Oferta */}
          {chat.step >= 4 && offer && (
            <>
              <Bot>Con la información que nos diste, esta es una opción simulada para tu negocio:</Bot>
              <OfferCard offer={offer} />
              {showSchedule && <ScheduleList offer={offer} />}
              {chat.step === 4 ? (
                <QuickReplies>
                  <Button variant="accent" onClick={() => setShowSchedule((v) => !v)}>
                    {showSchedule ? 'Ocultar calendario' : 'Ver calendario de pagos'}
                  </Button>
                  <Button onClick={confirm}>Quiero continuar</Button>
                  <Button variant="ghost" onClick={() => go(2)}>
                    Cambiar mis respuestas
                  </Button>
                </QuickReplies>
              ) : (
                <Me>Quiero continuar</Me>
              )}
            </>
          )}

          {/* 5. Confirmación */}
          {chat.step >= 5 && (
            <>
              <Bot>
                ¡Listo! 🎉 Tu solicitud fue enviada al aliado financiero <em>(simulado)</em>. Normalmente recibirías una respuesta en menos de
                24 horas.
              </Bot>
              <div className="wa-card wa-card--center">
                <span className="wa-clock" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <strong>Solicitud en revisión</strong>
                <p className="muted">Te avisaríamos por aquí cuando el aliado tome una decisión.</p>
              </div>
              {chat.step === 5 ? (
                <QuickReplies>
                  <Button onClick={() => go(6)}>Ver estado de mi solicitud</Button>
                </QuickReplies>
              ) : (
                <Me>Ver estado de mi solicitud</Me>
              )}
            </>
          )}

          {/* 6. Seguimiento */}
          {chat.step === 6 && <StepSeguimiento request={request} onView={onView} onRestart={() => { resetChat(); setShowMore(false) }} />}
        </div>

        <div className="wa-input" aria-hidden="true">
          <span className="wa-input__field">Usa los botones de respuesta rápida</span>
          <span className="wa-input__mic">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}

function Bot({ children }: { children: ReactNode }) {
  return <div className="bubble bubble--bot">{children}</div>
}

function Me({ children }: { children: ReactNode }) {
  return <div className="bubble bubble--me">{children}</div>
}

function QuickReplies({ children }: { children: ReactNode }) {
  return <div className="quick-replies">{children}</div>
}

function OptionList<T extends string>({
  name,
  options,
  value,
  onSelect,
  disabled,
}: {
  name: string
  options: { id: T; label: string }[]
  value: T | null
  onSelect: (id: T) => void
  disabled?: boolean
}) {
  return (
    <div className="wa-options" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          disabled={disabled}
          className={`wa-option ${value === o.id ? 'is-selected' : ''}`}
          onClick={() => onSelect(o.id)}
        >
          <span className="wa-option__radio" aria-hidden="true" />
          {o.label}
        </button>
      ))}
    </div>
  )
}

function StepSolicitud({
  chat,
  active,
  onChange,
  onNext,
}: {
  chat: ChatDraft
  active: boolean
  onChange: (p: Partial<ChatDraft>) => void
  onNext: () => void
}) {
  const customError = chat.amountOption === 'otro' ? validateRange(chat.amount, CUSTOM_RANGE) : null
  const valid = !!chat.amountOption && !!chat.amount && !customError && !!chat.purpose

  if (!active) {
    return (
      <>
        <Bot>¿Cuánto necesitas para tu negocio? ¿Para qué vas a usar este dinero?</Bot>
        <Me>
          {formatCOP(chat.amount ?? 0)} · {chat.purpose}
        </Me>
      </>
    )
  }
  return (
    <>
      <Bot>¿Cuánto necesitas para tu negocio?</Bot>
      <OptionList
        name="Monto"
        options={AMOUNT_OPTIONS}
        value={chat.amountOption}
        onSelect={(id) => onChange({ amountOption: id, amount: AMOUNT_OPTIONS.find((o) => o.id === id)?.value ?? null })}
      />
      {chat.amountOption === 'otro' && (
        <div className="wa-card">
          <MoneyField
            label="¿Cuánto necesitas?"
            hint="Entre $100.000 y $5.000.000"
            value={chat.amount ?? 0}
            range={CUSTOM_RANGE}
            externalError={chat.amount !== null ? (customError ?? undefined) : undefined}
            onRawChange={(v) => onChange({ amount: v })}
          />
        </div>
      )}
      <Bot>¿Para qué vas a usar este dinero?</Bot>
      <OptionList name="Uso" options={PURPOSES.map((p) => ({ id: p, label: p }))} value={chat.purpose} onSelect={(id) => onChange({ purpose: id })} />
      <QuickReplies>
        <Button disabled={!valid} onClick={onNext}>
          Continuar
        </Button>
      </QuickReplies>
    </>
  )
}

function StepNegocio({
  chat,
  active,
  onChange,
  onNext,
}: {
  chat: ChatDraft
  active: boolean
  onChange: (p: Partial<ChatDraft>) => void
  onNext: () => void
}) {
  const [manual, setManual] = useState(chat.manualSales !== null)
  const manualError = manual ? validateRange(chat.manualSales, { min: 10_000, max: 50_000_000, integer: true, label: 'Las ventas', unit: 'COP' }) : null
  const valid = !!chat.businessType && (manual ? !manualError : !!chat.salesRange)

  if (!active) {
    const sales = chat.manualSales ? formatCOP(chat.manualSales) : SALES_RANGES.find((r) => r.id === chat.salesRange)?.label
    return (
      <>
        <Bot>Cuéntame un poco sobre tu negocio: ¿qué tipo de negocio tienes y cuánto vendes normalmente en un día?</Bot>
        <Me>
          {chat.businessType} · {sales} al día
        </Me>
      </>
    )
  }
  return (
    <>
      <Bot>Cuéntame un poco sobre tu negocio. ¿Qué tipo de negocio tienes?</Bot>
      <OptionList
        name="Tipo de negocio"
        options={BUSINESS_TYPES.map((b) => ({ id: b, label: b }))}
        value={chat.businessType}
        onSelect={(id) => onChange({ businessType: id })}
      />
      <Bot>¿Cuánto vendes normalmente en un día?</Bot>
      {manual ? (
        <div className="wa-card">
          <MoneyField
            label="Ventas en un día normal"
            value={chat.manualSales ?? 0}
            range={{ min: 0, max: Number.MAX_SAFE_INTEGER, label: 'Las ventas' }}
            externalError={chat.manualSales !== null ? (manualError ?? undefined) : undefined}
            onRawChange={(v) => onChange({ manualSales: v })}
          />
        </div>
      ) : (
        <OptionList name="Ventas diarias" options={[...SALES_RANGES]} value={chat.salesRange} onSelect={(id) => onChange({ salesRange: id })} />
      )}
      <button
        type="button"
        className="link-btn"
        onClick={() => {
          setManual((m) => !m)
          onChange({ manualSales: null })
        }}
      >
        {manual ? 'Prefiero elegir un rango' : 'Prefiero escribir el valor'}
      </button>
      <QuickReplies>
        <Button disabled={!valid} onClick={onNext}>
          Ver mi opción
        </Button>
      </QuickReplies>
    </>
  )
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <div className="wa-card offer">
      <p className="offer__amount">{formatCOP(offer.amount)}</p>
      <p className="offer__caption">Monto de la opción simulada</p>
      {offer.capped && (
        <p className="alert alert--warn">
          Pediste {formatCOP(offer.requested)}. Ajustamos el monto para que la cuota no supere el{' '}
          {OFFER_ASSUMPTIONS.maxPaymentShare * 100} % de tus ventas semanales.
        </p>
      )}
      <ul className="offer__rows">
        <li>
          <span className="offer__icon" aria-hidden="true">⟳</span>
          <div>
            <strong>{formatCOP(offer.totalPaid)}</strong>
            <span>Total a pagar · incluye {formatCOP(offer.totalInterest)} de intereses</span>
          </div>
        </li>
        <li>
          <span className="offer__icon" aria-hidden="true">▦</span>
          <div>
            <strong>{offer.weeks} semanas</strong>
            <span>Plazo</span>
          </div>
        </li>
        <li>
          <span className="offer__icon" aria-hidden="true">$</span>
          <div>
            <strong>{formatCOP(offer.payment)}</strong>
            <span>Cuota semanal fija</span>
          </div>
        </li>
        <li>
          <span className="offer__icon" aria-hidden="true">◷</span>
          <div>
            <strong>Primera cuota: {formatDate(offer.firstDueDate)}</strong>
            <span>Tasa ilustrativa {offer.annualRatePct} % E.A.</span>
          </div>
        </li>
      </ul>
      <p className="offer__legal">Simulación sin validez comercial. No es una oferta real ni una aprobación.</p>
    </div>
  )
}

function ScheduleList({ offer, paid = 0 }: { offer: Offer; paid?: number }) {
  return (
    <div className="wa-card">
      <strong>Calendario de pagos</strong>
      <ol className="schedule">
        {offer.schedule.map((row, i) => (
          <li key={row.month} className={i < paid ? 'is-paid' : ''}>
            <span>
              Cuota {row.month} · {formatDate(offer.dueDates[i])}
            </span>
            <strong>{i < paid ? 'Pagada' : formatCOP(row.payment)}</strong>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StepSeguimiento({ request, onView, onRestart }: { request: CreditRequest | null; onView: (v: AppView) => void; onRestart: () => void }) {
  const { addMovement, markInstallmentPaid } = useAppState()
  const [showSchedule, setShowSchedule] = useState(false)
  const [saleOpen, setSaleOpen] = useState(false)
  const [sale, setSale] = useState<number | null>(null)
  const [saleError, setSaleError] = useState<string | undefined>()
  const [savedSale, setSavedSale] = useState<number | null>(null)

  if (!request) {
    return (
      <>
        <Bot>No encontramos la solicitud (quizás se restablecieron los datos de la demo).</Bot>
        <QuickReplies>
          <Button onClick={onRestart}>Empezar de nuevo</Button>
        </QuickReplies>
      </>
    )
  }

  if (request.status === 'revision') {
    return (
      <>
        <Bot>Tu solicitud sigue en revisión. 🕑</Bot>
        <Bot>
          <em>Demo:</em> abre el panel del aliado y aprueba o rechaza la solicitud de {request.name} para ver cómo cambia este seguimiento.
        </Bot>
        <QuickReplies>
          <Button variant="secondary" onClick={() => onView('aliado')}>
            Ir al panel del aliado
          </Button>
        </QuickReplies>
      </>
    )
  }

  if (request.status === 'rechazada') {
    return (
      <>
        <Bot>
          El aliado no aprobó esta solicitud <em>(decisión simulada)</em>. Puedes seguir registrando tus ventas: un historial más completo
          ayuda a entender mejor tu negocio.
        </Bot>
        <QuickReplies>
          <Button onClick={onRestart}>Empezar de nuevo</Button>
        </QuickReplies>
      </>
    )
  }

  const offer = buildOffer(request.amount, request.dailySales, request.createdAt)
  const paidAmount = offer.schedule.slice(0, request.paidInstallments).reduce((s, r) => s + r.payment, 0)
  const remaining = Math.max(0, offer.totalPaid - paidAmount)
  const done = request.paidInstallments >= offer.weeks
  const next = done ? null : offer.schedule[request.paidInstallments]

  const saveSale = () => {
    if (!sale || sale <= 0) {
      setSaleError('Ingresa un monto mayor que cero.')
      return
    }
    addMovement({ type: 'venta', description: 'Venta del día (WhatsApp)', amount: sale, date: todayISO(), category: 'Ventas de mostrador' })
    setSavedSale(sale)
    setSale(null)
    setSaleOpen(false)
  }

  return (
    <>
      <Bot>
        ¡Buenas noticias! El aliado aprobó tu solicitud <em>(simulado)</em>. Así va tu crédito:
      </Bot>
      <div className="wa-card">
        <p className="offer__amount offer__amount--sm">{formatCOP(request.amount)}</p>
        <p className="offer__caption">Monto inicial</p>
        <ProgressBar value={paidAmount} max={offer.totalPaid} label="Progreso de pago" />
        <div className="split-row">
          <div>
            <span className="muted">Pagado</span>
            <strong>{formatCOP(paidAmount)}</strong>
          </div>
          <div className="text-right">
            <span className="muted">Faltante</span>
            <strong>{formatCOP(remaining)}</strong>
          </div>
        </div>
        {next ? (
          <div className="split-row split-row--boxed">
            <div>
              <span className="muted">Próxima cuota</span>
              <strong>{formatDate(offer.dueDates[request.paidInstallments])}</strong>
            </div>
            <strong className="big-num">{formatCOP(next.payment)}</strong>
          </div>
        ) : (
          <p className="alert alert--ok">¡Completaste todas las cuotas de la demo! 🎉</p>
        )}
      </div>
      {showSchedule && <ScheduleList offer={offer} paid={request.paidInstallments} />}
      {savedSale !== null && <Me>Registré una venta de {formatCOP(savedSale)}</Me>}
      {savedSale !== null && <Bot>¡Anotado! La verás en la sección Actividad de la vista web. ✅</Bot>}
      {saleOpen && (
        <div className="wa-card">
          <MoneyField label="¿Cuánto vendiste hoy?" value={0} range={{ min: 0, max: Number.MAX_SAFE_INTEGER, label: 'La venta' }} externalError={saleError} onRawChange={(v) => { setSale(v); setSaleError(undefined) }} />
          <QuickReplies>
            <Button onClick={saveSale}>Guardar venta</Button>
          </QuickReplies>
        </div>
      )}
      <QuickReplies>
        <Button variant="secondary" onClick={() => setShowSchedule((v) => !v)}>
          {showSchedule ? 'Ocultar calendario' : 'Ver calendario completo'}
        </Button>
        {!saleOpen && <Button onClick={() => { setSaleOpen(true); setSavedSale(null) }}>Registrar venta de hoy</Button>}
        {!done && (
          <Button variant="ghost" onClick={() => markInstallmentPaid(request.id)}>
            Marcar cuota como pagada (demo)
          </Button>
        )}
      </QuickReplies>
    </>
  )
}
