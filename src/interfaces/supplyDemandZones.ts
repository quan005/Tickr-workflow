export interface Zone {
  bottom: number;
  top: number;
  datetime?: string;
}

export interface ZonesInProximity {
  supplyZones: Zone[] | null;
  demandZones: Zone[] | null;
}