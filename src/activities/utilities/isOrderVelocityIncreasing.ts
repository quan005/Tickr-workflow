import { FixedSizeQueue } from "./classes";

export function linearRegressionSlope(y: number[]): number {
    const x = [...Array(y.length).keys()];  // Generates [0, 1, 2, ...]
    const n = y.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXX = x.map(val => val * val).reduce((a, b) => a + b, 0);
    const sumXY = x.map((val, index) => val * y[index]).reduce((a, b) => a + b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
};

export function exponentialRegressionSlope(y: number[]): number | null {
    // Filter out y-values that are <= 0, as ln(y) would be undefined
    const filteredY = y.filter(val => val > 0);
    if (filteredY.length < 5) return null;  // Insufficient points for regression
    
    const lnY = filteredY.map(val => Math.log(val));
    return linearRegressionSlope(lnY);
};

export function isOrderVelocityIncreasing(orderVelocityQueue: FixedSizeQueue<number>): boolean {
    const orderVelocityArray = orderVelocityQueue.getItems();
    
    const velocity = exponentialRegressionSlope(orderVelocityArray);

    if (velocity === null || velocity <= 0) {
        console.log('velocity is not increasing', velocity);
        return false
    }

    console.log('velocity is going up', velocity);
    return true
};