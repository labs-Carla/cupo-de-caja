import { useState } from 'react'
import { Badge, Button, Stat } from '../components/ui'
import { formatCOP, formatDate, formatPct } from '../lib/format'
import { buildOffer, OFFER_ASSUMPTIONS } from '../lib/offer'
import { STATUS_LABEL } from '../lib/requests'
import type { AppView, CreditRequest, RequestStatus } from '../lib/types'
import { useAppState } from '../state/AppState'

type Section = 'solicitudes' | 'comerciantes' | 'creditos' | 'reportes'
type Tab = 'todas' | RequestStatus
type DetailTab = 'resumen' | 'negocio' | 'ventas' | 'documentos'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'comerciantes', label: 'Comerciantes' },
  { id: 'creditos', label: 'Créditos' },
  { id: 'reportes', label: 'Reportes' },
]

export function PanelAliado({ onView }: { onView: (v: AppView) => void }) {
  const { requests, resetChat } = useAppState()
  const [section, setSection] = useState<Section>('solicitudes')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = requests.find((r) => r.id === selectedId) ?? null

  return (
    <div className="panel">
      <aside className="panel__side">
        <p className="panel__brand">
          <span className="wa-avatar wa-avatar--sm" aria-hidden="true">CC</span> Cupo de Caja
        </p>
        <nav aria-label="Panel del aliado">
          <ul className="panel__nav">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`panel__nav-item ${section === s.id ? 'is-active' : ''}`}
                  aria-current={section === s.id ? 'page' : undefined}
                  onClick={() => {
                    setSection(s.id)
                    setSelectedId(null)
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="panel__main">
        <div className="panel__topbar">
          <span className="muted">{selected ? 'Detalle de solicitud' : 'Lista de solicitudes'}</span>
          <span className="panel__user">
            <span className="panel__user-avatar" aria-hidden="true">ES</span> Equipo Cupo de Caja (demo)
          </span>
        </div>

        {section !== 'solicitudes' ? (
          <div className="panel__empty">
            <h2>{SECTIONS.find((s) => s.id === section)?.label}</h2>
            <p className="muted">Esta sección está fuera del alcance del prototipo.</p>
          </div>
        ) : selected ? (
          <RequestDetail request={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <RequestList
            requests={requests}
            onOpen={setSelectedId}
            onNew={() => {
              resetChat()
              onView('whatsapp')
            }}
          />
        )}
      </div>
    </div>
  )
}

function RequestList({ requests, onOpen, onNew }: { requests: CreditRequest[]; onOpen: (id: string) => void; onNew: () => void }) {
  const [tab, setTab] = useState<Tab>('todas')
  const count = (t: Tab) => (t === 'todas' ? requests.length : requests.filter((r) => r.status === t).length)
  const visible = requests.filter((r) => tab === 'todas' || r.status === tab)
  const tabs: { id: Tab; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'revision', label: 'En revisión' },
    { id: 'aprobada', label: 'Aprobadas' },
    { id: 'rechazada', label: 'Rechazadas' },
  ]

  return (
    <>
      <div className="panel__head">
        <h1 className="panel__title">Solicitudes</h1>
        <Button onClick={onNew}>+ Nueva solicitud</Button>
      </div>
      <div className="tabs" role="tablist" aria-label="Filtrar por estado">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tabs__tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} ({count(t.id)})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">No hay solicitudes en este estado.</p>
      ) : (
        <>
          <table className="table table--panel">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Negocio</th>
                <th scope="col">Monto</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="table__row-link" onClick={() => onOpen(r.id)}>
                  <td>
                    <button type="button" className="link-btn" onClick={(e) => { e.stopPropagation(); onOpen(r.id) }}>
                      {r.name}
                    </button>
                    {r.source === 'whatsapp' && <span className="tag">WhatsApp</span>}
                  </td>
                  <td>{r.businessType}</td>
                  <td>{formatCOP(r.amount)}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>
                    <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="request-cards">
            {visible.map((r) => (
              <li key={r.id}>
                <button type="button" className="request-card" onClick={() => onOpen(r.id)}>
                  <span className="request-card__top">
                    <strong>{r.name}</strong>
                    <Badge tone={r.status}>{STATUS_LABEL[r.status]}</Badge>
                  </span>
                  <span className="muted">
                    {r.businessType} · {formatDate(r.createdAt)}
                    {r.source === 'whatsapp' && ' · WhatsApp'}
                  </span>
                  <span className="request-card__amount">{formatCOP(r.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function RequestDetail({ request, onBack }: { request: CreditRequest; onBack: () => void }) {
  const { setRequestStatus } = useAppState()
  const [tab, setTab] = useState<DetailTab>('resumen')
  const offer = buildOffer(request.amount, request.dailySales, request.createdAt)
  const weeklySales = request.dailySales * OFFER_ASSUMPTIONS.workingDaysPerWeek
  const dailyMargin = request.dailySales - request.dailyExpenses
  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'negocio', label: 'Información del negocio' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'documentos', label: 'Documentos' },
  ]

  return (
    <>
      <button type="button" className="link-btn" onClick={onBack}>
        ← Volver a solicitudes
      </button>
      <div className="panel__head">
        <h1 className="panel__title">
          {request.name} <Badge tone={request.status}>{STATUS_LABEL[request.status]}</Badge>
        </h1>
      </div>

      <div className="tabs" role="tablist" aria-label="Secciones de la solicitud">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tabs__tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="tile-grid">
          <Tile><Stat size="lg" label="Monto solicitado" value={formatCOP(request.amount)} /></Tile>
          <Tile><Stat label="Tipo de negocio" value={request.businessType} /></Tile>
          <Tile><Stat label="Plazo propuesto" value={`${request.weeks} semanas`} /></Tile>
          <Tile><Stat label="Ventas promedio diarias" value={formatCOP(request.dailySales)} /></Tile>
          <Tile><Stat label="Gastos estimados diarios" value={formatCOP(request.dailyExpenses)} /></Tile>
          <Tile><Stat label="Cuota semanal sugerida" value={formatCOP(offer.payment)} hint={`${formatPct(offer.payment / weeklySales)} de las ventas semanales`} /></Tile>
          <Tile wide><Stat label="Uso del crédito" value={request.purpose} /></Tile>
        </div>
      )}
      {tab === 'negocio' && (
        <dl className="dl">
          <dt>Comerciante</dt><dd>{request.name}</dd>
          <dt>Negocio</dt><dd>{request.businessName}</dd>
          <dt>Tipo</dt><dd>{request.businessType}</dd>
          <dt>Canal</dt><dd>{request.source === 'whatsapp' ? 'WhatsApp (simulado)' : 'Dato de ejemplo'}</dd>
          <dt>Fecha de solicitud</dt><dd>{formatDate(request.createdAt)}</dd>
        </dl>
      )}
      {tab === 'ventas' && (
        <div className="tile-grid">
          <Tile><Stat label="Ventas semanales estimadas" value={formatCOP(weeklySales)} hint={`${OFFER_ASSUMPTIONS.workingDaysPerWeek} días de trabajo`} /></Tile>
          <Tile><Stat label="Margen diario estimado" value={formatCOP(dailyMargin)} tone={dailyMargin > 0 ? 'positive' : 'negative'} /></Tile>
          <Tile><Stat label="Total a pagar (simulado)" value={formatCOP(offer.totalPaid)} hint={`${OFFER_ASSUMPTIONS.annualRatePct} % E.A. ilustrativo`} /></Tile>
          <p className="muted tile-grid__note">Cifras declaradas por el comerciante o de ejemplo. El prototipo no verifica ventas.</p>
        </div>
      )}
      {tab === 'documentos' && (
        <div className="panel__empty">
          <p className="muted">El prototipo no recibe ni almacena documentos.</p>
        </div>
      )}

      <div className="decision">
        <p className="muted">Decisión simulada: solo cambia el estado en este navegador. No evalúa riesgo ni desembolsa dinero.</p>
        <div className="decision__actions">
          {request.status === 'revision' ? (
            <>
              <Button variant="danger" onClick={() => setRequestStatus(request.id, 'rechazada')}>Rechazar</Button>
              <Button onClick={() => setRequestStatus(request.id, 'aprobada')}>Aprobar</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setRequestStatus(request.id, 'revision')}>Volver a «En revisión»</Button>
          )}
        </div>
      </div>
    </>
  )
}

function Tile({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`tile ${wide ? 'tile--wide' : ''}`}>{children}</div>
}
