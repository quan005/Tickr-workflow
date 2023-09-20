import { Zone, ZonesInProximity } from '@src/interfaces/supplyDemandZones';

function filterZonesSurroundingPrice(currentPrice: number, zones: Zone[]): Zone[] {
  return zones.filter((zone) => currentPrice >= zone.bottom && currentPrice <= zone.top);
};

export async function findZones(
  currentPrice: number, 
  supplyZones: Zone[],
  demandZones: Zone[]
): Promise<ZonesInProximity> {
  let filteredSupplyZones = filterZonesSurroundingPrice(currentPrice,supplyZones);
  let filteredDemandZones = filterZonesSurroundingPrice(currentPrice, demandZones);

  const sortZonesByDistance = (zones: Zone[]): Zone[] => {
    return zones.sort(
      (a, b) => Math.abs(currentPrice - a.top) - Math.abs(currentPrice - b.top)
    );
  };

  if (filteredSupplyZones.length === 0) {
    supplyZones = sortZonesByDistance(supplyZones);
    filteredSupplyZones =
      currentPrice < supplyZones[0].bottom
        ? [supplyZones[0], supplyZones[1]]
        : [supplyZones[supplyZones.length - 1], supplyZones[supplyZones.length - 2]];
  }

  if (filteredDemandZones.length === 0) {
    demandZones = sortZonesByDistance(demandZones);
    filteredDemandZones =
      currentPrice < demandZones[0].bottom
        ? [demandZones[0], demandZones[1]]
        : [demandZones[demandZones.length - 1], demandZones[demandZones.length - 2]];
  }

  return {
    supplyZones: filteredSupplyZones,
    demandZones: filteredDemandZones,
  };
}