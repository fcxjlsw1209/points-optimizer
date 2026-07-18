import { OptimizeResult, Wallet } from './api'

const CURRENCY_COLOR: Record<string, string> = {
  chase_ur: '#1A6EBF',
  amex_mr:  '#007A5E',
  citi_ty:  '#CC3333',
  bilt:     '#8B5CF6',
}

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

interface Props {
  results: OptimizeResult[]
  origin: string
  destination: string
  cabin: string
  passengers: number
  wallet: Wallet
}

export default function Results({ results, origin, destination, cabin, passengers, wallet }: Props) {
  if (results.length === 0) {
    return (
      <div style={{ padding: '32px 0', color: '#6B6460', textAlign: 'center' }}>
        没有找到 {origin} → {destination} 的兑换方案。<br />
        <span style={{ fontSize: 12 }}>请检查机场代码或尝试其他目的地。</span>
      </div>
    )
  }

  const cabinLabel: Record<string, string> = {
    economy: '经济舱', business: '商务舱', first: '头等舱'
  }

  return (
    <div>
      <div style={{ marginBottom: 20, fontSize: 13, color: '#9A9490' }}>
        {origin} → {destination} · {cabinLabel[cabin] ?? cabin} · {passengers}人 · 找到 {results.length} 个方案
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map((r, i) => (
          <ResultCard key={i} result={r} wallet={wallet} />
        ))}
      </div>
    </div>
  )
}

function ResultCard({ result: r, wallet }: { result: OptimizeResult; wallet: Wallet }) {
  const color = CURRENCY_COLOR[r.currency] ?? '#C8A96E'
  const pct = r.miles_needed > 0 ? Math.min(1, r.available_miles / r.miles_needed) : 0

  return (
    <div style={{
      background: '#161616',
      border: `1px solid ${r.can_redeem_now ? 'rgba(200,169,110,0.4)' : '#2A2826'}`,
      borderRadius: 10,
      padding: '16px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{r.program_name}</div>
          <div style={{ fontSize: 11, color: '#6B6460', marginTop: 2 }}>{r.airline}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {r.can_redeem_now ? (
            <span style={{
              background: 'rgba(22,101,52,0.3)', color: '#4ade80',
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>现在可兑换</span>
          ) : (
            <span style={{
              background: 'rgba(127,29,29,0.3)', color: '#f87171',
              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>差 {fmt(r.gap)} miles</span>
          )}
        </div>
      </div>

      {/* Miles bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A9490', marginBottom: 4 }}>
          <span>需要 <strong style={{ color: '#E8E0D0' }}>{fmt(r.miles_needed)}</strong> miles</span>
          <span>
            {r.is_direct
              ? <span style={{ background: 'rgba(200,169,110,0.15)', color: '#C8A96E', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>直接持有</span>
              : <>via <strong style={{ color }}>{r.currency_label}</strong> → {r.program_name}</>
            }
          </span>
        </div>
        <div style={{ height: 6, background: '#2A2826', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: r.can_redeem_now ? '#C8A96E' : color,
            borderRadius: 3,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6460', marginTop: 4 }}>
          <span>你有 {fmt(r.available_miles)} miles</span>
          <span>{Math.round(pct * 100)}%</span>
        </div>
      </div>

      {/* Notes */}
      {r.notes && (
        <div style={{ fontSize: 11, color: '#6B6460', marginBottom: r.recommended_cards.length > 0 ? 12 : 0, fontStyle: 'italic' }}>
          {r.notes}
        </div>
      )}

      {/* Recommended cards */}
      {r.recommended_cards.length > 0 && (
        <div style={{ borderTop: '1px solid #2A2826', paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: '#9A9490', marginBottom: 8 }}>开卡补齐缺口：</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {r.recommended_cards.map((card, i) => (
              <div key={i} style={{
                background: '#0E0E0E', borderRadius: 8, padding: '10px 12px',
                border: '1px solid #2A2826',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{card.name}</div>
                    <div style={{ fontSize: 11, color: '#6B6460', marginTop: 2 }}>
                      SUB <span style={{ color: '#C8A96E' }}>{fmt(card.sub_points)} pts</span>
                      {' '}· 消费 ${fmt(card.sub_spend)}/{card.sub_months}月
                      {card.annual_fee > 0 ? ` · 年费 $${card.annual_fee}` : ' · 免年费'}
                    </div>
                    {card.earning_highlights && (
                      <div style={{ fontSize: 11, color: '#6B6460', marginTop: 4, fontStyle: 'italic' }}>
                        {card.earning_highlights}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#9A9490', flexShrink: 0, marginLeft: 12 }}>
                    兑换后剩余<br />
                    <span style={{ color: '#C8A96E', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      +{fmt(card.leftover_miles)}
                    </span>
                  </div>
                </div>
                {(card.key_benefits ?? []).length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(card.key_benefits ?? []).slice(0, 4).map((b, j) => (
                      <span key={j} style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 10,
                        background: 'rgba(200,169,110,0.08)', color: '#9A9490',
                        border: '1px solid rgba(200,169,110,0.15)',
                      }}>{b}</span>
                    ))}
                    {(card.key_benefits ?? []).length > 4 && (
                      <span style={{ fontSize: 10, color: '#6B6460', padding: '2px 4px' }}>
                        +{(card.key_benefits ?? []).length - 4} 更多
                      </span>
                    )}
                  </div>
                )}
                {card.notes && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#6B6460', fontStyle: 'italic' }}>
                    ⚠ {card.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
