import { useId, useState, type ReactNode } from 'react'
import { formatThousands } from '../lib/format'
import { parseDecimal, parseMoney, validateRange, type Range } from '../lib/validation'

interface FieldShellProps {
  id: string
  label: string
  hint?: ReactNode
  error?: string | null
  children: ReactNode
}

export function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-msg`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-msg`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/**
 * Mantiene el texto que escribe la persona y solo propaga valores válidos.
 * Si el valor externo cambia (p. ej. al restablecer datos), el texto se sincroniza.
 */
function useSyncedText(value: number, format: (n: number) => string) {
  const [text, setText] = useState(() => format(value))
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(format(value))
  }
  return [text, setText, setLastValue] as const
}

interface NumericFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  range: Range
  hint?: ReactNode
}

/**
 * Campo de dinero en COP con separadores de miles.
 * Con `onRawChange` funciona como entrada libre: reporta cualquier valor (o `null`)
 * y deja la validación al formulario, que la muestra vía `externalError`.
 */
export function MoneyField({
  label,
  value,
  onChange,
  range,
  hint,
  onRawChange,
  externalError,
}: Omit<NumericFieldProps, 'onChange'> & {
  onChange?: (value: number) => void
  onRawChange?: (value: number | null) => void
  externalError?: string
}) {
  const id = useId()
  const format = (n: number) => (onRawChange && n === 0 ? '' : formatThousands(n))
  const [text, setText, setLastValue] = useSyncedText(value, format)
  const [internalError, setError] = useState<string | null>(null)
  const error = externalError ?? internalError

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="input-wrap">
        <span className="input-wrap__prefix" aria-hidden="true">
          $
        </span>
        <input
          id={id}
          className="input input--prefixed"
          inputMode="numeric"
          autoComplete="off"
          value={text}
          aria-invalid={!!error}
          aria-describedby={`${id}-msg`}
          onChange={(e) => {
            const parsed = parseMoney(e.target.value)
            setText(parsed === null ? '' : formatThousands(parsed))
            if (onRawChange) {
              onRawChange(parsed)
              return
            }
            const err = validateRange(parsed, range)
            setError(err)
            if (!err && parsed !== null) {
              setLastValue(parsed)
              onChange?.(parsed)
            }
          }}
        />
        <span className="input-wrap__suffix" aria-hidden="true">
          COP
        </span>
      </div>
    </FieldShell>
  )
}

/** Campo numérico con control deslizante sincronizado. */
export function SliderField({
  label,
  value,
  onChange,
  range,
  hint,
  step = 1,
  suffix,
}: NumericFieldProps & { step?: number; suffix: string }) {
  const id = useId()
  const format = (n: number) => String(n).replace('.', ',')
  const [text, setText, setLastValue] = useSyncedText(value, format)
  const [error, setError] = useState<string | null>(null)

  const commit = (raw: string) => {
    setText(raw)
    const parsed = parseDecimal(raw)
    const err = validateRange(parsed, range)
    setError(err)
    if (!err && parsed !== null) {
      setLastValue(parsed)
      onChange(parsed)
    }
  }

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="slider-field">
        <input
          type="range"
          className="slider"
          min={range.min}
          max={range.max}
          step={step}
          value={error ? value : Number(text.replace(',', '.')) || value}
          aria-label={`${label} (control deslizante)`}
          onChange={(e) => commit(format(Number(e.target.value)))}
        />
        <div className="input-wrap input-wrap--compact">
          <input
            id={id}
            className="input input--suffixed"
            inputMode="decimal"
            autoComplete="off"
            value={text}
            aria-invalid={!!error}
            aria-describedby={`${id}-msg`}
            onChange={(e) => commit(e.target.value)}
          />
          <span className="input-wrap__suffix" aria-hidden="true">
            {suffix}
          </span>
        </div>
      </div>
    </FieldShell>
  )
}

export function TextField({
  label,
  value,
  onChange,
  maxLength,
  hint,
  error,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  maxLength?: number
  hint?: ReactNode
  error?: string | null
  placeholder?: string
}) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className="input"
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={`${id}-msg`}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}
