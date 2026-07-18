import { useState } from 'react'
import { api, Wallet } from './api'

const CC_CURRENCIES: { key: keyof Wallet; label: string; color: string }[] = [
  { key: 'chase_ur', label: 'Chase UR',  color: '#1A6EBF' },
  { key: 'amex_mr',  label: 'Amex MR',   color: '#007A5E' },
  { key: 'citi_ty',  label: 'Citi TY',   color: '#CC3333' },
  { key: 'bilt',     label: 'Bilt',      color: '#8B5CF6' },
]

const AIRLINE_CURRENCIES: { key: keyof Wallet; label: string; program: string }[] = [
  { key: 'united',     label: 'United',          program: 'MileagePlus' },
  { key: 'american',   label: 'American',         program: 'AAdvantage' },
  { key: 'delta',      label: 'Delta',            program: 'SkyMiles' },
  { key: 'alaska',     label: 'Alaska',           program: 'Mileage Plan' },
  { key: 'ana',        label: 'ANA',              program: 'ANA Mileage Club' },
  { key: 'aeroplan',   label: 'Air Canada',       program: 'Aeroplan' },
  { key: 'cathay',     label: 'Cathay Pacific',   program: 'Asia Miles' },
  { key: 'air_france', label: 'Air France/KLM',   program: 'Flying Blue' },
  { key: 'ba',         label: 'British Airways',  program: 'Avios' },
  { key: 'singapore',  label: 'Singapore',        program: 'KrisFlyer' },
  { key: 'turkish',    label: 'Turkish',          program: 'Miles&Smiles' },
  { key: 'virgin',     label: 'Virgin Atlantic',  program: 'Flying Club' },
  { key: 'emirates',   label: 'Emirates',         program: 'Skywards' },
]

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: '#161616',
  border: '1px solid #2A2826',
  borderRadius: 6,
  color: '#E8E0D0',
  padding: '7px 12px',
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
}

interface Props {
  wallet: Wallet
  onChange: (w: Wallet) => void
}

function CurrencyRow({ label, sublabel, color, value, onChange }: {
  label: string
  sublabel?: string
  color?: string
  value: number
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 130, flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: color ?? '#9A9490', fontFamily: "'JetBrains Mono', monospace" }}>
          {label}
        </div>
        {sublabel && <div style={{ fontSize: 10, color: '#6B6460', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <input
        type="number"
        min={0}
        step={1000}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
        style={inputStyle}
      />
    </div>
  )
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

  const ccTotal = CC_CURRENCIES.reduce((s, c) => s + (wallet[c.key] as number || 0), 0)
  const airlineHasAny = AIRLINE_CURRENCIES.some(c => (wallet[c.key] as number || 0) > 0)

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Credit card points */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#C8A96E', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          信用卡积分
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CC_CURRENCIES.map(({ key, label, color }) => (
            <CurrencyRow
              key={key}
              label={label}
              color={color}
              value={wallet[key] as number}
              onChange={v => handleChange(key, v)}
            />
          ))}
        </div>
        {ccTotal > 0 && (
          <div style={{ marginTop: 12, fontSize: 11, color: '#6B6460' }}>
            合计 <span style={{ color: '#C8A96E', fontFamily: "'JetBrains Mono', monospace" }}>{ccTotal.toLocaleString()}</span> pts
            {' '}≈ <span style={{ color: '#C8A96E' }}>${(ccTotal * 0.015).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>（按 1.5¢/pt 估算）
          </div>
        )}
      </div>

      {/* Airline miles */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#C8A96E', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          航司里程（直接持有）
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AIRLINE_CURRENCIES.map(({ key, label, program }) => (
            <CurrencyRow
              key={key}
              label={label}
              sublabel={program}
              value={wallet[key] as number}
              onChange={v => handleChange(key, v)}
            />
          ))}
        </div>
        {airlineHasAny && (
          <div style={{ marginTop: 12, fontSize: 11, color: '#6B6460' }}>
            直接持有的里程在搜索时优先显示，无需转点
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '9px 28px',
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
    </div>
  )
}
