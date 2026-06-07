import type { AppState } from './types'

const KEY = 'darts-night/v1'

export const defaultState: AppState = {
  namesText: '',
  teamSize: 2,
  previewTeams: null,
  tournament: null,
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      namesText: parsed.namesText ?? '',
      teamSize: parsed.teamSize ?? 2,
      previewTeams: parsed.previewTeams ?? null,
      tournament: parsed.tournament ?? null,
    }
  } catch {
    return defaultState
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Out of quota or private mode: fail silently, app still works in-memory.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
