import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppState, TeamSize } from './types'
import {
  buildTeams,
  createTournament,
  parseNames,
  recordResult,
  renameTeam,
  teamById,
  undo,
} from './engine'
import { clearState, loadState, saveState } from './storage'
import { SetupScreen } from './components/SetupScreen'
import { TournamentScreen } from './components/TournamentScreen'
import { ChampionScreen } from './components/ChampionScreen'
import { Toast, type ToastMessage } from './components/Toast'
import { ConfirmModal, type ConfirmConfig } from './components/ConfirmModal'

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null)
  const toastId = useRef(0)

  // Persist every change so the night survives a refresh or an accidental close.
  useEffect(() => {
    saveState(state)
  }, [state])

  const showToast = useCallback((text: string) => {
    toastId.current += 1
    setToast({ id: toastId.current, text })
  }, [])

  /* ---------------------------- Setup actions --------------------------- */

  const handleNamesChange = useCallback((namesText: string) => {
    setState((s) => ({ ...s, namesText, previewTeams: null }))
  }, [])

  const handleTeamSizeChange = useCallback((teamSize: TeamSize) => {
    setState((s) => ({ ...s, teamSize, previewTeams: null }))
  }, [])

  const handleRandomize = useCallback(() => {
    setState((s) => {
      const names = parseNames(s.namesText)
      const previewTeams = buildTeams(names, s.teamSize)
      return { ...s, previewTeams }
    })
    showToast('Teams randomized')
  }, [showToast])

  const handleClear = useCallback(() => {
    setState((s) => ({ ...s, namesText: '', previewTeams: null }))
  }, [])

  // Rename a preview team (setup screen). Ids stay stable; only the name changes.
  const handleRenamePreviewTeam = useCallback((teamId: string, name: string) => {
    setState((s) => {
      if (!s.previewTeams) return s
      return { ...s, previewTeams: renameTeam(s.previewTeams, teamId, name) }
    })
  }, [])

  // Rename a team mid-tournament. This touches only the name, not advancement
  // or history, so it never interferes with the engine or the undo stack.
  const handleRenameTeam = useCallback((teamId: string, name: string) => {
    setState((s) => {
      if (!s.tournament) return s
      return {
        ...s,
        tournament: {
          ...s.tournament,
          teams: renameTeam(s.tournament.teams, teamId, name),
        },
      }
    })
  }, [])

  const handleStart = useCallback(() => {
    setState((s) => {
      if (!s.previewTeams || s.previewTeams.length < 2) return s
      return { ...s, tournament: createTournament(s.previewTeams) }
    })
  }, [])

  /* ------------------------- Tournament actions ------------------------- */

  const handlePickWinner = useCallback(
    (teamId: string) => {
      setState((s) => {
        if (!s.tournament) return s
        const before = s.tournament
        const winner = teamById(before, teamId)
        const next = recordResult(before, teamId)

        const byesBefore = before.completedMatches.filter(
          (m) => m.status === 'bye',
        ).length
        const byesAfter = next.completedMatches.filter(
          (m) => m.status === 'bye',
        ).length

        if (next.status === 'complete') {
          showToast('We have a champion!')
        } else if (byesAfter > byesBefore) {
          showToast('Bye advanced — next match ready')
        } else if (winner) {
          showToast(`${winner.name} advanced`)
        }

        return { ...s, tournament: next }
      })
    },
    [showToast],
  )

  const handleUndo = useCallback(() => {
    setState((s) => {
      if (!s.tournament) return s
      return { ...s, tournament: undo(s.tournament) }
    })
    showToast('Last result undone')
  }, [showToast])

  const requestReset = useCallback(() => {
    setConfirm({
      title: 'Reset tournament?',
      body: 'This clears every result and restarts the bracket with the same teams.',
      confirmLabel: 'Reset',
      tone: 'danger',
      onConfirm: () => {
        setState((s) => {
          if (!s.tournament) return s
          return { ...s, tournament: createTournament(s.tournament.teams) }
        })
        showToast('Tournament reset')
      },
    })
  }, [showToast])

  const requestBackToSetup = useCallback(() => {
    setConfirm({
      title: 'Back to setup?',
      body: 'Your current tournament progress will be lost.',
      confirmLabel: 'Back to setup',
      tone: 'danger',
      onConfirm: () => {
        setState((s) => ({
          ...s,
          previewTeams:
            s.tournament?.teams.map((t) => ({
              ...t,
              wins: 0,
              losses: 0,
              eliminated: false,
            })) ?? s.previewTeams,
          tournament: null,
        }))
      },
    })
  }, [])

  const handleNewTournament = useCallback(() => {
    setState((s) => ({
      ...s,
      previewTeams:
        s.tournament?.teams.map((t) => ({
          ...t,
          wins: 0,
          losses: 0,
          eliminated: false,
        })) ?? s.previewTeams,
      tournament: null,
    }))
  }, [])

  /* ------------------------------ Routing ------------------------------ */

  const t = state.tournament

  return (
    <div className="min-h-screen bg-ink-950">
      {!t || t.status === 'setup' ? (
        <SetupScreen
          namesText={state.namesText}
          teamSize={state.teamSize}
          previewTeams={state.previewTeams}
          onNamesChange={handleNamesChange}
          onTeamSizeChange={handleTeamSizeChange}
          onRandomize={handleRandomize}
          onStart={handleStart}
          onClear={handleClear}
          onRenameTeam={handleRenamePreviewTeam}
        />
      ) : t.status === 'complete' ? (
        <ChampionScreen tournament={t} onNewTournament={handleNewTournament} />
      ) : (
        <TournamentScreen
          tournament={t}
          onPickWinner={handlePickWinner}
          onUndo={handleUndo}
          onRequestReset={requestReset}
          onRequestBackToSetup={requestBackToSetup}
          onRenameTeam={handleRenameTeam}
        />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
      <ConfirmModal config={confirm} onCancel={() => setConfirm(null)} />

      {/* A discreet always-available escape hatch to wipe everything. */}
      {(!t || t.status === 'setup') && state.tournament == null && (
        <div className="pb-8 text-center">
          <button
            onClick={() => {
              clearState()
              setState({
                namesText: '',
                teamSize: 2,
                previewTeams: null,
                tournament: null,
              })
              showToast('Cleared saved data')
            }}
            className="text-xs text-zinc-600 underline-offset-2 hover:text-zinc-400 hover:underline"
          >
            Clear saved data
          </button>
        </div>
      )}
    </div>
  )
}
