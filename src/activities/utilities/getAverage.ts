export function getAverage(array: number[]): number {
    if (!Array.isArray(array) || array.length === 0) return 0;

    return array.reduce((acc, val) => acc + val, 0) / array.length;
};