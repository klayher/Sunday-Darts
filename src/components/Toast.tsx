import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
}

export function Toast({
  message,
  onDone,
}: {
  message: ToastMessage | null
  onDone: () => void
}) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDone, 2400)
    return () => clearTimeout(timer)
  }, [message, onDone])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto rounded-2xl border border-ink-600 bg-ink-800/95 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur">
        {message.text}
      </div>
    </div>
  )
}
