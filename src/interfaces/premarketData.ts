import { SupplyDemandZones } from "./supplyDemandZones"
export interface PremarketData {
  limit: number,
  budget: number,
  client_id: string,
  account_id: string,
  token: {
    access_token: string,
    refresh_token: string,
    scope: string,
    expires_in: number
    refresh_token_expires_in: number
    token_type: string
    access_token_expires_at: number
    refresh_token_expires_at: number
    logged_in: boolean
    access_token_expires_at_date: string
    refresh_token_expires_at_date: string
  },
  symbol: string,
  score: number,
  sentiment: string,
  keyLevels: number[],
  supportResistance: {support: number, resistance: number},
  demandZones: SupplyDemandZones[][],
  supplyZones: SupplyDemandZones[][],
}