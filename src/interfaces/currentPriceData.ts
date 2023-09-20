import { Zone } from "./supplyDemandZones";

export interface CurrentPriceData {
  error?: string;
  closePrice?: number;
  demandZone?: Zone[];
  supplyZone?: Zone[];
}