export function isDeltaShifting(deltaArray: number[], minimumNumberOfDelta: number = 8, pullbackThreshold: number = 0.3): boolean {
    if (deltaArray.length < minimumNumberOfDelta) return false;

    const recentDeltas = deltaArray.slice(-minimumNumberOfDelta);
    let positiveChanges = 0;
    let negativeChanges = 0;

    for (let i = 1; i < recentDeltas.length; i++) {
        if (recentDeltas[i] > recentDeltas[i - 1]) {
            positiveChanges++;
        } else if (recentDeltas[i] < recentDeltas[i - 1]) {
            negativeChanges++;
        }
    }

    const totalChanges = positiveChanges + negativeChanges;
    return (positiveChanges / totalChanges > (1 - pullbackThreshold) || negativeChanges / totalChanges > (1 - pullbackThreshold));
};