import { useState } from 'react'
import { NavBar } from './components/NavBar'
import { Button, PrototypeBanner } from './components/ui'
import type { AppView, ScreenId } from './lib/types'
import { Actividad } from './screens/Actividad'
import { Inicio } from './screens/Inicio'
import { PanelAliado } from './screens/PanelAliado'
import { Perfil } from './screens/Perfil'
import { Resumen } from './screens/Resumen'
import { Simulador } from './screens/Simulador'
import { WhatsApp } from './screens/WhatsApp'
import { useAppState } from './state/AppState'

const VIEWS: { id: AppView; label: string }[] = [
  { id: 'comerciante', label: 'Comerciante' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'aliado', label: 'Panel aliado' },
]

export default function App() {
  const { resetDemo } = useAppState()
  const [view, setView] = useState<AppView>('comerciante')
  const [screen, setScreen] = useState<ScreenId>('inicio')

  const navigate = (id: ScreenId) => {
    setView('comerciante')
    setScreen(id)
    window.scrollTo({ top: 0 })
  }
  const changeView = (v: AppView) => {
    setView(v)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className={`app app--${view}`}>
      <header className="topbar">
        <div className="topbar__inner">
          <button type="button" className="brand" onClick={() => navigate('inicio')}>
            <img src="/favicon.svg" alt="" width="32" height="32" />
            <span>
              Cupo de Caja <small>prototipo</small>
            </span>
          </button>
          <div className="view-switch" role="tablist" aria-label="Vista">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" role="tab" aria-selected={view === v.id} className={`view-switch__opt ${view === v.id ? 'is-active' : ''}`} onClick={() => changeView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="topbar__reset"
            onClick={() => {
              if (window.confirm('¿Restablecer todos los datos ficticios de la demo?')) resetDemo()
            }}
          >
            Restablecer demo
          </Button>
        </div>
        {view === 'comerciante' && <NavBar current={screen} onNavigate={navigate} />}
      </header>

      <PrototypeBanner />

      <main className="main" id="contenido">
        {view === 'comerciante' && (
          <>
            {screen === 'inicio' && <Inicio onNavigate={navigate} onView={changeView} />}
            {screen === 'perfil' && <Perfil />}
            {screen === 'simulador' && <Simulador onNavigate={navigate} />}
            {screen === 'resumen' && <Resumen />}
            {screen === 'actividad' && <Actividad />}
          </>
        )}
        {view === 'whatsapp' && <WhatsApp onView={changeView} />}
        {view === 'aliado' && <PanelAliado onView={changeView} />}
      </main>

      <footer className="footer">
        Cupo de Caja · Prototipo para Makers Fellowship · Datos ficticios · No es una oferta de crédito
      </footer>
    </div>
  )
}
