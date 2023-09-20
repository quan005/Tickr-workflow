import { DeltaMetrics } from "@src/interfaces/delta";
import { getAverage } from "./getAverage";
import { FixedSizeQueue } from "./classes";

export type Trend = 'uptrend' |
'downtrend' |
'sideways' | 
'potential pullback in uptrend' | 
'potential pullback in downtrend' | 
'data insufficient';

export function getTrend(metricsQueue: FixedSizeQueue<DeltaMetrics>): Trend {
    const metricsArray = metricsQueue.getItems();
    const longTermDeltas = metricsArray.flatMap(m => m.deltas);
    const shortTermDeltas = metricsArray.slice(-7).flatMap(m => m.deltas);

    if (longTermDeltas.length < 2 || shortTermDeltas.length < 2) {
        return 'data insufficient';
    }

    const shortTermAverage = getAverage(shortTermDeltas);
    const longTermAverage = getAverage(longTermDeltas);

    const recentMetrics = metricsArray[metricsArray.length - 1];
    const cumulativeTrendDirection = recentMetrics.cumulativeDelta && recentMetrics.cumulativeDelta >= 0 ? 'uptrend' : 'downtrend';

    if (cumulativeTrendDirection === 'uptrend') {
        if (shortTermAverage >= longTermAverage && recentMetrics.maxDelta > Math.abs(recentMetrics.minDelta)) {
            return 'uptrend';
        } else if (shortTermAverage < longTermAverage) {
            return 'potential pullback in uptrend';
        }
    } else if (cumulativeTrendDirection === 'downtrend') {
        if (shortTermAverage <= longTermAverage && recentMetrics.minDelta < Math.abs(recentMetrics.maxDelta)) {
            return 'downtrend';
        } else if (shortTermAverage > longTermAverage) {
            return 'potential pullback in downtrend';
        }
    }

    return 'sideways';
};