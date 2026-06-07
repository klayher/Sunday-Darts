import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 font-semibold ' +
  'min-h-[52px] text-base transition active:scale-[0.985] ' +
  'disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-ink-950 shadow-lg shadow-accent/20 hover:bg-accent-600',
  secondary: 'bg-ink-700 text-white hover:bg-ink-600',
  ghost: 'bg-transparent text-zinc-300 hover:bg-ink-800',
  danger: 'bg-transparent text-red-300 hover:bg-red-500/10 border border-red-500/30',
}

export function Button({
  variant = 'secondary',
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    />
  )
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-3xl border border-ink-700 bg-ink-850 ${className}`}
    >
      {children}
    </div>
  )
}

type BadgeTone = 'green' | 'amber' | 'red' | 'neutral'

const badgeTones: Record<BadgeTone, string> = {
  green: 'bg-accent/15 text-accent border-accent/30',
  amber: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  red: 'bg-red-500/10 text-red-300 border-red-500/30',
  neutral: 'bg-ink-700 text-zinc-300 border-ink-600',
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: BadgeTone
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${badgeTones[tone]}`}
    >
      {children}
    </span>
  )
}
