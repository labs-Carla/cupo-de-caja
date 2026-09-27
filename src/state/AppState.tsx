import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sampleRequests } from '../lib/requests'
import { EMPTY_CHAT, type ChatDraft } from './chat'
import { SAMPLE_PROFILE, SAMPLE_SIMULATION, sampleMovements } from '../lib/sampleData'
import type { CashProfile, CreditRequest, Movement, RequestStatus, SimulationInput } from '../lib/types'

const STORAGE_KEY = 'cupo-de-caja:v2'

interface PersistedState {
  profile: CashProfile
  simulation: SimulationInput
  movements: Movement[]
  requests: CreditRequest[]
  chat: ChatDraft
}

interface AppStateValue extends PersistedState {
  updateProfile: (patch: Partial<CashProfile>) => void
  updateSimulation: (patch: Partial<SimulationInput>) => void
  addMovement: (movement: Omit<Movement, 'id'>) => void
  removeMovement: (id: string) => void
  updateChat: (patch: Partial<ChatDraft>) => void
  resetChat: () => void
  addRequest: (request: Omit<CreditRequest, 'id'>) => string
  setRequestStatus: (id: string, status: RequestStatus) => void
  markInstallmentPaid: (id: string) => void
  resetDemo: () => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

function initialState(): PersistedState {
  return {
    profile: SAMPLE_PROFILE,
    simulation: SAMPLE_SIMULATION,
    movements: sampleMovements(),
    requests: sampleRequests(),
    chat: EMPTY_CHAT,
  }
}

function loadState(): PersistedState {
  const fallback = initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      profile: { ...fallback.profile, ...parsed.profile },
      simulation: { ...fallback.simulation, ...parsed.simulation },
      movements: Array.isArray(parsed.movements) ? parsed.movements : fallback.movements,
      requests: Array.isArray(parsed.requests) ? parsed.requests : fallback.requests,
      chat: { ...EMPTY_CHAT, ...parsed.chat },
    }
  } catch {
    return fallback
  }
}

function newId(prefix = ''): string {
  const raw =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return prefix + raw
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Almacenamiento no disponible (modo privado, etc.): la app sigue funcionando en memoria.
    }
  }, [state])

  const updateProfile = useCallback((patch: Partial<CashProfile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])
  const updateSimulation = useCallback((patch: Partial<SimulationInput>) => {
    setState((s) => ({ ...s, simulation: { ...s.simulation, ...patch } }))
  }, [])
  const addMovement = useCallback((movement: Omit<Movement, 'id'>) => {
    setState((s) => ({ ...s, movements: [{ ...movement, id: newId() }, ...s.movements] }))
  }, [])
  const removeMovement = useCallback((id: string) => {
    setState((s) => ({ ...s, movements: s.movements.filter((m) => m.id !== id) }))
  }, [])
  const updateChat = useCallback((patch: Partial<ChatDraft>) => {
    setState((s) => ({ ...s, chat: { ...s.chat, ...patch } }))
  }, [])
  const resetChat = useCallback(() => setState((s) => ({ ...s, chat: EMPTY_CHAT })), [])
  const addRequest = useCallback((request: Omit<CreditRequest, 'id'>) => {
    const id = newId('sol-')
    setState((s) => ({ ...s, requests: [{ ...request, id }, ...s.requests] }))
    return id
  }, [])
  const setRequestStatus = useCallback((id: string, status: RequestStatus) => {
    setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) }))
  }, [])
  const markInstallmentPaid = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, paidInstallments: Math.min(r.weeks, r.paidInstallments + 1) } : r,
      ),
    }))
  }, [])
  const resetDemo = useCallback(() => setState(initialState()), [])

  const value = useMemo(
    () => ({
      ...state,
      updateProfile,
      updateSimulation,
      addMovement,
      removeMovement,
      updateChat,
      resetChat,
      addRequest,
      setRequestStatus,
      markInstallmentPaid,
      resetDemo,
    }),
    [state, updateProfile, updateSimulation, addMovement, removeMovement, updateChat, resetChat, addRequest, setRequestStatus, markInstallmentPaid, resetDemo],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

// eslint-disable-next-line react/only-export-components -- el hook acompaña al proveedor
export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return ctx
}
