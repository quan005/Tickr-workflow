"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = void 0;
function round(value, interval) {
    const v = Math.round(value);
    if (interval === 5) {
        const tenthValue = roundIntervalFive(v % 10);
        return Math.floor(v / 10) * 10 + tenthValue;
    }
    else if (interval === 10) {
        return Math.round(v / 10) * 10;
    }
    else {
        return v;
    }
}
exports.round = round;
function roundIntervalFive(tenth) {
    return intervalFive.get(tenth);
}
const intervalFive = new Map([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [7, 5],
    [8, 10],
    [9, 10],
]);
