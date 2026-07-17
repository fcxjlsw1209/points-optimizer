import { useState } from 'react'
import { Wallet } from './api'

const AIRPORTS: { code: string; city: string }[] = [
  { code: 'SFO', city: 'San Francisco' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'JFK', city: 'New York' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'SEA', city: 'Seattle' },
  { code: 'BOS', city: 'Boston' },
  { code: 'MIA', city: 'Miami' },
  { code: 'DFW', city: 'Dallas' },
  { code: 'NRT', city: 'Tokyo Narita' },
  { code: 'HND', city: 'Tokyo Haneda' },
  { code: 'KIX', city: 'Osaka' },
  { code: 'ICN', city: 'Seoul' },
  { code: 'PVG', city: 'Shanghai' },
  { code: 'PEK', city: 'Beijing' },
  { code: 'HKG', city: 'Hong Kong' },
  { code: 'SIN', city: 'Singapore' },
  { code: 'BKK', city: 'Bangkok' },
  { code: 'LHR', city: 'London' },
  { code: 'CDG', city: 'Paris' },
  { code: 'FRA', city: 'Frankfurt' },
  { code: 'AMS', city: 'Amsterdam' },
  { code: 'FCO', city: 'Rome' },
  { code: 'MAD', city: 'Madrid' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'SYD', city: 'Sydney' },
]

const CABINS = [
  { value: 'economy',  label: '经济舱' },
  { value: 'business', label: '商务舱' },
  { value: 'first',    label: '头等舱' },
]

interface Props {
  wallet: Wallet
  onSearch: (params: { origin: string; destination: string; cabin: string; passengers: number }) => void
  loading: boolean
}

function AirportInput({ value, onChange, placeholder }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const filtered = value.length >= 1
    ? AIRPORTS.filter(a =>
        a.code.toLowerCase().startsWith(value.toLowerCase()) ||
        a.city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6)
    : []

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value.toUpperCase()); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        maxLength={3}
        style={{
          width: '100%',
          background: '#161616',
          border: '1px solid #2A2826',
          borderRadius: 6,
          color: '#E8E0D0',
          padding: '10px 12px',
          fontSize: 16,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          letterSpacing: 2,
          outline: 'none',
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
          background: '#1C1C1C', border: '1px solid #2A2826', borderRadius: 6,
          marginTop: 4, overflow: 'hidden',
        }}>
          {filtered.map(a => (
            <div
              key={a.code}
              onMouseDown={() => { onChange(a.code); setOpen(false) }}
              style={{
                padding: '8px 12px', cursor: 'pointer', display: 'flex',
                gap: 12, alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2A2826')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#C8A96E', width: 36 }}>{a.code}</span>
              <span style={{ color: '#9A9490', fontSize: 12 }}>{a.city}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchForm({ wallet, onSearch, loading }: Props) {
  const [origin, setOrigin] = useState('SFO')
  const [destination, setDestination] = useState('')
  const [cabin, setCabin] = useState('business')
  const [passengers, setPassengers] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination) return
    onSearch({ origin, destination, cabin, passengers })
  }

  const inputStyle: React.CSSProperties = {
    background: '#161616',
    border: '1px solid #2A2826',
    borderRadius: 6,
    color: '#E8E0D0',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
  }

  const totalPoints = wallet.chase_ur + wallet.amex_mr + wallet.citi_ty + wallet.bilt

  return (
    <form onSubmit={handleSubmit}>
      {/* Route */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: '#6B6460', display: 'block', marginBottom: 4 }}>出发地</label>
          <AirportInput value={origin} onChange={setOrigin} placeholder="SFO" />
        </div>
        <div style={{ color: '#6B6460', fontSize: 18, paddingTop: 20 }}>→</div>
        <div>
          <label style={{ fontSize: 11, color: '#6B6460', display: 'block', marginBottom: 4 }}>目的地</label>
          <AirportInput value={destination} onChange={setDestination} placeholder="NRT" />
        </div>
      </div>

      {/* Cabin + Passengers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 11, color: '#6B6460', display: 'block', marginBottom: 4 }}>舱位</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {CABINS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCabin(c.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: `1px solid ${cabin === c.value ? '#C8A96E' : '#2A2826'}`,
                  background: cabin === c.value ? 'rgba(200,169,110,0.12)' : '#161616',
                  color: cabin === c.value ? '#C8A96E' : '#6B6460',
                  fontSize: 13,
                  fontWeight: cabin === c.value ? 600 : 400,
                  transition: 'all 0.1s',
                }}
              >{c.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#6B6460', display: 'block', marginBottom: 4 }}>人数</label>
          <input
            type="number" min={1} max={9} value={passengers}
            onChange={e => setPassengers(parseInt(e.target.value) || 1)}
            style={{ ...inputStyle, width: 80, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Wallet summary */}
      {totalPoints > 0 && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: '#161616', borderRadius: 6, border: '1px solid #2A2826',
          fontSize: 12, color: '#9A9490',
          display: 'flex', gap: 16, flexWrap: 'wrap',
        }}>
          {([['chase_ur', 'Chase UR', '#1A6EBF'], ['amex_mr', 'Amex MR', '#007A5E'], ['citi_ty', 'Citi TY', '#CC3333'], ['bilt', 'Bilt', '#8B5CF6']] as const).map(([key, label, color]) =>
            wallet[key] > 0 && (
              <span key={key}>
                <span style={{ color }}>{label}</span>{' '}
                {wallet[key].toLocaleString()}
              </span>
            )
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !origin || !destination}
        style={{
          width: '100%',
          padding: '12px',
          background: '#C8A96E',
          color: '#0E0E0E',
          border: 'none',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 14,
          opacity: (loading || !origin || !destination) ? 0.5 : 1,
          transition: 'opacity 0.1s',
        }}
      >
        {loading ? '搜索中…' : '查找最优兑换方案'}
      </button>
    </form>
  )
}
