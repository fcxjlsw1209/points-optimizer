import { useState } from 'react'
import { api, Wallet } from './api'

const CURRENCIES: { key: keyof Wallet; label: string; color: string }[] = [
  { key: 'chase_ur', label: 'Chase UR',  color: '#1A6EBF' },
  { key: 'amex_mr',  label: 'Amex MR',   color: '#007A5E' },
  { key: 'citi_ty',  label: 'Citi TY',   color: '#CC3333' },
  { key: 'bilt',     label: 'Bilt',      color: '#8B5CF6' },
]

interface Props {
  wallet: Wallet
  onChange: (w: Wallet) => void
}

export default function MyWallet({ wallet, onChange }: Props) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (key: keyof Wallet, val: string) => {
    const n = parseInt(val.replace(/,/g, ''), 10)
    onChange({ ...wallet, [key]: isNaN(n) ? 0 : n })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.wallet.update(wallet)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: '#C8A96E' }}>我的积分</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CURRENCIES.map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 80, fontSize: 12, fontWeight: 600,
              color, fontFamily: "'JetBrains Mono', monospace",
            }}>
              {label}
            </div>
            <input
              type="number"
              min={0}
              step={1000}
              value={wallet[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
              placeholder="0"
              style={{
                flex: 1,
                background: '#161616',
                border: '1px solid #2A2826',
                borderRadius: 6,
                color: '#E8E0D0',
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: '9px 24px',
          background: saved ? '#166534' : '#C8A96E',
          color: saved ? '#fff' : '#0E0E0E',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 13,
          opacity: saving ? 0.6 : 1,
          transition: 'background 0.2s',
        }}
      >
        {saving ? '保存中…' : saved ? '已保存 ✓' : '保存'}
      </button>

      <div style={{ marginTop: 24, padding: '12px 16px', background: '#161616', borderRadius: 8, border: '1px solid #2A2826' }}>
        <div style={{ fontSize: 11, color: '#6B6460', marginBottom: 8 }}>总积分价值估算（按 1.5¢/point）</div>
        <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: '#C8A96E' }}>
          ${((
            (wallet.chase_ur + wallet.amex_mr + wallet.citi_ty + wallet.bilt) * 0.015
          ).toLocaleString('en-US', { maximumFractionDigits: 0 }))}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {CURRENCIES.map(({ key, label, color }) => (
            wallet[key] > 0 && (
              <div key={key} style={{ fontSize: 11, color: '#9A9490' }}>
                <span style={{ color }}>{label}</span>
                {' '}{wallet[key].toLocaleString()}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}
