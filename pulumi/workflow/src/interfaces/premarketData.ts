import { SupplyZones, DemandZones } from "./supplyDemandZones";
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
  demandZones: DemandZones[],
  supplyZones: SupplyZones[],
}