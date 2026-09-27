import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  action,
  children,
  tone = 'default',
  className = '',
}: {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  tone?: 'default' | 'brand' | 'soft'
  className?: string
}) {
  return (
    <section className={`card card--${tone} ${className}`}>
      {(title || action) && (
        <header className="card__header">
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
  size = 'md',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'inverse'
  size?: 'md' | 'lg'
}) {
  return (
    <div className={`stat stat--${tone} stat--${size}`}>
      <span className="stat__label">{label}</span>
      <span className="stat__value">{value}</span>
      {hint && <span className="stat__hint">{hint}</span>}
    </div>
  )
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' }) {
  return <button type="button" className={`btn btn--${variant} ${className}`} {...props} />
}

export type BadgeTone = 'holgado' | 'ajustado' | 'exigente' | 'neutral' | 'revision' | 'aprobada' | 'rechazada'

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: ReactNode }) {
  return (
    <div className="page-header">
      {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
      <h1 className="page-header__title">{title}</h1>
      {description && <p className="page-header__desc">{description}</p>}
    </div>
  )
}

export function PrototypeBanner() {
  return (
    <div className="proto-banner" role="note">
      <strong>Prototipo con datos ficticios.</strong> Cupo de Caja no presta dinero, no aprueba créditos ni
      procesa pagos. Las simulaciones son ilustrativas.
    </div>
  )
}

/** Barra horizontal dividida en segmentos proporcionales. */
export function SplitBar({ segments, label }: { segments: { value: number; tone: string; name: string }[]; label: string }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1
  return (
    <div className="split-bar" role="img" aria-label={label}>
      {segments.map((seg) => (
        <span
          key={seg.name}
          className={`split-bar__seg split-bar__seg--${seg.tone}`}
          style={{ width: `${(Math.max(0, seg.value) / total) * 100}%` }}
        />
      ))}
    </div>
  )
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <span className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
