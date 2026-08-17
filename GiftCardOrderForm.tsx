'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/context/LanguageContext'
import { formatDzd, type GiftCardProduct } from '@/lib/gift-card-catalog'
import HowItWorks from '@/components/HowItWorks'
import LoginRequiredDialog from '@/components/LoginRequiredDialog'
import PremiumSelect from '@/components/PremiumSelect'
import AnimatedBrandBanner from '@/components/AnimatedBrandBanner'

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore clipboard failures */
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="btn-secondary w-full sm:w-auto min-h-11 px-4 py-2.5 text-xs font-bold justify-center shrink-0"
    >
      {copied ? copiedLabel : label}
    </button>
  )
}

function SectionLabel({ step, title, stepLabel }: { step: string; title: string; stepLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(168,85,247,0.2))',
          border: '1px solid rgba(251,191,36,0.28)',
          color: '#fcd34d',
        }}
      >
        {step}
      </span>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#fcd34d]">{stepLabel} {step}</p>
        <h2 className="text-lg sm:text-xl font-black" style={{ color: '#f5f3ff' }}>{title}</h2>
      </div>
    </div>
  )
}

export default function GiftCardOrderForm({ product }: { product: GiftCardProduct }) {
  const { user, loading } = useAuth()
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const regionSearchRef = useRef<HTMLInputElement | null>(null)

  const [regionQuery, setRegionQuery] = useState('')
  const [regionOpen, setRegionOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [region, setRegion] = useState<string>(product.regions[0])
  const [email, setEmail] = useState('')
  const [amountValue, setAmountValue] = useState<string>(product.amounts[0].value)
  const [paymentId, setPaymentId] = useState<string>(product.paymentMethods[0].id)
  const [notes, setNotes] = useState('')
  const [receiptImage, setReceiptImage] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedAmount = useMemo(
    () => product.amounts.find((a) => a.value === amountValue) ?? product.amounts[0],
    [amountValue, product.amounts],
  )
  const currentPayment = useMemo(
    () => product.paymentMethods.find((p) => p.id === paymentId) ?? product.paymentMethods[0],
    [paymentId, product.paymentMethods],
  )

  const displayPrice =
    currentPayment.currency === 'USD' ? `$${selectedAmount.priceUsd}` : formatDzd(selectedAmount.priceDzd)

  const visibleRegions = useMemo(() => {
    const q = regionQuery.trim().toLowerCase()
    if (!q) return product.regions
    return product.regions.filter((r) => r.toLowerCase().includes(q))
  }, [regionQuery, product.regions])

  const singleRegion = product.regions.length === 1
  const regionFieldLabel = singleRegion ? t('gift.region') : t('gift.country')

  useEffect(() => {
    if (!regionOpen) return
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => regionSearchRef.current?.focus(), 60)
    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(t)
    }
  }, [regionOpen])

  async function compressImage(file: File): Promise<string> {
    const rawDataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Could not read the selected file.'))
      reader.readAsDataURL(file)
    })
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Invalid image file.'))
        el.src = rawDataUrl
      })
      const MAX = 1400
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const scale = Math.min(MAX / width, MAX / height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return rawDataUrl
      ctx.drawImage(img, 0, 0, width, height)
      const compressed = canvas.toDataURL('image/jpeg', 0.72)
      return compressed.startsWith('data:image/') ? compressed : rawDataUrl
    } catch {
      return rawDataUrl
    }
  }

  async function onReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t('gift.errImageOnly'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t('gift.errSize'))
      return
    }
    setError('')
    try {
      const optimized = await compressImage(file)
      if (!optimized.startsWith('data:image/')) {
        setError(t('gift.errProcess'))
        return
      }
      setReceiptImage(optimized)
      setReceiptName(file.name)
    } catch {
      setError(t('gift.errProcess'))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Guests can browse everything, but must sign in before placing an order.
    if (!user) {
      setShowLogin(true)
      return
    }
    if (!receiptImage.startsWith('data:image/')) {
      setError(t('gift.errNoReceipt'))
      return
    }
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product: product.slug,
          brand: product.brand,
          region,
          country: region,
          currency: currentPayment.currency,
          amountLabel: selectedAmount.label,
          amountValue: selectedAmount.value,
          priceUsd: selectedAmount.priceUsd,
          priceDzd: selectedAmount.priceDzd,
          paymentMethod: currentPayment.name,
          email,
          notes,
          receiptImage,
        }),
      })
      if (res.status === 401) {
        setError(t('gift.errSession'))
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || t('gift.errSave'))
      setMessage(t('gift.orderSuccess', { brand: product.brand }))
      setNotes('')
      setReceiptImage('')
      setReceiptName('')
      window.setTimeout(() => router.push('/dashboard/gift-cards'), 1400)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('gift.errSave'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <>
      <form onSubmit={handleSubmit} className="gift-card-stack">
        {/* ============ ANIMATED BRAND HERO BANNER ============ */}
        <AnimatedBrandBanner
          image={product.bannerImage ?? product.image}
          alt={`${product.brand} gift card`}
          accentRgb={product.accentRgb}
        />

        {/* ============ PRODUCT CARD (horizontal) ============ */}
        <section className="glass-card-bright gift-surface">
          <div className="flex flex-row items-center gap-4 sm:gap-6">
            <div
              className="relative h-24 w-28 sm:h-28 sm:w-40 shrink-0 overflow-hidden rounded-[1.25rem] border"
              style={{ borderColor: 'rgba(251,191,36,0.24)', background: 'rgba(8,2,16,0.55)' }}
            >
              <Image
                src={product.image}
                alt={`${product.brand} gift card`}
                fill
                sizes="(max-width: 640px) 112px, 160px"
                className="object-cover object-center"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span
                className="inline-flex rounded-full border px-3 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] text-[#fcd34d]"
                style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.1)' }}
              >
                {t('gift.badge')}
              </span>
              <h2 className="mt-2.5 text-xl sm:text-2xl lg:text-3xl font-black truncate" style={{ color: '#fdf4ff' }} translate="no">
                {product.brand}
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-6 line-clamp-3" style={{ color: 'rgba(221,214,254,0.78)' }}>
                {product.description}
              </p>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS (compact, below product) ============ */}
        <HowItWorks steps={product.howItWorks} />

        {/* ============ SELECTION CARD ============ */}
        <section className="glass-card-bright gift-surface">
          <SectionLabel step="1" title={t('gift.step1Title')} stepLabel={t('gift.step')} />
          <div className="mt-6 grid gap-5 sm:gap-6">
            {/* Region */}
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{product.regionLabel}</p>
              <button
                type="button"
                onClick={() => {
                  if (singleRegion) return
                  setRegionOpen(true)
                  setRegionQuery('')
                }}
                className="input-field mt-3 w-full rounded-2xl px-4 py-4 text-left flex items-center justify-between gap-3 min-h-[4rem]"
                aria-haspopup="dialog"
                aria-expanded={regionOpen}
                style={singleRegion ? { cursor: 'default' } : undefined}
              >
                <span className="min-w-0">
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-[#fcd34d]">{t('gift.selected')}</span>
                  <span className="mt-1 block truncate text-sm font-bold" style={{ color: '#f5f3ff' }} translate="no">{region}</span>
                </span>
                {!singleRegion && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="shrink-0 opacity-80">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>
            </div>

            {/* Amount */}
            <div className="block min-w-0">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{t('gift.amount')}</span>
              <PremiumSelect
                className="mt-3"
                ariaLabel={t('gift.amount')}
                value={amountValue}
                onChange={setAmountValue}
                options={product.amounts.map((amount) => ({
                  value: amount.value,
                  label: `${amount.label} — $${amount.priceUsd}`,
                }))}
              />
            </div>

            {/* Email */}
            <label className="block min-w-0">
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{t('gift.emailAddress')}</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={t('gift.emailPlaceholder')}
                className="input-field mt-3 w-full rounded-2xl px-4 py-3.5 min-h-12"
                required
              />
            </label>
          </div>
        </section>

        {/* ============ PAYMENT CARD ============ */}
        <section className="glass-card-bright gift-surface">
          <SectionLabel step="2" title={t('gift.step2Title')} stepLabel={t('gift.step')} />

          {/* Payment method */}
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{t('gift.paymentMethod')}</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {product.paymentMethods.map((option) => {
                const active = option.id === currentPayment.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentId(option.id)}
                    className={`w-full min-h-12 justify-center ${active ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {option.name}
                  </button>
                )
              })}
            </div>

            <div
              className="mt-5 rounded-[1.5rem] border p-5"
              style={{ background: 'rgba(13,1,24,0.42)', borderColor: 'rgba(251,191,36,0.22)' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#fcd34d]">{currentPayment.label}</p>
              <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center gap-3.5">
                <p className="text-sm sm:text-base font-black break-all min-w-0" style={{ color: '#f5f3ff' }} translate="no">
                  {currentPayment.value}
                </p>
                <CopyButton value={currentPayment.value} label={currentPayment.copyLabel} copiedLabel={t('gift.copied')} />
              </div>
              <p className="mt-4 text-sm leading-7" style={{ color: 'rgba(221,214,254,0.72)' }}>{currentPayment.hint}</p>
            </div>
          </div>

          {/* Receipt upload */}
          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{t('gift.receiptUpload')}</p>
            <label
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-5 py-8 sm:py-10 text-center"
              style={{ borderColor: 'rgba(251,191,36,0.28)', background: 'rgba(251,191,36,0.04)' }}
            >
              <input type="file" accept="image/*" className="hidden" onChange={onReceiptChange} />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="mt-4 text-sm font-bold" style={{ color: '#f5f3ff' }}>{t('gift.receiptTap')}</p>
              <p className="mt-2 text-xs" style={{ color: 'rgba(196,181,253,0.68)' }}>{t('gift.receiptHint')}</p>
              {receiptName && (
                <p className="mt-4 text-xs font-black text-[#fcd34d] break-all px-2" translate="no">{receiptName}</p>
              )}
            </label>
            {receiptImage && (
              <div className="mt-4 overflow-hidden rounded-[1.25rem] border" style={{ borderColor: 'rgba(167,139,250,0.16)' }}>
                <img src={receiptImage} alt="Gift card receipt" className="h-44 sm:h-52 w-full object-cover" />
              </div>
            )}
          </div>

          {/* Notes */}
          <label className="mt-7 block min-w-0">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">
              {t('gift.notes')} <span style={{ color: 'rgba(196,181,253,0.55)' }}>{t('gift.optional')}</span>
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t('gift.notesPlaceholder')}
              className="input-field mt-3 w-full rounded-2xl px-4 py-3.5"
              style={{ resize: 'vertical' }}
            />
          </label>

          {/* Order summary */}
          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]">{t('gift.orderSummary')}</p>
            <div className="mt-3 rounded-[1.5rem] border overflow-hidden" style={{ borderColor: 'rgba(167,139,250,0.18)' }}>
              {([
                ['product', t('gift.sumProduct'), product.brand, true],
                ['region', regionFieldLabel, region, true],
                ['amount', t('gift.sumAmount'), selectedAmount.label, false],
                ['payment', t('gift.sumPayment'), currentPayment.name, false],
                ['total', t('gift.sumTotal'), displayPrice, true],
              ] as [string, string, string, boolean][]).map(([key, label, value, keepLtr], idx, arr) => {
                const isTotal = key === 'total'
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-4 py-3.5"
                    style={{
                      background: isTotal ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.02)',
                      borderBottom: idx < arr.length - 1 ? '1px solid rgba(167,139,250,0.12)' : 'none',
                    }}
                  >
                    <span className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: 'rgba(196,181,253,0.72)' }}>{label}</span>
                    <span
                      className={`text-sm font-bold text-right break-words ${isTotal ? 'text-[#fcd34d] text-base' : ''}`}
                      style={isTotal ? undefined : { color: '#f5f3ff' }}
                      translate={keepLtr ? 'no' : undefined}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <div
              className="mt-6 rounded-2xl border px-4 py-3.5 text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
            >
              {error}
            </div>
          )}
          {message && (
            <div
              className="mt-6 rounded-2xl border px-4 py-3.5 text-sm font-semibold"
              style={{ background: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.3)', color: '#86efac' }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || (!!user && (!receiptImage || !email))}
            className="btn-primary mt-6 w-full min-h-[3.25rem] py-3.5 justify-center disabled:opacity-60"
          >
            {submitting ? t('gift.submitting') : t('gift.submitOrder', { brand: product.brand })}
          </button>
        </section>
      </form>

      {/* Region picker sheet (multi-region products only) */}
      {regionOpen && !singleRegion && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <button
            type="button"
            aria-label="Close region picker"
            className="absolute inset-0 bg-black/70"
            onClick={() => setRegionOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select region"
            className="relative z-10 w-full sm:max-w-md max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden rounded-t-[1.75rem] sm:rounded-[2rem] border shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(36,12,68,0.98), rgba(14,4,28,0.99))',
              borderColor: 'rgba(167,139,250,0.28)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#fcd34d]">{product.regionLabel}</p>
                <h2 className="mt-1 text-xl font-black" style={{ color: '#f5f3ff' }}>{t('gift.select')}</h2>
              </div>
              <button type="button" onClick={() => setRegionOpen(false)} className="btn-secondary min-h-10 px-4">
                {t('common.close')}
              </button>
            </div>

            <div className="px-5 sm:px-6 pb-3">
              <input
                ref={regionSearchRef}
                value={regionQuery}
                onChange={(e) => setRegionQuery(e.target.value)}
                placeholder={t('gift.searchPlaceholder')}
                className="input-field w-full rounded-2xl px-4 py-3.5 min-h-12"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-1.5">
              {visibleRegions.map((item) => {
                const active = item === region
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setRegion(item)
                      setRegionOpen(false)
                      setRegionQuery('')
                    }}
                    className="w-full rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition-all min-h-12"
                    style={active
                      ? { background: 'rgba(168,85,247,0.18)', color: '#f5f3ff', boxShadow: 'inset 0 0 0 1px rgba(251,191,36,0.3)' }
                      : { color: 'rgba(221,214,254,0.9)', background: 'rgba(255,255,255,0.03)' }}
                    translate="no"
                  >
                    {item}
                  </button>
                )
              })}
              {!visibleRegions.length && (
                <p className="px-4 py-6 text-sm" style={{ color: 'rgba(196,181,253,0.68)' }}>
                  {t('gift.noMatches')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginRequiredDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
        returnTo={pathname ?? undefined}
      />
    </>
  )
}
