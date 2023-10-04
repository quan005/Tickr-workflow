import { Zone, ZonesInProximity } from '@src/interfaces/supplyDemandZones';

function filterZonesSurroundingPrice(currentPrice: number, zones: Zone[]): Zone[] {
  // Sort the zones based on the 'top' value
  const sortedZones = [...zones].sort((a, b) => b.top - a.top);

  for (let i = 0; i < sortedZones.length; i++) {
    const zone = sortedZones[i];
    if (currentPrice > zone.top) {
      // If currentPrice is greater than the top of the first zone
      if (i === 0) {
        return [sortedZones[0], sortedZones[1]];
      }
      // If currentPrice is less than zone[i] top, and greater than zone[i] bottom
      else if (currentPrice > zone.bottom) {
        // If zone is the last zone
        if (i === sortedZones.length - 1) {
          return [sortedZones[i - 1], sortedZones[i]];
        } else {
          return [sortedZones[i], sortedZones[i + 1]];
        }
      }
      // If currentPrice lies in between zone[i] top and zone[i+1] bottom
      else if (i < sortedZones.length - 1 && currentPrice > sortedZones[i + 1].bottom) {
        return [sortedZones[i], sortedZones[i + 1]];
      }
    }
  }

  // If currentPrice is less than the bottom of the last zone
  return [sortedZones[sortedZones.length - 2], sortedZones[sortedZones.length - 1]];
};

export async function findZones(
  currentPrice: number, 
  supplyZones: Zone[],
  demandZones: Zone[]
): Promise<ZonesInProximity> {
  const filteredSupplyZones = filterZonesSurroundingPrice(currentPrice, supplyZones);
  const filteredDemandZones = filterZonesSurroundingPrice(currentPrice, demandZones);

  return {
    supplyZones: filteredSupplyZones,
    demandZones: filteredDemandZones,
  };
}