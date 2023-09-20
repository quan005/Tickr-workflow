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

export function isOrderVelocityIncreasing(orderVelocityQueue: FixedSizeQueue<number>): boolean {
    const orderVelocityArray = orderVelocityQueue.getItems();
    
    const velocity = linearRegressionSlope(orderVelocityArray);

    if (velocity <= 0) {
        return false
    }

    return true
};