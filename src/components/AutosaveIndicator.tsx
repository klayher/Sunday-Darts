import { useEffect, useRef, useState } from 'react'

/**
 * Tiny reassurance that state is persisted. `signal` is any value that changes
 * whenever we write to localStorage (we pass the tournament object, whose
 * identity changes on every result, undo, or reset). We pulse the dot on change.
 */
export function AutosaveIndicator({ signal }: { signal: unknown }) {
  const [pulsing, setPulsing] = useState(false)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setPulsing(true)
    const id = window.setTimeout(() => setPulsing(false), 700)
    return () => clearTimeout(id)
  }, [signal])

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
      <span
        className={`h-2 w-2 rounded-full bg-accent ${
          pulsing ? 'saved-dot-pulse' : 'opacity-70'
        }`}
      />
      {pulsing ? 'Saved' : 'Auto-saved'}
    </div>
  )
}
