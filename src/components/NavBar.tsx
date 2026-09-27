import type { ScreenId } from '../lib/types'

const SCREENS: { id: ScreenId; label: string; icon: string }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'perfil', label: 'Perfil de caja', icon: 'M4 7h16v12H4zM4 7l2-3h12l2 3M9 12h6' },
  { id: 'simulador', label: 'Simulador', icon: 'M5 3h14v18H5zM8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4' },
  { id: 'resumen', label: 'Resumen', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { id: 'actividad', label: 'Actividad', icon: 'M4 6h16M4 12h16M4 18h10' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

export function NavBar({ current, onNavigate }: { current: ScreenId; onNavigate: (id: ScreenId) => void }) {
  return (
    <nav className="nav" aria-label="Secciones">
      <ul className="nav__list">
        {SCREENS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`nav__item ${current === s.id ? 'is-active' : ''}`}
              aria-current={current === s.id ? 'page' : undefined}
              onClick={() => onNavigate(s.id)}
            >
              <Icon d={s.icon} />
              <span className="nav__label">{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
