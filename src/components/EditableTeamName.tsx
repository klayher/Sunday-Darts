import { useEffect, useRef, useState } from 'react'

/**
 * Tap-to-edit team name. Renders as text with a small edit affordance; tapping
 * swaps in an input that commits on Enter or blur and cancels on Escape. The
 * team id never changes — only the display name.
 */
export function EditableTeamName({
  name,
  onRename,
  className = '',
}: {
  name: string
  onRename: (next: string) => void
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed.length > 0 && trimmed !== name) onRename(trimmed)
    setEditing(false)
  }

  const start = () => {
    setDraft(name)
    setEditing(true)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        maxLength={40}
        spellCheck={false}
        className="w-full rounded-xl border border-accent/50 bg-ink-900 px-3 py-2 text-base font-semibold text-white focus:outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={start}
      className={`group inline-flex max-w-full items-center gap-1.5 text-left ${className}`}
      aria-label={`Edit name for ${name}`}
    >
      <span className="truncate">{name}</span>
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition group-hover:text-zinc-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  )
}
