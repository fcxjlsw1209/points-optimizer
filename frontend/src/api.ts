const BASE = '/api'

export interface Wallet {
  // Credit card currencies
  chase_ur: number
  amex_mr: number
  citi_ty: number
  bilt: number
  // Airline miles (direct holdings)
  ana: number
  united: number
  turkish: number
  air_france: number
  cathay: number
  aeroplan: number
  ba: number
  american: number
  alaska: number
  delta: number
  singapore: number
  virgin: number
  emirates: number
}

export interface RecommendedCard {
  id: string
  name: string
  sub_points: number
  sub_spend: number
  sub_months: number
  annual_fee: number
  leftover_miles: number
  key_benefits: string[]
  earning_highlights: string
  notes: string
}

export interface OptimizeResult {
  program_id: string
  program_name: string
  airline: string
  notes: string
  currency: string
  currency_label: string
  ratio: number
  miles_needed: number
  available_miles: number
  gap: number
  can_redeem_now: boolean
  recommended_cards: RecommendedCard[]
  is_direct?: boolean
}

export interface OptimizeResponse {
  origin: string
  destination: string
  cabin: string
  passengers: number
  wallet: Wallet
  results: OptimizeResult[]
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  wallet: {
    get: () => request<Wallet>('/wallet'),
    update: (wallet: Wallet) => request<Wallet>('/wallet', {
      method: 'PUT',
      body: JSON.stringify(wallet),
    }),
  },
  optimize: (params: {
    origin: string
    destination: string
    cabin: string
    passengers: number
    wallet: Wallet
  }) => request<OptimizeResponse>('/optimize', {
    method: 'POST',
    body: JSON.stringify(params),
  }),
}
