import { Button } from './ui'

export interface ConfirmConfig {
  title: string
  body?: string
  confirmLabel: string
  tone?: 'primary' | 'danger'
  onConfirm: () => void
}

export function ConfirmModal({
  config,
  onCancel,
}: {
  config: ConfirmConfig | null
  onCancel: () => void
}) {
  if (!config) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white">{config.title}</h2>
        {config.body && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{config.body}</p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant={config.tone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={() => {
              config.onConfirm()
              onCancel()
            }}
          >
            {config.confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
