export interface Zone {
  bottom: number;
  top: number;
  dateTime?: string;
}

export interface ZonesInProximity {
  supplyZones: Zone[] | null;
  demandZones: Zone[] | null;
}