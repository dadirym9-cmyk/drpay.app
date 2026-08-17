'use client'

import { useEffect, useRef, useState } from 'react'

export interface PremiumSelectOption {
  value: string
  label: string
}

// Reusable premium dropdown that matches the site's purple glass design.
// - Trigger looks like the existing .input-field (dark purple glass).
// - Panel is dark purple glass with blur.
// - The selected option gets a gray/purple gradient background, gold text,
//   and a subtle shimmer animation (.premium-option-selected).
export default function PremiumSelect({
  value,
  onChange,
  options,
  placeholder = 'Select',
  ariaLabel,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: PremiumSelectOption[]
  placeholder?: string
  ariaLabel?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="input-field flex w-full items-center justify-between gap-3 min-h-[52px] text-left"
      >
        <span className="truncate text-sm font-bold" style={{ color: selected ? '#f5f3ff' : 'rgba(196,181,253,0.7)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2.4"
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-2xl border p-1.5 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(36,12,68,0.98), rgba(16,4,30,0.99))',
            borderColor: 'rgba(167,139,250,0.32)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition-colors ${
                  active ? 'premium-option-selected' : ''
                }`}
                style={
                  active
                    ? undefined
                    : { color: 'rgba(233,213,255,0.92)', background: 'transparent' }
                }
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(168,85,247,0.14)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
