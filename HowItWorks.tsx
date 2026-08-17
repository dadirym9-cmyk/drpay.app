'use client'

import { useT } from '@/context/LanguageContext'

// Compact, reusable "How It Works" section rendered inside each product page.
// Steps are passed in so Netflix / Bigo / future products stay consistent.
export default function HowItWorks({ steps, accent }: { steps: string[]; accent?: string }) {
  const t = useT()
  const badgeColor = accent ?? '#fcd34d'
  return (
    <section className="glass-card-bright gift-surface">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#fcd34d]">{t('how.title')}</p>
      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-3.5 rounded-2xl border px-4 py-4"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(167,139,250,0.16)' }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.16), rgba(168,85,247,0.18))',
                color: badgeColor,
                border: '1px solid rgba(251,191,36,0.24)',
              }}
            >
              {i + 1}
            </span>
            <p className="text-sm font-bold" style={{ color: '#f5f3ff' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
