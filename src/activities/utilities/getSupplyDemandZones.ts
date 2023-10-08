import { Zone, ZonesInProximity } from '@src/interfaces/supplyDemandZones';

function filterZonesSurroundingPrice(currentPrice: number, zones: Zone[], supply: boolean = false): Zone[] | null {
  const sortedZones = [...zones].sort((a, b) => b.top - a.top);

  if (!supply) {
    for (let i = 0; i < sortedZones.length; i++) {
      const zone = sortedZones[i];
      if (currentPrice <= zone.top && currentPrice >= zone.bottom) {
        if (i === 0) {
          console.log(`if`);
          return [sortedZones[i], null];
        }
        else {
          console.log(`else`);
          return [sortedZones[i], sortedZones[i - 1]];
        }
      }
    }

    for (let i = 0; i < sortedZones.length; i++) {
      const zone = sortedZones[i];
      if (i > 0 && currentPrice < zone.top && currentPrice > sortedZones[i + 1].top || i === sortedZones.length - 1) {
        return [sortedZones[i], sortedZones[i - 1]]
      }

      if (i === 0 && currentPrice < zone.top && currentPrice > sortedZones[i + 1].top) {
        return [sortedZones[i], null]
      }
    }
  }
  
  for (let i = 0; i < sortedZones.length; i++) {
    const zone = sortedZones[i];
    if (currentPrice <= zone.top && currentPrice >= zone.bottom) {
      if (i === sortedZones.length - 1) {
        return [sortedZones[i], null];
      }
      else {
        return [sortedZones[i], sortedZones[i + 1]];
      }
    }
  }


  for (let i = 0; i < sortedZones.length; i++) {
    const zone = sortedZones[i];
    if (i === sortedZones.length - 1 ){
      return [sortedZones[i], null];
    }

    if (i === sortedZones.length - 2 && currentPrice > sortedZones[i + 1].top){
      return [sortedZones[i + 1], null];
    }
    
    if (i > 0 && currentPrice < zone.top && currentPrice > sortedZones[i + 1].top && i !== sortedZones.length - 2 || i == 0 && currentPrice < zone.top && currentPrice > sortedZones[i + 1].top) {
      return [sortedZones[i], sortedZones[i + 2]];
    }
  }
};

export async function findZones(
  currentPrice: number, 
  supplyZones: Zone[],
  demandZones: Zone[],
): Promise<ZonesInProximity> {
  const filteredSupplyZones = filterZonesSurroundingPrice(currentPrice, supplyZones, true);
  const filteredDemandZones = filterZonesSurroundingPrice(currentPrice, demandZones);

  return {
    supplyZones: filteredSupplyZones,
    demandZones: filteredDemandZones,
  };
}