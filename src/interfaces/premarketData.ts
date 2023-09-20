import { Zone } from "./supplyDemandZones";

export interface PremarketMessage {
  Premarket: PremarketData
}
export interface PremarketData {
  limit: number,
  budget: number,
  client_id: string,
  account_id: string,
  symbol: string,
  score: number,
  sentiment: string,
  keyLevels: number[],
  supportResistance: { support: number, resistance: number },
  demandZones: Zone[],
  supplyZones: Zone[],
  messageNumber?: number
}