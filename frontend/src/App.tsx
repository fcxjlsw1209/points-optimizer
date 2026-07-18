import { useState, useEffect } from 'react'
import { api, Wallet, OptimizeResult } from './api'
import SearchForm from './SearchForm'
import Results from './Results'
import MyWallet from './MyWallet'

type Tab = 'search' | 'wallet'

const DEFAULT_WALLET: Wallet = {
  chase_ur: 0, amex_mr: 0, citi_ty: 0, bilt: 0,
  ana: 0, united: 0, turkish: 0, air_france: 0, cathay: 0,
  aeroplan: 0, ba: 0, american: 0, alaska: 0, delta: 0,
  singapore: 0, virgin: 0, emirates: 0,
}

export default function App() {
  const [tab, setTab] = useState<Tab>('search')
  const [wallet, setWallet] = useState<Wallet>(DEFAULT_WALLET)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<OptimizeResult[] | null>(null)
  const [searchMeta, setSearchMeta] = useState<{
    origin: string; destination: string; cabin: string; passengers: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.wallet.get().then(setWallet).catch(() => {})
  }, [])

  const handleSearch = async (params: {
    origin: string; destination: string; cabin: string; passengers: number
  }) => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.optimize({ ...params, wallet })
      setResults(resp.results)
      setSearchMeta(params)
      setTab('search')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 0 16px', borderBottom: '1px solid #2A2826', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#C8A96E', letterSpacing: '0.02em' }}>
            Points Optimizer
          </span>
          <nav style={{ display: 'flex', gap: 2 }}>
            {([['search', '搜索航线'], ['wallet', '我的积分']] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${tab === t ? '#C8A96E' : 'transparent'}`,
                  cursor: 'pointer', fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: tab === t ? '#E8E0D0' : '#6B6460',
                  padding: '4px 10px',
                  transition: 'color 0.1s, border-color 0.1s',
                }}
              >{label}</button>
            ))}
          </nav>
        </div>
        <div style={{ fontSize: 11, color: '#6B6460', fontFamily: "'JetBrains Mono', monospace" }}>
          {(wallet.chase_ur + wallet.amex_mr + wallet.citi_ty + wallet.bilt).toLocaleString()} pts total
        </div>
      </header>

      {error && (
        <div style={{
          background: 'rgba(192,107,90,0.1)', border: '1px solid #C06B5A',
          borderRadius: 6, padding: '12px 16px', marginBottom: 16, color: '#C06B5A', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {tab === 'search' && (
        <div>
          <SearchForm wallet={wallet} onSearch={handleSearch} loading={loading} />
          {results !== null && searchMeta && (
            <div style={{ marginTop: 28 }}>
              <Results
                results={results}
                origin={searchMeta.origin}
                destination={searchMeta.destination}
                cabin={searchMeta.cabin}
                passengers={searchMeta.passengers}
                wallet={wallet}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'wallet' && (
        <MyWallet wallet={wallet} onChange={setWallet} />
      )}
    </div>
  )
}
